/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LegalLayout, { LegalSection, LegalSubSection, LegalList } from "./LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these Terms carefully before using our website or booking services. By accessing or using sblendsbarbershop.ca, you agree to be bound by these Terms."
      lastUpdated="March 13, 2026"
    >
      {/* Preamble */}
      <div className="bg-noir-light border border-white/10 rounded-2xl p-6 mb-10 text-sm text-gray-400 leading-relaxed">
        <span className="text-gold font-semibold uppercase tracking-widest text-xs block mb-2">Agreement to Terms</span>
        These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and <strong className="text-white">S.Blends Barbershop</strong> (&ldquo;S.Blends,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your use of our website at <strong className="text-white">sblendsbarbershop.ca</strong> and any related digital tools, services, or communications we provide. If you do not agree to these Terms, please do not use our website or services.
      </div>

      <LegalSection heading="1. About S.Blends Barbershop">
        <p>
          S.Blends Barbershop is a professional male grooming establishment operating in Oakville and Vaughan, Ontario, Canada. Our website is administered by web service contractors on behalf of S.Blends Barbershop owners. The website provides information about our services, enables appointment booking through third-party platforms, and facilitates communication between clients and the business.
        </p>
        <div className="bg-black/30 border border-white/10 rounded-xl p-4 mt-3">
          <p className="text-white font-semibold">S.Blends Barbershop (Primary Location)</p>
          <p>150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2</p>
          <p>Phone: (289) 725-6333 | Email: info@sblendsbarbershop.ca</p>
        </div>
      </LegalSection>

      <LegalSection heading="2. Acceptance of Terms">
        <p>
          By accessing, browsing, or otherwise using this website — or by booking a service, signing up for communications, or entering a physical S.Blends location — you confirm that:
        </p>
        <LegalList items={[
          "You are at least 18 years of age, or are 13 years of age or older acting under the supervision of a parent or legal guardian who has reviewed and agreed to these Terms on your behalf;",
          "You have the legal capacity to enter into a binding agreement;",
          "You will use our website and services only for lawful purposes and in accordance with these Terms;",
          "You have read, understood, and agree to be bound by these Terms and our Privacy Policy, Cookie Policy, and Email/SMS Compliance Policy, all of which are incorporated herein by reference."
        ]} />
      </LegalSection>

      <LegalSection heading="3. Our Services">
        <LegalSubSection heading="3.1 Barbershop Services">
          <p>
            S.Blends Barbershop offers a range of professional male grooming services at our physical locations, including haircuts, beard styling and shaping, hot towel shaves, head shaves, hair and beard colouring, facials, threading, and package services. Service availability, pricing, and duration may change without notice. Current service offerings and pricing are displayed on our website and may also be confirmed by contacting us directly or through the Booksy booking platform.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="3.2 Website &amp; Informational Content">
          <p>
            Our website provides general information about our services, team, hours of operation, location details, and the ability to navigate to our booking platform. While we strive to keep all information accurate and up to date, we make no warranty that the content on the website is complete, current, or error-free. We reserve the right to modify, suspend, or discontinue any part of the website at any time without prior notice.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="3.3 Online Appointment Booking (Booksy Integration)">
          <p>
            Online appointment booking is facilitated through <strong className="text-white">Booksy</strong> (booksy.com), a third-party scheduling platform. By clicking the booking link on our website, you will be redirected to or interact with the Booksy platform, which has its own Terms of Service and Privacy Policy. S.Blends Barbershop is not responsible for Booksy&apos;s platform functionality, availability, or handling of your personal data on their systems.
          </p>
          <p>
            A booking made through Booksy constitutes a service agreement between you and S.Blends Barbershop, subject to our Appointment Policy set out in Section 4.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="4. Appointment Policy">
        <LegalSubSection heading="4.1 Booking Confirmation">
          <p>
            An appointment is confirmed only when you receive a written confirmation via Booksy, email, or SMS. Appointments are subject to barber availability and may be declined or rescheduled at our discretion due to staffing changes or extraordinary circumstances.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="4.2 Cancellation &amp; Rescheduling">
          <LegalList items={[
            "We request that you cancel or reschedule appointments at least 24 hours in advance;",
            "Late cancellations (less than 24 hours&apos; notice) or no-shows may result in a cancellation fee or a deposit requirement for future bookings, at S.Blends&apos; discretion;",
            "Repeated no-shows may result in booking privileges being suspended."
          ]} />
        </LegalSubSection>

        <LegalSubSection heading="4.3 Late Arrivals">
          <p>
            We recommend arriving 5–10 minutes before your scheduled appointment. Clients who arrive more than 10 minutes late may be asked to reschedule if the barber has been assigned to the next client. We will make reasonable efforts to accommodate late arrivals where schedule permits.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="4.4 Service Outcomes">
          <p>
            Our barbers are trained professionals who will make every reasonable effort to deliver requested styles and services. Final results may vary based on hair type, condition, and growth. S.Blends is not responsible for outcomes resulting from inaccurate or incomplete style references provided by the client. Concerns regarding a service should be raised with a barber or manager at the time of service or within 48 hours of the appointment.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="4.5 Refund Policy">
          <p>
            We do not offer cash refunds for completed services. If you are dissatisfied with a service, please notify us in person at the time of service or contact us within 48 hours. We will make reasonable efforts to correct the issue at no additional charge during a follow-up appointment.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="5. User Responsibilities">
        <p>When using our website or services, you agree to:</p>
        <LegalList items={[
          "Provide accurate, current, and complete information when making bookings or filling out forms;",
          "Not impersonate any person or entity, or misrepresent your identity or affiliation with any person or organization;",
          "Not attempt to access any restricted areas of our website, server, or internal systems;",
          "Not use our website to transmit any harmful, unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable content;",
          "Not use automated bots, scrapers, or other tools to systematically collect data from our website without our prior written consent;",
          "Not engage in any activity that would disrupt, interfere with, or impose an unreasonable or disproportionately large load on our website infrastructure;",
          "Comply with all applicable local, provincial, and federal laws and regulations in connection with your use of our website and services."
        ]} />
      </LegalSection>

      <LegalSection heading="6. Intellectual Property">
        <LegalSubSection heading="6.1 Ownership">
          <p>
            All content on this website — including but not limited to text, logos, brand name, service descriptions, photographs, graphics, audio, video, icons, and the overall design and layout — is the proprietary intellectual property of S.Blends Barbershop or its licensed content providers, and is protected by Canadian copyright law, trademark law, and other applicable intellectual property laws.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="6.2 Limited License to Use">
          <p>
            You are granted a limited, non-exclusive, non-transferable, revocable license to access and use this website for personal, non-commercial purposes only. You may not reproduce, distribute, modify, publicly display, publicly perform, or create derivative works from any content on this website without our prior express written permission.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="6.3 Feedback &amp; User Content">
          <p>
            If you submit reviews, testimonials, photos, or other content to us (whether through our website, social media, or any other channel), you grant S.Blends Barbershop a non-exclusive, royalty-free, perpetual, irrevocable, and fully sub-licensable right to use, reproduce, modify, adapt, publish, display, and distribute such content in any media for promotional purposes, without additional compensation to you. You represent that you own or have the right to grant this license, and that the submitted content does not infringe upon any third party&apos;s rights.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="7. Third-Party Services &amp; Links">
        <p>
          Our website integrates with and links to third-party services including Booksy, Google Maps, Google Analytics, Instagram, and Facebook. These services are governed by their respective terms of service and privacy policies, which are independent of S.Blends and over which we have no control. Inclusion of a link or integration does not constitute our endorsement of the linked site or service.
        </p>
        <p>
          S.Blends Barbershop shall not be liable for any loss or damage arising from your use of any third-party platform, including any loss of data, financial loss, or service interruption experienced on those platforms.
        </p>
      </LegalSection>

      <LegalSection heading="8. Disclaimers">
        <LegalSubSection heading="8.1 Website Provided &ldquo;As Is&rdquo;">
          <p>
            Our website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, or non-infringement. We do not warrant that: (a) the website will be uninterrupted, secure, or error-free; (b) errors or defects will be corrected; or (c) the website or its server are free of viruses or other harmful components.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="8.2 Service Information">
          <p>
            Information on this website regarding services, pricing, hours, and availability is provided for general informational purposes and may not be fully up to date. We encourage you to contact us directly or use the Booksy platform for the most current information.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law in Ontario, Canada, S.Blends Barbershop, its owners, employees, barbers, contractors, and web administrators shall not be liable for any indirect, incidental, special, consequential, or punitive damages of any kind, including but not limited to loss of profits, loss of data, loss of goodwill, personal injury, or property damage arising out of or in connection with:
        </p>
        <LegalList items={[
          "Your access to or use of (or inability to access or use) our website;",
          "Any conduct or content of any third party linked to or integrated with our website;",
          "Any service(s) performed or not performed at our physical locations;",
          "Unauthorized access to or alteration of your personal data."
        ]} />
        <p>
          In jurisdictions that do not allow the exclusion or limitation of certain damages, our liability will be limited to the greatest extent permitted by law. In no event shall our total aggregate liability to you exceed the total amount you paid to us for services in the 12 months preceding the claim.
        </p>
        <p>
          Nothing in these Terms shall limit or exclude our liability for fraud, death or personal injury caused by negligence, or any other liability that cannot be excluded by applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="10. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless S.Blends Barbershop, its owners, employees, contractors, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of our website or services in breach of these Terms; (b) your violation of any applicable law or the rights of any third party; or (c) any content you submit to us.
        </p>
      </LegalSection>

      <LegalSection heading="11. Governing Law &amp; Dispute Resolution">
        <LegalSubSection heading="11.1 Governing Law">
          <p>
            These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the laws of the <strong className="text-white">Province of Ontario</strong> and the federal laws of Canada applicable therein, without regard to conflict of law principles.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="11.2 Jurisdiction">
          <p>
            Any legal proceedings arising out of or related to these Terms or our services shall be submitted to the exclusive jurisdiction of the courts of the Province of Ontario, sitting in the City of Toronto or the Town of Oakville, as applicable.
          </p>
        </LegalSubSection>

        <LegalSubSection heading="11.3 Informal Dispute Resolution">
          <p>
            Before initiating any formal legal proceeding, we encourage you to contact us directly at info@sblendsbarbershop.ca or (289) 725-6333 to attempt to resolve any dispute informally. We will make a good-faith effort to address your concern within 15 business days.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection heading="12. Severability">
        <p>
          If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, or if it cannot be so modified, severed from these Terms. The remaining provisions shall continue in full force and effect.
        </p>
      </LegalSection>

      <LegalSection heading="13. Waiver">
        <p>
          No failure or delay by S.Blends Barbershop in exercising any right or enforcing any provision of these Terms shall operate as a waiver of that right or provision. Any waiver must be made in writing and signed by an authorized representative of S.Blends to be effective.
        </p>
      </LegalSection>

      <LegalSection heading="14. Entire Agreement">
        <p>
          These Terms, together with our Privacy Policy, Cookie Policy, and Email/SMS Compliance Policy, constitute the entire agreement between you and S.Blends Barbershop with respect to your use of our website and services, and supersede all prior or contemporaneous agreements, representations, warranties, and understandings, whether written or oral.
        </p>
      </LegalSection>

      <LegalSection heading="15. Changes to These Terms">
        <p>
          We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. Your continued use of the website or services after the posting of changes constitutes your acceptance of the updated Terms. We encourage you to review these Terms periodically.
        </p>
      </LegalSection>

      <LegalSection heading="16. Contact Us">
        <div className="bg-black/30 border border-white/10 rounded-xl p-5">
          <p className="text-white font-semibold">S.Blends Barbershop</p>
          <p className="mt-2">150 Oak Park Blvd, Unit 5, Oakville, ON L6H 3P2</p>
          <p>Phone: (289) 725-6333</p>
          <p>Email: <a href="mailto:info@sblendsbarbershop.ca" className="text-gold hover:underline">info@sblendsbarbershop.ca</a></p>
          <p>Website: <a href="https://sblendsbarbershop.ca" className="text-gold hover:underline">sblendsbarbershop.ca</a></p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
