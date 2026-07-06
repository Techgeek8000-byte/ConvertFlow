export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0c0c14 0%, #141422 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <p><strong className="text-white">Last updated:</strong> July 2025</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Overview</h2>
          <p>ConvertFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides online file, data, and image conversion tools. This Privacy Policy explains how we handle your information when you use our website at convertflow.vercel.app (the &quot;Service&quot;).</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Client-Side Processing</h2>
          <p>All conversions happen directly in your browser. Your files, text, and data are never uploaded to our servers. Everything is processed locally on your device using JavaScript. We do not store, transmit, or have access to any content you convert.</p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Information We Collect</h2>
          <p>We collect minimal information to operate the Service:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Usage data:</strong> We track how many conversions you perform per day (stored locally in your browser via localStorage) to enforce free tier limits.</li>
            <li><strong>Premium status:</strong> If you purchase a premium plan via LemonSqueezy, your premium status is stored locally in your browser. We do not maintain a user database.</li>
            <li><strong>Analytics:</strong> We use Google Analytics (GA ID: G-CMV34ZVLE7) to collect anonymous usage data such as page views, tool usage frequency, and general geographic location. This helps us improve the Service.</li>
            <li><strong>Advertising:</strong> We use Google AdSense (Publisher ID: ca-pub-7878398091851771) to display ads. AdSense may use cookies to serve personalized ads based on your browsing history. You can opt out of personalized ads at Google&apos;s Ad Settings.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Cookies</h2>
          <p>We use localStorage (not cookies) to store your daily usage count and premium status. Google AdSense and Google Analytics may set their own cookies. These are third-party cookies governed by Google&apos;s respective privacy policies.</p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Third-Party Services</h2>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>LemonSqueezy:</strong> Processes payments for premium plans. Their privacy policy governs payment data handling.</li>
            <li><strong>Google Analytics:</strong> Collects anonymous usage analytics.</li>
            <li><strong>Google AdSense:</strong> Serves advertisements.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Data Security</h2>
          <p>Since all conversions happen client-side, your data never leaves your device. We employ HTTPS encryption for all connections to our website. We do not collect, store, or process any of your conversion content.</p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Children&apos;s Privacy</h2>
          <p>Our Service is not directed at children under 13. We do not knowingly collect personal information from children.</p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Contact</h2>
          <p>If you have questions about this Privacy Policy, please contact us through our website.</p>
        </div>
      </div>
    </div>
  );
}