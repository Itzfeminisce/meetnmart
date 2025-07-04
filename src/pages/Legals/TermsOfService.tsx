import React from 'react';
import PolicyLayout from '@/components/PolicyLayout';
import { 
  PolicySection,
  PolicySubsection,
  PolicyParagraph,
  PolicyList,
  PolicyLink,
  PolicyEmphasis
} from '@/components/PolicyStyles';

const LAST_UPDATED_DATE="4th of April, 2025"
const COMPANY_NAME="MeetnMart"
const COMPANY_EMAIL="info@meetnmart.com"
const COMMISION_RATE="[Not Decided]"
const AUTOMATIC_RELEASE_DATE="[Not Decided]"
const REFUND_PROCESSING_DAYS="[Not Decided]"

const TermsOfService = () => {
  return (
    <PolicyLayout 
      title="Terms of Service" 
      updatedDate={LAST_UPDATED_DATE}
    >
      <PolicyParagraph>
        Welcome to MeetnMart. Please read these Terms of Service carefully before using our platform.
        By accessing or using MeetnMart, you agree to be bound by these Terms.
      </PolicyParagraph>

      <PolicySection title="1. Acceptance of Terms">
        <PolicyParagraph>
          You ("Buyer," "Seller," or "Service Provider") agree to these Terms by registering, browsing, 
          initiating live calls, negotiating, or completing any transaction on MeetnMart ("Platform"), 
          operated by {COMPANY_NAME} ("we," "us," "our"). If you do not agree, do not use the Platform.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="2. Eligibility">
        <PolicyParagraph>
          You must be at least 18 years old and legally capable of entering contracts in Nigeria. 
          You confirm that you have authority to transact under Nigerian law.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="3. Account Responsibilities">
        <PolicyParagraph>
          You agree to:
        </PolicyParagraph>
        <PolicyList items={[
          "Provide accurate, current, complete information",
          "Secure your account credentials; you are responsible for all activity under your account",
          "Notify us immediately of any unauthorized use"
        ]} />
      </PolicySection>

      <PolicySection title="4. Platform Services">
        <PolicyParagraph>
          MeetnMart enables you to:
        </PolicyParagraph>
        <PolicyList items={[
          "Select real-world markets by location and browse vendor categories",
          "Initiate live audio/video calls to negotiate with Sellers",
          "Invite Service Providers (e.g. delivery riders) into calls for coordination",
          "Use escrow-backed payments for security",
          "View live activity metrics (e.g. user counts)",
          "Engage under AI moderation to prevent abuse, hate speech, or illegal sales"
        ]} />
      </PolicySection>

      <PolicySection title="5. Fees & Escrow">
        <PolicySubsection title="Commission & Fees">
          <PolicyParagraph>
            When you pay, the total amount includes payment-provider fees, VAT, and our platform service fee ({COMMISION_RATE}). 
            We may change our service fee or allocation at any time without notice.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Escrow">
          <PolicyParagraph>
            Your payment goes into escrow until you confirm receipt and satisfaction.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Automatic Release">
          <PolicyParagraph>
            If you do not release funds within {AUTOMATIC_RELEASE_DATE} of delivery or service completion, we will automatically 
            release funds to the Seller and other entitled parties.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="6. Prohibited Conduct">
        <PolicyParagraph>
          You must not:
        </PolicyParagraph>
        <PolicyList items={[
          "Offer or purchase firearms, illicit drugs, hate-inciting content, or government-restricted goods/services",
          "Engage in fraud, money-laundering, or deceptive practices",
          "Infringe third-party rights or post defamatory, harassing, or obscene content"
        ]} />
        <PolicyParagraph>
          Violation may result in suspension, termination, and legal liability.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="7. Order Formation & Pricing">
        <PolicyParagraph>
          A binding contract forms when we send your order confirmation.
        </PolicyParagraph>
        <PolicyParagraph>
          All prices include VAT as required by the Finance Act 2020.
        </PolicyParagraph>
        <PolicyParagraph>
          You are responsible for any additional duties or taxes on international orders.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="8. Cancellation & Refunds">
        <PolicySubsection title="Pre-Delivery">
          <PolicyParagraph>
            You may cancel before the Seller dispatches goods or begins service.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Post-Delivery Cooling-Off">
          <PolicyParagraph>
            You have seven (7) days from delivery or service completion to cancel under Section 16(3) of the 
            Electronic Transactions Act 2023; you may only be charged return-shipping costs.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Seller Conditions">
          <PolicyParagraph>
            Any additional restocking fees or conditions must be disclosed during live calls and cannot override 
            your statutory rights.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Refund Process">
          <PolicyParagraph>
            Valid refunds (minus allowable costs) are processed within {REFUND_PROCESSING_DAYS} of cancellation confirmation.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="9. Dispute Resolution">
        <PolicySubsection title="1. Informal">
          <PolicyParagraph>
            Raise disputes via in-Platform support within seven (7) days of the issue.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="2. Mediation">
          <PolicyParagraph>
            If unresolved in 14 days, escalate to FCCPC mediation under the Federal Competition and Consumer Protection Act.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="3. Arbitration/Court">
          <PolicyParagraph>
            Unresolved disputes may be submitted to binding arbitration or Lagos State courts, Nigeria.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="10. Limitation of Liability">
        <PolicyParagraph>
          To the fullest extent allowed by law, we are not liable for indirect, incidental, or consequential 
          damages arising from your use of the Platform.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="11. Indemnification">
        <PolicyParagraph>
          You will indemnify and hold us harmless from any claims, losses, or expenses (including legal fees) 
          arising from your breach of these Terms or violation of law.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="12. Intellectual Property">
        <PolicyParagraph>
          All Platform content is owned or licensed by us and protected under Nigerian copyright and trademark laws. 
          You may not reproduce or use our content without written permission.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="13. Privacy">
        <PolicyParagraph>
          Your use of data and personal information is governed by our <PolicyLink href="/privacy-policy">Privacy Policy</PolicyLink>, 
          which you should review carefully.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="14. Modifications">
        <PolicyParagraph>
          We may revise these Terms at any time by posting updated Terms on the Platform. Continued use constitutes acceptance.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="15. Governing Law">
        <PolicyParagraph>
          These Terms are governed by Nigerian law. Disputes will be resolved exclusively in Lagos State courts or by agreed arbitration.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="Disclaimer">
        <PolicySubsection title="1. No Professional Advice">
          <PolicyParagraph>
            All information, content, and materials on MeetnMart are provided for general informational purposes only. 
            You should not rely on any content as professional advice (legal, financial, medical, or otherwise). 
            Always seek the advice of a qualified professional before making decisions.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="2. 'As-Is' and 'As-Available'">
          <PolicyParagraph>
            MeetnMart and its services are provided on an "as-is" and "as-available" basis. We expressly disclaim all warranties, 
            whether express or implied, including but not limited to merchantability, fitness for a particular purpose, 
            and non-infringement.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="3. No Guarantee of Outcomes">
          <PolicyParagraph>
            We do not guarantee that transactions will be successful, that Sellers will perform as expected, or that any goods 
            or services will meet your expectations. All negotiations and agreements occur directly between Buyers, Sellers, 
            and Service Providers.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="4. Limitation of Liability">
          <PolicyParagraph>
            To the fullest extent permitted by law, MeetnMart, its affiliates, officers, directors, employees, and agents are not 
            liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your use of 
            the Platform, even if we have been advised of the possibility of such damages.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="5. External Links">
          <PolicyParagraph>
            Our Platform may contain links to third-party sites. We do not endorse and are not responsible for their content, 
            practices, or privacy policies.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="6. Changes">
          <PolicyParagraph>
            We may update this Disclaimer at any time by posting a new version on the Platform. Your continued use constitutes 
            acceptance of the changes.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="Intellectual Property Notice">
        <PolicySubsection title="1. Ownership">
          <PolicyParagraph>
            All content on MeetnMart—including text, graphics, logos, button icons, images, audio clips, video clips, 
            digital downloads, data compilations, and software—is the property of {COMPANY_NAME} or its content suppliers 
            and is protected by Nigerian and international copyright, trademark, and other intellectual property laws.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="2. Limited License">
          <PolicyParagraph>
            You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for your personal, 
            non-commercial use, subject to these Terms. You may not reproduce, distribute, modify, create derivative works of, 
            publicly display, or in any way exploit any portion of the Platform without our prior written consent.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="3. Trademarks">
          <PolicyParagraph>
            "MeetnMart" and our logos are trademarks or registered trademarks of {COMPANY_NAME}. You may not use these 
            trademarks in connection with any product or service that is not MeetnMart's, or in any manner that disparages 
            or discredits our brand.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="4. User-Generated Content">
          <PolicyParagraph>
            By posting content (e.g., product photos, reviews, comments) on the Platform, you grant MeetnMart a worldwide, 
            royalty-free, perpetual, irrevocable, sublicensable, and transferable license to use, reproduce, distribute, 
            prepare derivative works of, display, and perform that content in connection with operating and promoting the Platform.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="5. Reporting Infringement">
          <PolicyParagraph>
            If you believe your intellectual property rights have been infringed, please notify us immediately with:
          </PolicyParagraph>
          <PolicyList items={[
            "A description of the copyrighted work or trademark you claim has been infringed",
            "The URL or location on the Platform where the material appears",
            "Your contact information and a statement of good-faith belief that use is unauthorized"
          ]} />
          <PolicyParagraph>
            Send notices to: <PolicyLink href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</PolicyLink>.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="6. Remedies">
          <PolicyParagraph>
            We will investigate and may remove or disable access to the allegedly infringing material. We reserve all rights 
            to seek legal remedies against infringers.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="Contact Information">
        <PolicyParagraph>
          If you have any questions about these Terms, please contact us at <PolicyLink href="mailto:info@meetnmart.com">info@meetnmart.com</PolicyLink> 
          or visit our website at <PolicyLink href="https://www.meetnmart.com" external>www.meetnmart.com</PolicyLink>.
        </PolicyParagraph>
      </PolicySection>
    </PolicyLayout>
  );
};

export default TermsOfService;