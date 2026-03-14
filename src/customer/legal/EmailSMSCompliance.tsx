/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LegalLayout, { LegalSection, LegalSubSection, LegalList } from "./LegalLayout";

export default function EmailSMSCompliance() {
  return (
    <LegalLayout
      title="Email & SMS Compliance"
      subtitle="S.Blends Barbershop is committed to complying with Canada's Anti-Spam Legislation (CASL) and all applicable laws governing electronic communications. This page explains how we send emails and text messages, how consent is obtained and managed, and how to opt out."
      lastUpdated="March 13, 2026"
    >
      <div className="bg-noir-light border border-white/10 rounded-2xl p-6 mb-10 text-sm text-gray-400 leading-relaxed">
        <span className="text-gold font-semibold uppercase tracking-widest text-xs block mb-2">Sender Identification (Required by CASL)</span>
        <p>Every commercial electronic message (CEM) sent by S.Blends Barbershop will clearly identify:</p>
        <div className="mt-3 space-y-1">
          <p><span className="text-white font-semibold">Business Name:</span> S.Blends Barbershop</p>
          <p><span className="text-white font-semibold">Mailing Address:</span> 150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2</p>
          <p><span className="text-white font-semibold">Email:</span> <a href="mailto:info@sblendsbarbershop.ca" className="text-gold hover:underline">info@sblendsbarbershop.ca</a></p>
          <p><span className="text-white font-semibold">Phone:</span> (289) 725-6333</p>
          <p><span className="text-white font-semibold">Website:</span> <a href="https://sblendsbarbershop.ca" className="text-gold hover:underline">sblendsbarbershop.ca</a></p>
        </div>
        <p className="mt-3 text-gray-500 text-xs">This information is included in each commercial electronic message we send in compliance with CASL Section 6(2).</p>
      </div>

      <LegalSection heading="1. Overview of Canada's Anti-Spam Legislation (CASL)">
        <p>
          <strong className="text-white">Canada&apos;s Anti-Spam Legislation (CASL)</strong>, which came into full force in July 2014, is one of the world&apos;s strictest laws governing commercial electronic messages (CEMs). CASL applies to any electronic message (email, SMS/text message, instant message, or other) sent to an electronic address in Canada that encourages participation in a commercial activity.
        </p>
        <p>Key requirements under CASL for every commercial electronic message:</p>
        <LegalList items={[
          "Consent — the sender must have either express or implied consent from the recipient to send a CEM;",
          "Identification — the message must clearly identify the sender, including their full legal name, mailing address, and contact information;",
          "Unsubscribe Mechanism — every CEM must include a clear, functioning unsubscribe mechanism that allows the recipient to withdraw consent within 10 business days."
        ]} />
        <p>
          S.Blends Barbershop takes CASL compliance seriously. All electronic messaging programs are operated in accordance with these requirements. Our web administrators and any third-party messaging platforms we use are bound by our instructions to comply with CASL.
        </p>
      </LegalSection>

      <LegalSection heading="2. Types of Electronic Messages We Send">
        <p>S.Blends Barbershop sends two categories of electronic messages: <strong className="text-white">transactional</strong> and <strong className="text-white">commercial/marketing</strong>.</p>

        <LegalSubSection heading="2.1 Transactional Messages">
          <p>
            Transactional messages are sent in direct response to an action you have taken or to fulfill an existing service relationship. These are not considered Commercial Electronic Messages under CASL and are sent regardless of marketing consent. You will receive transactional messages as long as you have an active relationship with S.Blends Barbershop.
          </p>
          <p>Transactional messages include:</p>
          <LegalList items={[
            "Appointment booking confirmation — sent immediately when an appointment is scheduled;",
            "Appointment reminder — sent 24–48 hours before your scheduled appointment;",
            "Appointment rescheduling or cancellation confirmation — sent when changes are made to a booking;",
            "Post-appointment follow-up — for rescheduling prompts after a missed appointment;",
            "Replies to direct inquiries, complaints, or support requests you have submitted to us."
          ]} />
          <p>
            To stop receiving transactional appointment messages, you must cancel your outstanding bookings and request that your contact information be removed from our appointment system (see Section 8).
          </p>
        </LegalSubSection>

        <LegalSubSection heading="2.2 Commercial / Marketing Messages">
          <p>
            Marketing messages promote S.Blends Barbershop&apos;s services, events, offers, or other commercial activities. These are Commercial Electronic Messages (CEMs) under CASL and are only sent when we have your valid consent.
          </p>
          <p>Marketing messages may include:</p>
          <LegalList items={[
            "Promotional offers, discounts, or seasonal specials;",
            "New service or product announcements;",
            "Event invitations (e.g., grand openings, loyalty events);",
            "Referral program or loyalty reward notifications;",
            "S.Blends Barbershop newsletters and general updates;",
            "Re-engagement messages for clients who have not visited in a period of time (only if consent remains active)."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="3. How We Obtain Consent">
        <LegalSubSection heading="3.1 Express Consent">
          <p>
            Express consent is obtained when you actively opt-in to receive marketing messages from us. This is the primary form of consent we rely on for marketing CEMs.
          </p>
          <p>We may collect express consent through:</p>
          <LegalList items={[
            "A clearly labeled opt-in checkbox on a booking form, contact form, or website landing page — the checkbox is never pre-checked;",
            "A verbal request made in-person at one of our locations, where staff records the consent, the date, and the means by which it was given;",
            "A written request submitted by you directly (e.g., by emailing us to subscribe);",
            "An SMS keyword opt-in program where you text a designated keyword to our SMS messaging number."
          ]} />
          <p>
            Express consent for marketing messages does not expire unless withdrawn by you. However, we regularly refresh our consent records and may send a periodic consent renewal request.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="3.2 Implied Consent (Limited Use)">
          <p>
            CASL permits the use of implied consent in certain limited circumstances. We may rely on implied consent for marketing messages only where:
          </p>
          <LegalList items={[
            "You have purchased a service or interacted with our business within the past 24 months — you are a current or recent customer;",
            "You have made an inquiry or provided a business card or contact information in a context where communications were reasonably expected (e.g., asking about pricing in a walk-in consultation);",
            "You are a person who has voluntarily published their electronic address without a statement that they do not wish to receive unsolicited messages."
          ]} />
          <p>
            <strong className="text-white">Important note on implied consent duration:</strong> Implied consent for commercial purposes under CASL is time-limited. For existing customers, it typically lasts for <strong className="text-white">24 months</strong> from the date of the last transaction. We will not rely on implied consent beyond this period without obtaining express consent.
          </p>
          <p>
            We proactively transition implied consent contacts to express consent by providing opt-in opportunities through transactional messages and in-store.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="3.3 Consent Records">
          <p>
            We maintain records of all marketing consents, including:
          </p>
          <LegalList items={[
            "The identity of the individual who gave consent;",
            "The date and time consent was given;",
            "The method by which consent was obtained (web form, in-person, SMS keyword, etc.);",
            "The specific message type(s) consented to;",
            "Any subsequent withdrawal of consent and the date/method of withdrawal."
          ]} />
          <p>
            These records are retained for a minimum of <strong className="text-white">3 years</strong> from the date of consent as required by CASL, even after consent has been withdrawn.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="4. How to Subscribe to Marketing Messages">
        <LegalSubSection heading="4.1 Email Marketing">
          <p>You can subscribe to our email marketing list by:</p>
          <LegalList items={[
            "Checking the clearly labeled marketing opt-in checkbox when booking an appointment online;",
            "Submitting your email address and explicitly requesting to be added to our mailing list via info@sblendsbarbershop.ca;",
            "Asking a staff member at our location to add your email address to our marketing list — you will receive a confirmation email."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="4.2 SMS Marketing">
          <p>You can subscribe to receive SMS marketing messages by:</p>
          <LegalList items={[
            "Providing your mobile number and explicitly opting in to SMS communications in an appointment booking form or in-store sign-up;",
            "Texting an opt-in keyword (if a keyword program is active — the keyword will be displayed on our website or in-store signage with full program terms)."
          ]} />
          <p>
            <strong className="text-white">Message and data rates may apply.</strong> Message frequency varies based on promotions and business activity. By subscribing to SMS, you confirm you are the account holder for the mobile number provided, or have authorization from the account holder.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="5. How to Unsubscribe (Opt Out)">
        <p>
          You may withdraw your consent to receive marketing electronic messages at any time. All commercial electronic messages we send include a clear, functioning unsubscribe mechanism. We will honor all valid unsubscribe requests within <strong className="text-white">10 business days</strong> as required by CASL section 11.
        </p>

        <LegalSubSection heading="5.1 Unsubscribing from Email">
          <LegalList items={[
            "Click the &ldquo;Unsubscribe&rdquo; link at the bottom of any marketing email we send;",
            "Reply to a marketing email with &ldquo;UNSUBSCRIBE&rdquo; in the subject line;",
            "Send an email to info@sblendsbarbershop.ca with &ldquo;Unsubscribe&rdquo; in the subject line and your email address in the body;",
            "Contact us by phone at (289) 725-6333 and request to be removed from our email list;",
            "Write to us at: S.Blends Barbershop, 150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="5.2 Unsubscribing from SMS">
          <LegalList items={[
            "Reply STOP to any marketing SMS message from us — this is the fastest and most reliable method;",
            "Reply STOP ALL to stop all SMS messages from the short code or long code used;",
            "Contact us at info@sblendsbarbershop.ca or call (289) 725-6333 to request removal;",
            "Accepted SMS opt-out keywords: STOP, CANCEL, END, QUIT, UNSUBSCRIBE."
          ]} />
          <p>
            After responding STOP, you will receive a single confirmation SMS confirming your unsubscription. No further marketing messages will be sent. To re-subscribe at a later date, you may text START or contact us to opt back in.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="5.3 Important Notes on Unsubscribing">
          <LegalList items={[
            "Opting out of marketing messages does not unsubscribe you from transactional messages (appointment confirmations and reminders) — to stop those, you must cancel active bookings;",
            "If you submit an unsubscribe request through more than one channel, it will be treated as a single request;",
            "We will not charge any fee for processing your unsubscribe request;",
            "Unsubscribe mechanisms will remain active for a minimum of 60 days after any marketing message is sent, as required by CASL."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="6. Email Message Requirements">
        <p>Every commercial email (CEM) sent by S.Blends Barbershop will include the following elements as required by CASL:</p>
        <LegalList items={[
          "The full name of S.Blends Barbershop as the sender;",
          "Our mailing address: 150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2;",
          "A contact email address (info@sblendsbarbershop.ca) or phone number (289-725-6333);",
          "A clear, functional unsubscribe link that processes your request within 10 business days;",
          "An accurate, non-deceptive subject line that describes the content of the email;",
          "No false or misleading header information (from name, reply-to, routing, etc.)."
        ]} />
      </LegalSection>

      <LegalSection heading="7. SMS Message Requirements">
        <p>Every commercial SMS/text message sent by S.Blends Barbershop will include:</p>
        <LegalList items={[
          "Clear identification of S.Blends Barbershop as the sender (e.g., &ldquo;S.Blends Barbershop:&rdquo; at the start of the message);",
          "Instructions on how to opt out (e.g., &ldquo;Reply STOP to unsubscribe&rdquo;) in each commercial message;",
          "Our website or contact information for more details where relevant;",
          "No misleading content about the purpose or origin of the message."
        ]} />

        <LegalSubSection heading="7.1 SMS Program Terms">
          <LegalList items={[
            "Message frequency: varies based on promotions, generally 2–4 messages per month;",
            "Message and data rates from your wireless carrier may apply;",
            "Compatible carriers: all major Canadian wireless carriers (Rogers, Bell, Telus, Fido, Koodo, Virgin, Freedom, etc.);",
            "For support, text HELP to any message from us or contact us at info@sblendsbarbershop.ca or (289) 725-6333;",
            "S.Blends Barbershop is not responsible for any charges from your wireless carrier resulting from receiving our messages."
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="8. Removing Your Personal Information Entirely">
        <p>
          If you wish to have your personal information (including your email address and phone number) removed from all of our lists — including appointment booking records — you may submit a deletion request to:
        </p>
        <LegalList items={[
          "Email: info@sblendsbarbershop.ca (Subject: &ldquo;Data Deletion Request&rdquo;);",
          "Mail: 150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2;",
          "Phone: (289) 725-6333."
        ]} />
        <p>
          Please note that we are required by law to retain certain records (e.g., financial and tax records) for a legally mandated period of time, even after a deletion request. Consent records under CASL must also be retained for 3 years. We will notify you of any records that must be retained and the applicable retention period. See our <a href="/privacy-policy" className="text-gold hover:underline">Privacy Policy</a> for full details on data retention.
        </p>
      </LegalSection>

      <LegalSection heading="9. Our Third-Party Messaging Partners">
        <p>
          We work with reputable third-party platforms to deliver our emails and SMS messages. These providers are engaged as data processors under written agreements that require them to handle your personal information in accordance with our instructions and applicable privacy law. While we do not publicly disclose our current platform provider names for security reasons, all providers are:
        </p>
        <LegalList items={[
          "Required to comply with CASL and all applicable electronic communications laws;",
          "Prohibited from using your personal information for their own commercial purposes;",
          "Required to implement appropriate data security safeguards;",
          "Subject to our right to audit their compliance."
        ]} />
        <p>
          Appointment-related transactional messages (confirmations and reminders) are sent through <strong className="text-white">Booksy</strong>&apos;s platform as part of the Booksy appointment management system. These messages are governed in part by Booksy&apos;s own terms and privacy policies.
        </p>
      </LegalSection>

      <LegalSection heading="10. Cross-Border Communications">
        <p>
          S.Blends Barbershop operates in Canada and targets Canadian clients. However, some of our messaging service providers may route messages through servers located in the United States. In that context, U.S. laws such as the <strong className="text-white">CAN-SPAM Act</strong> (for emails) and the <strong className="text-white">Telephone Consumer Protection Act (TCPA)</strong> (for SMS) may also apply. Our consent and messaging practices are designed to satisfy both CASL and reasonable U.S. compliance standards, including:
        </p>
        <LegalList items={[
          "Accurate sender identification in all commercial messages;",
          "Clear subject lines with no deceptive or misleading header information;",
          "A valid physical mailing address in every commercial email;",
          "Functioning unsubscribe mechanisms processed within the timeframes required by applicable law."
        ]} />
      </LegalSection>

      <LegalSection heading="11. Reporting CASL Violations">
        <p>
          If you receive electronic messages from a party claiming to be S.Blends Barbershop and believe those messages were sent without your valid consent or do not comply with CASL, please contact us immediately:
        </p>
        <LegalList items={[
          "Email: info@sblendsbarbershop.ca",
          "Phone: (289) 725-6333",
          "In writing: 150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2"
        ]} />
        <p>
          CASL violations may also be reported to the <strong className="text-white">Canadian Radio-television and Telecommunications Commission (CRTC)</strong> at:
        </p>
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 mt-2">
          <p className="text-white font-semibold">CRTC Spam Reporting Centre</p>
          <p>Website: <a href="https://www.fightspam.gc.ca" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">fightspam.gc.ca</a></p>
          <p className="text-gray-500 text-xs mt-2">You may also report to the Competition Bureau of Canada (competitionbureau.gc.ca) for false or misleading commercial messages, or to the Office of the Privacy Commissioner (priv.gc.ca) for privacy-related complaints.</p>
        </div>
      </LegalSection>

      <LegalSection heading="12. Changes to This Policy">
        <p>
          We may update this Email/SMS Compliance Policy from time to time to reflect changes in our practices, applicable law (including CASL), or the services we use. Material changes will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. We encourage you to review this Policy periodically.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact for Compliance Inquiries">
        <p>For any questions, concerns, or requests regarding our email and SMS practices, consent records, or this Policy:</p>
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 mt-2">
          <p className="text-white font-semibold">S.Blends Barbershop — Communications Compliance</p>
          <p className="mt-2">150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2</p>
          <p>Email: <a href="mailto:info@sblendsbarbershop.ca" className="text-gold hover:underline">info@sblendsbarbershop.ca</a></p>
          <p>Phone: (289) 725-6333</p>
          <p>Website: <a href="https://sblendsbarbershop.ca" className="text-gold hover:underline">sblendsbarbershop.ca</a></p>
          <p className="text-gray-500 text-xs mt-3">We aim to respond to all compliance inquiries within 5 business days.</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
