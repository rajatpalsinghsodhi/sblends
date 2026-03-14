/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LegalLayout, { LegalSection, LegalSubSection, LegalList } from "./LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="S.Blends Barbershop is committed to protecting your personal information in accordance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable Ontario privacy legislation."
      lastUpdated="March 13, 2026"
    >
      {/* Preamble */}
      <div className="bg-noir-light border border-white/10 rounded-2xl p-6 mb-10 text-sm text-gray-400 leading-relaxed">
        <span className="text-gold font-semibold uppercase tracking-widest text-xs block mb-2">Important Notice</span>
        This Privacy Policy describes how <strong className="text-white">S.Blends Barbershop</strong> (&ldquo;S.Blends,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, discloses, and protects personal information when you visit <strong className="text-white">sblendsbarbershop.ca</strong>, book an appointment, communicate with us by email or SMS, or visit any of our physical locations in Oakville or Vaughan, Ontario. Please read this Policy carefully. By using our website or services, you acknowledge that you have read and understood this Policy.
      </div>

      <LegalSection heading="1. Who We Are">
        <p>
          <strong className="text-white">S.Blends Barbershop</strong> operates barbershop and male grooming service locations in Oakville and Vaughan, Ontario, Canada. Our primary location is:
        </p>
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 mt-2">
          <p className="text-white font-semibold">S.Blends Barbershop (Oakville)</p>
          <p>150 Oak Park Blvd, Unit 5</p>
          <p>Oakville, ON L6H 3P2</p>
          <p>Phone: (289) 725-6333</p>
          <p>Email: info@sblendsbarbershop.ca</p>
          <p>Website: <a href="https://sblendsbarbershop.ca" className="text-gold hover:underline">sblendsbarbershop.ca</a></p>
        </div>
        <p className="mt-3">
          S.Blends Barbershop is the &ldquo;organization&rdquo; responsible for personal information as defined under PIPEDA. Our website is administered by web service contractors acting on behalf of S.Blends Barbershop as data processors, under our direction and in accordance with this Policy.
        </p>
      </LegalSection>

      <LegalSection heading="2. Scope of This Policy">
        <p>
          This Policy applies to personal information collected:
        </p>
        <LegalList items={[
          "Through our website sblendsbarbershop.ca and any associated subdomains;",
          "When you book appointments through our website or the Booksy platform on our behalf;",
          "When you provide us with your contact details in person, over the phone, or through a contact form;",
          "When you opt in to receive SMS or email communications from us;",
          "When you interact with us on social media linked from our website;",
          "When you visit our physical locations and provide information to staff."
        ]} />
        <p>
          This Policy does not apply to the employment practices of S.Blends Barbershop or to information about businesses or other organizations.
        </p>
      </LegalSection>

      <LegalSection heading="3. Personal Information We Collect">
        <p>We collect only the personal information necessary to provide our services and communicate with you. This may include:</p>

        <LegalSubSection heading="3.1 Identity &amp; Contact Information">
          <LegalList items={[
            "Full name",
            "Email address",
            "Mobile phone number",
            "Mailing or home address (if provided voluntarily)"
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="3.2 Appointment &amp; Service Information">
          <LegalList items={[
            "Appointment date, time, and location selected",
            "Service(s) booked and any associated preferences or notes",
            "Barber preference or assignment",
            "Appointment history and visit frequency",
            "Cancellation or no-show records"
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="3.3 Payment Information">
          <p>
            Payments are processed exclusively through third-party platforms (Booksy or in-person point-of-sale processors). We do not collect, store, or have access to full credit or debit card numbers, CVV codes, or banking credentials. Any payment data is governed by the applicable third-party&apos;s PCI-DSS compliant payment privacy policy.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="3.4 Communication Preferences &amp; Consent Records">
          <LegalList items={[
            "Whether you have opted in or out of marketing emails or SMS messages",
            "The date, time, and method by which consent was given or withdrawn",
            "Content of messages you send to us (e.g., support inquiries)"
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="3.5 Technical &amp; Usage Data">
          <LegalList items={[
            "IP address and approximate geographic location derived from IP",
            "Browser type, operating system, and device type",
            "Pages visited on our website, time spent, and referring URLs",
            "Cookie identifiers and session tokens (see our Cookie Policy)",
            "Clickstream data and interaction events on our website"
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="3.6 Information You Provide Voluntarily">
          <LegalList items={[
            "Photos or screenshots attached to support requests",
            "Review or feedback content you choose to submit",
            "Social media handle or profile if you contact us via a social channel"
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="4. How We Collect Personal Information">
        <LegalSubSection heading="4.1 Directly From You">
          <LegalList items={[
            "When you create a profile or make a booking through Booksy (booksy.com) linked from our website;",
            "When you call us, email us, or complete a contact or inquiry form on our website;",
            "When you provide your phone number or email address to a staff member in-shop to receive appointment reminders or promotional messages;",
            "When you sign up for SMS or email marketing through an opt-in form or at the point of service."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="4.2 Automatically Through Technology">
          <p>
            Our website uses cookies, web beacons, and similar tracking technologies to automatically collect technical and usage data when you browse our site. This includes data collected by Google Analytics and any third-party widgets embedded on our site (e.g., Booksy booking widget, Google Maps). Please refer to our Cookie Policy for full details.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="4.3 From Third Parties">
          <LegalList items={[
            "Booksy may share appointment and profile information with us as part of our integrated booking integration;",
            "Google may provide aggregated demographic or interest data through our analytics configuration;",
            "If you interact with our social media pages (Instagram, Facebook), the platforms may provide us with limited interaction data."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="5. How We Use Your Personal Information">
        <p>We use your personal information for the following purposes, and only to the extent necessary for each:</p>

        <LegalSubSection heading="5.1 Service Delivery">
          <LegalList items={[
            "To schedule, confirm, manage, and fulfil appointments for barbershop services;",
            "To match you with your preferred barber and track service preferences;",
            "To process cancellations, rescheduling requests, and refund inquiries;",
            "To maintain an accurate record of services provided to you."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="5.2 Transactional Communications">
          <LegalList items={[
            "To send appointment confirmation messages by email and/or SMS;",
            "To send appointment reminder messages (typically 24–48 hours before your scheduled time);",
            "To send follow-up messages regarding your appointment (e.g., rescheduling prompts after a cancellation);",
            "To respond to direct inquiries, complaints, or support requests you submit to us."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="5.3 Marketing Communications (With Your Consent)">
          <LegalList items={[
            "To send promotional offers, seasonal specials, new service announcements, and event notices by email and/or SMS;",
            "To notify you of referral programs, loyalty rewards, or giveaways;",
            "To send periodic newsletters about the barbershop experience at S.Blends."
          ]} />
          <p>Marketing communications are sent only where we have obtained your express consent. You may withdraw consent at any time. See Section 8.3 for how to unsubscribe.</p>
        </LegalSubSection>

        <LegalSubSection heading="5.4 Business Operations &amp; Improvement">
          <LegalList items={[
            "To analyze aggregate appointment trends and service popularity to improve our offerings;",
            "To monitor website usage and improve website functionality and user experience;",
            "To conduct internal quality assurance and staff performance review;",
            "To comply with legal, regulatory, and tax obligations (e.g., Canada Revenue Agency record-keeping requirements)."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="5.5 Security &amp; Fraud Prevention">
          <LegalList items={[
            "To detect, investigate, and prevent fraudulent activity, abuse, or unauthorized access to accounts;",
            "To enforce our cancellation and no-show policies;",
            "To maintain the safety and security of our staff and premises."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="6. Legal Bases for Processing (PIPEDA Principles)">
        <p>
          Under PIPEDA, our collection, use, and disclosure of personal information is based on the following grounds:
        </p>
        <LegalList items={[
          "Express Consent — you have given us clear, informed, opt-in consent (e.g., subscribing to marketing emails or SMS);",
          "Implied Consent — consent may be implied by the nature of the relationship (e.g., you provide your email when booking an appointment, and we use it to send appointment confirmations);",
          "Contractual Necessity — processing is necessary to perform a service contract with you (e.g., completing your booked appointment);",
          "Legal Obligation — we are required by law to retain certain business records;",
          "Legitimate Business Interest — where we have a legitimate interest that is not overridden by your rights (e.g., protecting our business against fraud or maintaining security of our systems)."
        ]} />
      </LegalSection>

      <LegalSection heading="7. Disclosure of Personal Information">
        <p>We do not sell, rent, or trade your personal information to any third party. We may share your information only in the following limited circumstances:</p>

        <LegalSubSection heading="7.1 Service Providers &amp; Data Processors">
          <p>We engage trusted third-party service providers who process personal information on our behalf and under our instructions, bound by appropriate data processing agreements:</p>
          <LegalList items={[
            "Booksy Inc. — appointment scheduling and customer management platform. Booksy's Privacy Policy is available at booksy.com/privacy-policy;",
            "Email service providers — for sending transactional and marketing emails (e.g., confirmation and reminder notifications);",
            "SMS/text messaging platform providers — for sending appointment reminders and promotional SMS messages, compliant with Canada's Anti-Spam Legislation (CASL);",
            "Web hosting and cloud infrastructure providers — who host our website and store operational data;",
            "Google LLC — for Google Analytics (website analytics) and Google Maps (location display). Data processed under Google's Privacy Policy."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="7.2 Legal &amp; Regulatory Disclosure">
          <p>
            We may disclose personal information if we believe in good faith that disclosure is necessary to comply with applicable law, a court order, governmental authority, or law enforcement request; to enforce our Terms of Service or other policies; or to protect the rights, property, or safety of S.Blends, our staff, clients, or others.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="7.3 Business Transfers">
          <p>
            In the event of a merger, acquisition, or sale of all or substantially all of the assets of S.Blends Barbershop, personal information held by us may be transferred to the acquiring entity, subject to the same protections afforded by this Privacy Policy. We will notify affected individuals before personal information becomes subject to a different privacy policy.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="8. Your Privacy Rights Under PIPEDA">
        <LegalSubSection heading="8.1 Right of Access">
          <p>
            You have the right to request access to the personal information we hold about you. Upon a written request, we will provide a copy of your personal information within <strong className="text-white">30 days</strong>, subject to any limitations permitted under PIPEDA (e.g., information about other individuals, information that is subject to solicitor-client privilege, or information that cannot be disclosed for security reasons). A nominal fee may be charged for extensive requests; we will notify you of any fee before proceeding.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="8.2 Right to Correction">
          <p>
            You have the right to challenge the accuracy and completeness of your personal information and to have it amended where appropriate. If we are unable to make the correction, we will note your requested correction on file and, upon your request, disclose the uncorrected information along with any notation when sharing it with third parties.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="8.3 Right to Withdraw Consent">
          <p>
            You may withdraw your consent to the collection, use, or disclosure of your personal information at any time, subject to legal and contractual restrictions. Note that withdrawal of consent may mean we are unable to provide you with certain services (e.g., appointment reminders).
          </p>
          <p className="font-semibold text-white mt-2">To unsubscribe from marketing communications:</p>
          <LegalList items={[
            "Email: reply with &quot;UNSUBSCRIBE&quot; in the subject line, or click the unsubscribe link in any marketing email;",
            "SMS: reply STOP to any marketing text message;",
            "In writing: contact us at info@sblendsbarbershop.ca or by mail at the address above."
          ]} />
          <p>We will process your unsubscribe request within <strong className="text-white">10 business days</strong> as required by CASL.</p>
        </LegalSubSection>

        <LegalSubSection heading="8.4 Right to Lodge a Complaint">
          <p>
            If you believe we have not handled your personal information in accordance with PIPEDA or this Policy, you may contact our Privacy Contact (see Section 13) to have your concern investigated. If you are not satisfied with our response, you have the right to file a complaint with the <strong className="text-white">Office of the Privacy Commissioner of Canada (OPC)</strong>:
          </p>
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 mt-2 text-sm">
            <p className="text-white font-semibold">Office of the Privacy Commissioner of Canada</p>
            <p>30 Victoria Street, Gatineau, Quebec K1A 1H3</p>
            <p>Toll-free: 1-800-282-1376</p>
            <p>Website: <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">priv.gc.ca</a></p>
          </div>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="9. Data Retention">
        <p>We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by law:</p>
        <LegalList items={[
          "Appointment records: retained for a minimum of 7 years to satisfy Canada Revenue Agency financial record-keeping obligations;",
          "Marketing consent records: retained from the date of consent until withdrawal of consent, plus an additional 3 years as required by CASL;",
          "Support or inquiry communications: retained for 3 years from the date of resolution, in case of follow-up disputes;",
          "Website analytics data: retained in aggregated form for up to 26 months per Google Analytics default retention settings;",
          "Cookie data: session cookies expire when you close your browser; persistent cookies expire as described in our Cookie Policy."
        ]} />
        <p>
          Upon expiry of the applicable retention period, personal information is securely deleted or irreversibly anonymized.
        </p>
      </LegalSection>

      <LegalSection heading="10. Data Security">
        <p>
          We implement reasonable administrative, technical, and physical safeguards designed to protect personal information against unauthorized access, use, disclosure, alteration, or destruction. These measures include:
        </p>
        <LegalList items={[
          "HTTPS/TLS encryption for all data transmitted between your browser and our website;",
          "Access controls and role-based permissions for staff who handle personal information;",
          "Use of contractually bound, reputable third-party service providers with their own security certifications;",
          "Regular review of our data handling practices and security measures."
        ]} />
        <p>
          No method of transmission over the internet or electronic storage is completely secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security. In the event of a breach that poses a real risk of significant harm to individuals, we will notify affected individuals and the Office of the Privacy Commissioner of Canada as required under PIPEDA&apos;s <em>Breach of Security Safeguards Regulations</em>.
        </p>
      </LegalSection>

      <LegalSection heading="11. Children's Privacy">
        <p>
          Our barbershop services are provided to clients of all ages, including children. However, our website and digital communications are not directed to children under the age of <strong className="text-white">13</strong>. We do not knowingly collect personal information from children under 13 without verifiable parental or guardian consent.
        </p>
        <p>
          For clients aged 13 to 17, we request that a parent or guardian consent to our collection and use of their personal information before booking services on their behalf. If you believe we have inadvertently collected personal information from a child under 13 without appropriate consent, please contact us immediately and we will promptly delete such information.
        </p>
      </LegalSection>

      <LegalSection heading="12. Third-Party Links &amp; Services">
        <p>
          Our website contains links to and integrations with third-party websites and services, including but not limited to:
        </p>
        <LegalList items={[
          "Booksy (booksy.com) — appointment booking platform;",
          "Google Maps — embedded location maps;",
          "Instagram and Facebook — social media pages;",
          "Google Analytics — website analytics."
        ]} />
        <p>
          These third parties operate under their own privacy policies, which we encourage you to review. S.Blends Barbershop is not responsible for the privacy practices or content of any third-party website or service. By clicking on a third-party link or using an embedded widget, you are leaving our site and are subject to the third party&apos;s policies.
        </p>
      </LegalSection>

      <LegalSection heading="13. Changes to This Privacy Policy">
        <p>
          We reserve the right to update this Privacy Policy at any time to reflect changes in our practices, applicable law, or our services. Material changes will be communicated by posting an updated Policy on this page with a revised &ldquo;Last Updated&rdquo; date. Where required by applicable law, we will provide more prominent notice (e.g., by email or by a notice on our homepage) before material changes take effect.
        </p>
        <p>
          Your continued use of our website or services after the effective date of any changes constitutes your acceptance of the revised Policy.
        </p>
      </LegalSection>

      <LegalSection heading="14. Contact Us &mdash; Privacy Officer">
        <p>
          For questions, concerns, or requests regarding this Privacy Policy or our privacy practices, or to exercise any of your rights described in Section 8, please contact our designated Privacy Contact:
        </p>
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 mt-2">
          <p className="text-white font-semibold">Privacy Contact &mdash; S.Blends Barbershop</p>
          <p className="mt-2">By Email: <a href="mailto:info@sblendsbarbershop.ca" className="text-gold hover:underline">info@sblendsbarbershop.ca</a></p>
          <p>By Mail: 150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2</p>
          <p>By Phone: (289) 725-6333</p>
          <p className="mt-2 text-gray-500 text-xs">We will respond to written requests within 30 days of receipt. If additional time is required, we will notify you of the delay and reason within the 30-day period.</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
