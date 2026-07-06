export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0c0c14 0%, #141422 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <p><strong className="text-white">Last updated:</strong> July 2025</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p>By using ConvertFlow (&quot;the Service&quot;), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Description of Service</h2>
          <p>ConvertFlow provides free and premium online conversion tools including data format converters (JSON, CSV, XML, YAML), text converters (Markdown, HTML), image converters, encoding tools, hash generators, and developer utilities. All processing occurs client-side in your browser.</p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Free Tier</h2>
          <p>The free tier allows up to 10 conversions per day across all tools. The daily counter resets at midnight based on your local timezone. We reserve the right to change the daily limit at any time.</p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Premium Plans</h2>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Pro Monthly:</strong> $2/month — unlimited conversions, all formats, batch processing.</li>
            <li><strong>Pro Lifetime:</strong> $29 one-time — all monthly benefits forever.</li>
          </ul>
          <p className="mt-2">Payments are processed through LemonSqueezy. Prices are in USD. Premium status is stored locally in your browser. Clearing browser data will reset your premium status — contact us to restore it.</p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Accuracy Disclaimer</h2>
          <p>While we strive for accuracy, conversion results may vary for complex inputs. We recommend verifying critical conversions. ConvertFlow is provided &quot;as is&quot; without warranties of any kind, express or implied, including accuracy, reliability, or fitness for a particular purpose.</p>

          <h2 className="text-xl font-semibold text-white mt-8">6. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Do not use the Service for any illegal purpose.</li>
            <li>Do not attempt to abuse, overload, or disrupt the Service.</li>
            <li>You are responsible for the content you convert.</li>
            <li>Do not use automated systems to bypass usage limits.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">7. Intellectual Property</h2>
          <p>The ConvertFlow website, design, and code are our intellectual property. You may not copy, modify, or redistribute the Service. Content you convert remains your property.</p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Limitation of Liability</h2>
          <p>ConvertFlow shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to data loss, inaccurate conversions, or service interruptions.</p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Contact</h2>
          <p>For questions about these Terms, please contact us through our website.</p>
        </div>
      </div>
    </div>
  );
}