import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

const THROTTLE_MS = 250;
const RETRY_429_MS = 2000;
const MAX_429_RETRIES = 3;
const CSV_PATH = 'tmp/reactivation-contacts.csv';
const CSV_HEADER = 'email,first_name,confirmation_url,product\n';

type AdminClient = ReturnType<typeof createClient>['auth']['admin'];

interface RunResult {
    email: string;
    firstName: string;
    status: 'link' | 'skipped' | 'failed';
    message?: string;
}

interface Contact {
    email: string;
    first_name: string;
    confirmation_url: string;
    product: string;
}

function parseCreatedBefore(args: string[]): Date {
    const flag = args.find((arg) => arg.startsWith('--created-before='));
    if (!flag) {
        console.error('Usage: pnpm dlx tsx scripts/reactivate-unverified.ts --created-before=<ISO>');
        process.exit(1);
    }
    const date = new Date(flag.split('=')[1]);
    if (Number.isNaN(date.getTime())) {
        console.error(`Invalid --created-before value: ${flag}`);
        process.exit(1);
    }
    return date;
}

/** Keeps users whose email was never confirmed, who have an email address,
 * were created on or before the cutoff, and are not banned. */
function filterUnverifiedUsers(users: User[], cutoff: Date): User[] {
    return users.filter((user) =>
        user.email != null &&
        user.email_confirmed_at == null &&
        (user as User & { banned_until?: string | null }).banned_until == null &&
        new Date(user.created_at) <= cutoff
    );
}

/** Builds the email link: routes through the app's existing /auth/confirm
 * route (server-side verifyOtp + cookies), landing on /dashboard logged in. */
function buildConfirmationLink(appUrl: string, hashedToken: string): string {
    const redirectTo = encodeURIComponent(`${appUrl}/dashboard`);
    const token = encodeURIComponent(hashedToken);
    return `${appUrl}/auth/confirm?token=${token}&type=signup&redirect_to=${redirectTo}`;
}

function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
}

/** Serializes contacts to Mailjet-uploadable CSV (RFC 4180 quoting). */
function toCsv(contacts: Contact[]): string {
    return contacts.reduce(
        (csv, contact) =>
            csv + `${csvEscape(contact.email)},${csvEscape(contact.first_name)},${csvEscape(contact.confirmation_url)},${csvEscape(contact.product)}\n`,
        CSV_HEADER
    );
}

async function generateLinkWithRetry(
    admin: AdminClient,
    params: Parameters<AdminClient['generateLink']>[0],
) {
    for (let attempt = 0; ; attempt++) {
        const { data, error } = await admin.generateLink(params);
        if (error?.status === 429 && attempt < MAX_429_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_429_MS * (attempt + 1)));
            continue;
        }
        return { data, error };
    }
}

async function fetchAllUsers(admin: AdminClient): Promise<User[]> {
    const users: User[] = [];
    let page = 1;
    // listUsers returns up to 1000 per page; loop until a short page arrives.
    for (;;) {
        const { data, error } = await admin.listUsers({ page, perPage: 1000 });
        if (error) {
            throw error;
        }
        users.push(...data.users);
        if (data.users.length < 1000) {
            return users;
        }
        page += 1;
    }
}

async function generateLinks(users: User[]): Promise<RunResult[]> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!
    );
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const results: RunResult[] = [];

    for (const user of users) {
        const email = user.email;
        if (!email) {
            results.push({ email: '(none)', firstName: '', status: 'failed', message: 'User has no email' });
            continue;
        }

        const { data, error } = await generateLinkWithRetry(supabase.auth.admin, {
            type: 'signup',
            email,
            // Required by TS types; ignored by the server for existing users.
            // Never set options.data — it would merge into user_metadata.
            password: crypto.randomUUID(),
        });

        if (error) {
            // 422 means the user confirmed between fetch and generate — skip, not fail.
            const alreadyConfirmed = error.status === 422;
            results.push({
                email,
                firstName: '',
                status: alreadyConfirmed ? 'skipped' : 'failed',
                message: error.message,
            });
        } else if (data?.properties?.hashed_token) {
            results.push({
                email,
                firstName: (data.user?.user_metadata?.first_name as string | undefined) ?? '',
                status: 'link',
                message: buildConfirmationLink(appUrl, data.properties.hashed_token),
            });
        } else {
            results.push({ email, firstName: '', status: 'failed', message: 'No hashed_token in response' });
        }

        await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS));
    }

    return results;
}

async function main() {
    const cutoff = parseCreatedBefore(process.argv.slice(2));
    console.log(`Cutoff: ${cutoff.toISOString()}`);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!
    );

    console.log('Fetching users...');
    const users = await fetchAllUsers(supabase.auth.admin);
    const cohort = filterUnverifiedUsers(users, cutoff);
    console.log(`Found ${cohort.length} unverified user(s) (of ${users.length} total) matching the cohort.`);

    if (cohort.length === 0) {
        return;
    }

    console.log('Generating links...');
    const results = await generateLinks(cohort);

    const contacts: Contact[] = results
        .filter((result) => result.status === 'link')
        .map((result) => ({
            email: result.email,
            first_name: result.firstName,
            confirmation_url: result.message!,
            product: 'qrky',
        }));

    await mkdir('tmp', { recursive: true });
    await writeFile(CSV_PATH, toCsv(contacts), 'utf-8');

    console.log(`\nWrote ${contacts.length} contact(s) to ${CSV_PATH}`);
    console.table(results.map(({ email, firstName, status }) => ({ email, firstName, status })));

    const failures = results.filter((result) => result.status === 'failed');
    if (failures.length > 0) {
        console.error(`\n${failures.length} failure(s):`);
        for (const failure of failures) {
            console.error(`  ${failure.email}: ${failure.message}`);
        }
        process.exitCode = 1;
    }

    console.log('\nReminder: links expire after 96h (hosted OTP expiry). Generate and send in the same sitting.');
    console.log('Do NOT re-run this script after the campaign is sent — regenerating links invalidates the ones already emailed.');
    console.log('The CSV contains bearer links — delete it after uploading to Mailjet.');
}

void main();