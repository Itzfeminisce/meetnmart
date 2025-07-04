import React from 'react';
import PolicyLayout from '@/components/PolicyLayout';
import { 
  PolicySection,
  PolicySubsection,
  PolicyParagraph,
  PolicyList,
  PolicyLink,
  PolicyTable
} from '@/components/PolicyStyles';

const LAST_UPDATED_DATE="4th of April, 2025"
const COMPANY_NAME="MeetnMart"
const COMPANY_ADDRESS="2, Ilotin Quaters Off Ijoka Road, Akure, Ondo State"
const COMPANY_EMAIL="info@meetnmart.com"


const PrivacyPolicy = () => {
  return (
    <PolicyLayout 
      title="Privacy Policy" 
      updatedDate={LAST_UPDATED_DATE}
    >
      <PolicyParagraph>
        Welcome to MeetnMart ("Platform") operated by {COMPANY_NAME} ("we," "us," "our"). 
        We respect your privacy and are committed to protecting your personal data. This Privacy 
        Policy explains how we collect, use, disclose, and safeguard your information when you 
        visit or use our Platform. By accessing or using MeetnMart, you ("you," "your") consent 
        to the data practices described in this Policy.
      </PolicyParagraph>

      <PolicySection title="1. Introduction">
        <PolicyParagraph>
          This section introduces our commitment to protecting your personal data and your consent 
          to these practices by using our Platform.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="2. Data Controller">
        <PolicyList items={[
          "Name: {COMPANY_NAME}",
          `Registered Address: ${COMPANY_ADDRESS}`,
          "Privacy Contact Email: {COMPANY_EMAIL"
        ]} />
      </PolicySection>

      <PolicySection title="3. Types of Data We Collect">
        <PolicyParagraph>
          We collect the following categories of personal data:
        </PolicyParagraph>
        <PolicyList items={[
          "Registration Data (name, email, phone number, etc.)",
          "Transaction Data (payment details, purchase history)",
          "Profile & Usage Data (preferences, interactions, browsing behavior)",
          "Communication Data (messages, call recordings, support tickets)",
          "Technical Data (IP address, device information, cookies)"
        ]} />
      </PolicySection>

      <PolicySection title="4. How We Collect Data">
        <PolicySubsection title="Directly from You">
          <PolicyParagraph>
            When you register, update your profile, initiate calls, or contact support.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Automatically">
          <PolicyParagraph>
            Through cookies and similar technologies when you browse or use the Platform.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="From Third Parties">
          <PolicyParagraph>
            Payment processors (e.g. Paystack, Flutterwave), analytics providers, and AI moderation services.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="5. Cookies & Tracking Technologies">
        <PolicyParagraph>
          We use cookies, web beacons, and similar tools to:
        </PolicyParagraph>
        <PolicyList items={[
          "Enable core functionality (essential cookies)",
          "Analyze performance and usage (analytics cookies)",
          "Facilitate marketing and promotions (marketing cookies)"
        ]} />
        <PolicyParagraph>
          You can control cookies via your browser settings or our Cookie Preference Center. 
          Disabling non-essential cookies may affect Platform functionality.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="6. Purpose & Legal Basis for Processing">
        <PolicyTable
          headers={["Purpose", "Data Category", "Legal Basis (NDPA 2023)"]}
          rows={[
            ["User registration & authentication", "Registration Data", "Consent; Contract performance"],
            ["Transaction processing", "Transaction Data", "Contract performance; Legal obligation"],
            ["Platform personalization", "Profile & Usage Data", "Legitimate interests"],
            ["Customer support & dispute resolution", "Communication Data", "Consent; Legal obligation"],
            ["Fraud prevention & security", "All categories", "Legitimate interests; Compliance with law"],
            ["Marketing & promotions", "Profile & Usage Data", "Consent"]
          ]}
        />
      </PolicySection>

      <PolicySection title="7. Data Sharing & Third-Party Processors">
        <PolicyParagraph>
          We share your personal data with:
        </PolicyParagraph>
        <PolicyList items={[
          "Payment Processors: To facilitate payments and refunds",
          "Live-Call Providers: To enable audio/video interactions",
          "Delivery Partners: To coordinate logistics",
          "Analytics & AI Moderation Services: To improve and secure the Platform"
        ]} />
        <PolicyParagraph>
          All third parties are bound by written contracts requiring them to use your data only 
          for specified purposes and to implement appropriate security measures.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="8. Data Retention">
        <PolicyParagraph>
          We retain personal data only as long as necessary to:
        </PolicyParagraph>
        <PolicyList items={[
          "Fulfill the purposes outlined in this Policy",
          "Comply with legal obligations (e.g. tax recordkeeping under the Finance Act 2020)",
          "Resolve disputes and enforce our agreements"
        ]} />
        <PolicyParagraph>
          When data is no longer required, we securely delete or anonymize it.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="9. Your Rights under NDPA 2023">
        <PolicyParagraph>
          Under the Nigeria Data Protection Act 2023, you have the right to:
        </PolicyParagraph>
        <PolicyList items={[
          "Access: Obtain confirmation of whether we process your data and access that data",
          "Correction: Request correction of inaccurate or incomplete data",
          "Deletion: Request erasure of your data when it is no longer necessary",
          "Withdrawal of Consent: Withdraw consent where processing is based on consent",
          "Object: Object to processing based on legitimate interests",
          "Complaint: Lodge a complaint with the Nigeria Data Protection Commission"
        ]} />
        <PolicyParagraph>
          To exercise any right, contact us at <PolicyLink href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</PolicyLink>. 
          We will respond within statutory timelines.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="10. Security Measures">
        <PolicyParagraph>
          We implement technical and organizational measures to protect your data, including:
        </PolicyParagraph>
        <PolicyList items={[
          "Encryption of data in transit and at rest",
          "Access controls and authentication mechanisms",
          "Regular security assessments and audits"
        ]} />
      </PolicySection>

      <PolicySection title="11. International Transfers">
        <PolicyParagraph>
          If we transfer your data outside Nigeria, we ensure adequate safeguards (e.g., standard 
          contractual clauses) to comply with NDPA requirements.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="12. Children's Privacy">
        <PolicyParagraph>
          Our Platform is not intended for children under 18. We do not knowingly collect data from 
          minors. If we learn that we have inadvertently collected data of a child, we will delete 
          it immediately.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="13. Changes to This Policy">
        <PolicyParagraph>
          We may update this Privacy Policy as required by law or business needs. We will notify you 
          of material changes via the Platform or email. Continued use after changes constitutes acceptance.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="14. Contact Us">
        <PolicyParagraph>
          For privacy inquiries or to exercise your rights, contact:
        </PolicyParagraph>
        <PolicyList items={[
          `Email: ${COMPANY_EMAIL}`,
          `Address: ${COMPANY_ADDRESS}`
        ]} />
      </PolicySection>
    </PolicyLayout>
  );
};

export default PrivacyPolicy;