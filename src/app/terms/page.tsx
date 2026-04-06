import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions - QRky",
  description: "Terms and Conditions for using QRky URL shortening and QR code generation services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-base-content/70 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
          <p>
            QRky is a free URL shortening and QR code generation service that allows users to create shortened URLs 
            and generate QR codes for any web address. Our service is provided free of charge with no registration required 
            for basic usage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
          <p>By using QRky, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Not use the service for any illegal or unlawful purpose</li>
            <li>Not create shortened URLs or QR codes that redirect to malicious or harmful websites</li>
            <li>Not attempt to spam, phish, or engage in any form of abusive behavior</li>
            <li>Not use the service to bypass security measures or gain unauthorized access</li>
            <li>Not distribute malware, viruses, or any other harmful code</li>
            <li>Not engage in activities that could harm, disrupt, or interfere with the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Content Policies</h2>
          <p>
            You may not use QRky to create content that:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Violates any laws or regulations</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains defamatory, obscene, or hateful content</li>
            <li>Promotes violence or illegal activities</li>
            <li>Attempts to impersonate any person or organization</li>
            <li>Contains phishing attempts or fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Service Limitations and Disclaimers</h2>
          <p>
            QRky is provided &quot;as is&quot; without any warranties, express or implied. We do not guarantee:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Uninterrupted or error-free service</li>
            <li>The availability of any specific shortened URL</li>
            <li>The security or privacy of your data</li>
            <li>The accuracy or reliability of any content</li>
          </ul>
          <p className="mt-4">
            We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Account Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to the service immediately, without prior notice or liability, 
            for any reason, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Violation of these Terms and Conditions</li>
            <li>Creation of malicious or harmful content</li>
            <li>Abuse or misuse of the service</li>
            <li>Illegal activities</li>
            <li>Requests from law enforcement or legal authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p>
            All shortened URLs and QR codes you create using QRky belong to you or your organization. You retain 
            full ownership of any content you link to through our service.
          </p>
          <p className="mt-4">
            The QRky service, including our name, logo, and all associated materials, are protected by intellectual 
            property rights owned by QRky.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            In no event shall QRky, its owners, employees, or affiliates be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including without limitation, loss of profits, data, use, 
            goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Your use or inability to use the service</li>
            <li>Any unauthorized access to or use of our servers</li>
            <li>Any interruption or cessation of transmission to or from the service</li>
            <li>Any bugs, viruses, or the like that may be transmitted through the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law and Jurisdiction</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with applicable laws. 
            Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts 
            in the relevant jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Any changes will be effective 
            immediately upon posting on this page. Your continued use of the service after any changes constitutes 
            acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us. For copyright issues 
            or DMCA requests, please contact our designated agent.
          </p>
          <p className="mt-4">
            We respond to reports of abuse and will take appropriate action against users who violate these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Privacy</h2>
          <p>
            Your privacy is important to us.             Please review our <Link href="/privacy" className="link link-secondary">Privacy Policy</Link> to understand how we collect, 
            use, and protect your information.
          </p>
        </section>
      </div>
    </div>
  );
}
