/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LegalLayout, { LegalSection, LegalSubSection, LegalList } from "./LegalLayout";

interface CookieRow {
  name: string;
  provider: string;
  purpose: string;
  type: string;
  expiry: string;
}

function CookieTable({ rows }: { rows: CookieRow[] }) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-xs text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest">
            <th className="py-2 pr-4 font-semibold">Cookie Name</th>
            <th className="py-2 pr-4 font-semibold">Provider</th>
            <th className="py-2 pr-4 font-semibold">Purpose</th>
            <th className="py-2 pr-4 font-semibold">Type</th>
            <th className="py-2 font-semibold">Expiry</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 text-gray-400">
              <td className="py-2.5 pr-4 font-mono text-gold/80">{row.name}</td>
              <td className="py-2.5 pr-4">{row.provider}</td>
              <td className="py-2.5 pr-4">{row.purpose}</td>
              <td className="py-2.5 pr-4">{row.type}</td>
              <td className="py-2.5">{row.expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="This Cookie Policy explains how S.Blends Barbershop uses cookies and similar tracking technologies on sblendsbarbershop.ca, and how you can control them."
      lastUpdated="March 13, 2026"
    >
      <div className="bg-noir-light border border-white/10 rounded-2xl p-6 mb-10 text-sm text-gray-400 leading-relaxed">
        <span className="text-gold font-semibold uppercase tracking-widest text-xs block mb-2">What This Policy Covers</span>
        This Cookie Policy applies to the website <strong className="text-white">sblendsbarbershop.ca</strong> operated by <strong className="text-white">S.Blends Barbershop</strong> (Oakville, Ontario). It explains what cookies are, which cookies we use, why we use them, and how you can manage your cookie preferences. This Policy should be read alongside our <a href="/privacy-policy" className="text-gold hover:underline">Privacy Policy</a>.
      </div>

      <LegalSection heading="1. What Are Cookies?">
        <p>
          Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work, improve site performance, and to provide information to the website owner. Cookies allow a website to recognize your device during and between browsing sessions.
        </p>
        <p>
          Cookies are not viruses or malware. They cannot run programs, deliver harmful software, or access your personal files. They are simply a standard mechanism used by virtually all websites to improve functionality and user experience.
        </p>
        <LegalSubSection heading="Related Technologies">
          <p>In addition to cookies, we may use the following similar technologies:</p>
          <LegalList items={[
            "Web Beacons (pixel tags) — small invisible images embedded in web pages or emails that track whether a page was visited or an email was opened;",
            "Local Storage — browser-based storage used to save session preferences locally on your device;",
            "Session Storage — temporary data stored only while your browser tab is open;",
            "Scripts — JavaScript code that facilitates tracking and analytics functionality."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="2. Categories of Cookies We Use">
        <LegalSubSection heading="2.1 Strictly Necessary Cookies">
          <p>
            These cookies are essential for the website to function correctly and securely. They enable core functionality such as page navigation, security mechanisms, and access to secure areas. The website cannot function properly without these cookies, and they cannot be disabled.
          </p>
          <p>
            Examples include session management cookies that maintain your state as you navigate the site, and security cookies that help identify and prevent fraudulent activity.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="2.2 Analytics &amp; Performance Cookies">
          <p>
            These cookies help us understand how visitors interact with our website by collecting information anonymously and in aggregate form. This data helps us improve the structure, content, and performance of our website. No personally identifiable information is collected by these cookies unless you have explicitly provided it.
          </p>
          <p>
            We use <strong className="text-white">Google Analytics</strong> (provided by Google LLC) to collect anonymized usage data. By default, Google Analytics anonymizes IP addresses. Aggregated data is used solely for internal website improvement purposes.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="2.3 Functional Cookies">
          <p>
            These cookies allow the website to remember choices you have made (such as language preferences or previously viewed content) to provide a more personalized experience. They do not track your browsing activity across other websites.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="2.4 Third-Party Cookies">
          <p>
            Some features of our website are powered by third-party services that may set their own cookies. These third-party cookies are governed by the respective third party&apos;s privacy and cookie policies, which we do not control.
          </p>
          <p>Third-party services that may set cookies on our website include:</p>
          <LegalList items={[
            "Booksy — embedded booking widget, for tracking booking sessions and preferences;",
            "Google Maps — embedded map iframes may set cookies related to Google's mapping services;",
            "Google Analytics — sets analytics identifiers to track website usage patterns."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="3. Specific Cookies Used on This Website">
        <p>The following table identifies the main cookies currently in use or reasonably expected on sblendsbarbershop.ca:</p>

        <div className="mt-2">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">Strictly Necessary</p>
          <CookieTable rows={[
            { name: "__session", provider: "S.Blends (sblendsbarbershop.ca)", purpose: "Maintains the current user session and security state while navigating the website.", type: "Session", expiry: "End of browser session" },
            { name: "csrf_token", provider: "S.Blends (sblendsbarbershop.ca)", purpose: "Cross-site request forgery protection token to secure form submissions.", type: "Session", expiry: "End of browser session" }
          ]} />
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">Analytics &amp; Performance</p>
          <CookieTable rows={[
            { name: "_ga", provider: "Google Analytics (Google LLC)", purpose: "Registers a unique ID to generate statistical data on how you use the website.", type: "Persistent", expiry: "2 years" },
            { name: "_gid", provider: "Google Analytics (Google LLC)", purpose: "Registers a unique ID used to generate statistical data on website usage.", type: "Persistent", expiry: "24 hours" },
            { name: "_gat", provider: "Google Analytics (Google LLC)", purpose: "Used to throttle the rate of requests to Google Analytics.", type: "Persistent", expiry: "1 minute" },
            { name: "_ga_[ID]", provider: "Google Analytics (Google LLC)", purpose: "Used to persist session state across Google Analytics 4 measurement.", type: "Persistent", expiry: "2 years" }
          ]} />
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">Third-Party (Booksy Widget)</p>
          <CookieTable rows={[
            { name: "booksy_session", provider: "Booksy Inc. (booksy.com)", purpose: "Maintains your booking session state within the embedded Booksy scheduling widget.", type: "Session", expiry: "End of browser session" },
            { name: "booksy_*", provider: "Booksy Inc. (booksy.com)", purpose: "Various Booksy tracking and preference cookies set when the Booksy booking widget is loaded. Governed by Booksy's Cookie Policy.", type: "Persistent/Session", expiry: "Varies (see Booksy's policy)" }
          ]} />
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">Third-Party (Google Maps)</p>
          <CookieTable rows={[
            { name: "CONSENT", provider: "Google LLC (google.com)", purpose: "Used to store your Google consent choices when a Google Maps embed is loaded.", type: "Persistent", expiry: "2 years" },
            { name: "NID / SIDCC", provider: "Google LLC (google.com)", purpose: "Used by Google to remember your preferences and personalize Google products.", type: "Persistent", expiry: "6 months" }
          ]} />
        </div>

        <p className="mt-4 text-gray-500 text-xs">
          Note: This table reflects cookies reasonably expected to be set based on currently integrated services. The exact cookies may change as services are updated. For the most current list, we recommend using your browser&apos;s developer tools to inspect cookies set when visiting the site.
        </p>
      </LegalSection>

      <LegalSection heading="4. Legal Basis for Cookies (Canadian Law)">
        <p>
          Under Canada&apos;s <strong className="text-white">Personal Information Protection and Electronic Documents Act (PIPEDA)</strong>, the use of cookies that collect personal information requires the knowledge and consent of the individual. Our approach:
        </p>
        <LegalList items={[
          "Strictly Necessary Cookies: No consent required, as these are essential to the operation of the website and do not collect personal data for commercial purposes;",
          "Analytics Cookies: We rely on implied consent. By continuing to use our website after a clear notice is provided, you consent to the use of analytics cookies. IP addresses collected by Google Analytics are anonymized;",
          "Third-Party Cookies (Booksy, Google Maps): Loaded only when you interact with those features (i.e., open the booking widget or view the map). Their use falls under the respective third party's own consent framework."
        ]} />
        <p>
          We do not rely on GDPR-specific consent mechanisms, as our primary audience is located in Canada. However, visitors from the European Economic Area (EEA) or other jurisdictions with stricter cookie laws should note that our cookie use may not fully comply with those jurisdictions&apos; requirements.
        </p>
      </LegalSection>

      <LegalSection heading="5. Managing Your Cookie Preferences">
        <LegalSubSection heading="5.1 Browser Controls">
          <p>
            Most web browsers allow you to control cookies through their settings. You can choose to block, delete, or receive notifications when cookies are set. The controls vary by browser:
          </p>
          <LegalList items={[
            "Google Chrome: Settings → Privacy and security → Cookies and other site data;",
            "Mozilla Firefox: Options → Privacy & Security → Cookies and Site Data;",
            "Safari: Preferences → Privacy → Manage Website Data;",
            "Microsoft Edge: Settings → Cookies and site permissions → Cookies and data stored."
          ]} />
          <p>
            Please note that blocking all cookies may significantly impact the functionality of our website and other websites you visit.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="5.2 Opting Out of Google Analytics">
          <p>
            You can prevent Google Analytics from collecting data about your visits by installing the <strong className="text-white">Google Analytics Opt-out Browser Add-on</strong>, available at:
          </p>
          <p>
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">tools.google.com/dlpage/gaoptout</a>
          </p>
          <p>
            Alternatively, you can opt out of Google&apos;s use of cookies for advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">adssettings.google.com</a>.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="5.3 Do Not Track (DNT) Signals">
          <p>
            Some browsers transmit &ldquo;Do Not Track&rdquo; (DNT) signals to websites. There is currently no universally accepted standard for how websites should respond to DNT signals in Canada. Our website does not currently alter its data collection practices in response to DNT browser settings. We will revisit this position as industry standards evolve.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="6. Third-Party Cookie Policies">
        <p>For more information about cookies set by our third-party service providers, please visit their respective policies:</p>
        <LegalList items={[
          "Google Analytics: policies.google.com/technologies/cookies",
          "Google Privacy Policy: policies.google.com/privacy",
          "Booksy Privacy Policy: booksy.com/privacy-policy",
          "Facebook/Meta: facebook.com/policies/cookies"
        ]} />
      </LegalSection>

      <LegalSection heading="7. Changes to This Cookie Policy">
        <p>
          We may update this Cookie Policy from time to time to reflect changes in technology, law, or our use of cookies. Any updates will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. We encourage you to review this Policy periodically.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact Us">
        <p>If you have questions about our use of cookies or this Cookie Policy, please contact us:</p>
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 mt-2">
          <p className="text-white font-semibold">S.Blends Barbershop</p>
          <p className="mt-1">150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2</p>
          <p>Email: <a href="mailto:info@sblendsbarbershop.ca" className="text-gold hover:underline">info@sblendsbarbershop.ca</a></p>
          <p>Phone: (289) 725-6333</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
