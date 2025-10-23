import QRCode from 'qrcode';

export async function GET() {

    return new Response(await QRCode.toString('blingbloing'), {

    });
}