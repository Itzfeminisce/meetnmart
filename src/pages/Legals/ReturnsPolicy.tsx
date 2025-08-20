import React from 'react';
import PolicyLayout from '@/components/PolicyLayout';
import { 
  PolicySection,
  PolicySubsection,
  PolicyParagraph,
  PolicyList,
  PolicyLink
} from '@/components/PolicyStyles';

const LAST_UPDATED_DATE = '4th of April, 2025';
const COMPANY_NAME = 'MeetnMart';
const ESCROW_RELEASE_DAYS = '[Not Decided]';
const REFUND_PROCESSING_DAYS = '[Not Decided]';
const CONTACT_EMAIL = 'info@meetnmart.com';
const SUPPORT_PORTAL_LINK = 'www.meetnmart.com';

const RefundsPolicy = () => {
  return (
    <PolicyLayout 
      title="Returns & Refunds Policy" 
      updatedDate={LAST_UPDATED_DATE}
    >
      <PolicySection title="1. Overview">
        <PolicyParagraph>
          {COMPANY_NAME} facilitates live, real-time negotiation and transactions between Buyers, 
          Sellers, and Service Providers. Because transactions occur over live audio/video calls 
          and often include perishable or custom-made goods and on-demand services, this Returns & 
          Refunds Policy balances Buyer protections under Nigerian law (e.g. Electronic Transactions 
          Act 2023, Federal Competition & Consumer Protection Act 2018) with the operational 
          realities and risk exposures of our Platform.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="2. Buyer Cancellation Rights">
        <PolicySubsection title="Pre-Delivery Cancellation">
          <PolicyParagraph>
            You may cancel any order at any time before the Seller confirms dispatch or service commencement.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Post-Delivery 'Cooling-Off' Right">
          <PolicyParagraph>
            Under Section 16(3) of the Electronic Transactions Act 2023, you have a seven (7)-day 
            period from delivery or service completion to cancel and request a refund, subject only 
            to return-shipping costs and any agreed service fees.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="3. Seller's Live-Negotiation Disclosures">
        <PolicyParagraph>
          Sellers must disclose any non-standard return conditions (e.g., restocking fees, custom 
          order non-returnable clauses) during the live call, before sale confirmation.
        </PolicyParagraph>
        <PolicyParagraph>
          Any such conditions become part of the binding contract only if they do not conflict with 
          your statutory rights under Nigerian law (e.g. cooling-off right).
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="4. Escrow & Refund Mechanics">
        <PolicySubsection title="Escrow Holding">
          <PolicyParagraph>
            All Buyer payments are held in escrow until release.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Release on Confirmation">
          <PolicyParagraph>
            You, the Buyer, must explicitly release funds upon satisfaction.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Automatic Release">
          <PolicyParagraph>
            If you do not release within {ESCROW_RELEASE_DAYS} of delivery or service completion, 
            funds automatically release to the Seller and other entitled parties.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Refund Trigger">
          <PolicyParagraph>
            If you validly cancel or exercise your cooling-off right, the escrowed funds (minus 
            allowable costs) are returned to you within {REFUND_PROCESSING_DAYS}.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="5. Return Shipping & Costs">
        <PolicySubsection title="Physical Goods">
          <PolicyParagraph>
            You are responsible for return shipping unless the item is defective, damaged, or not as 
            described—then the Seller or {COMPANY_NAME} covers reasonable return shipping costs.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Services & Digital Goods">
          <PolicyParagraph>
            Because services are delivered live, refunds for service dissatisfaction are handled 
            case-by-case. You may request partial or full refund; {COMPANY_NAME} will mediate based 
            on call recordings and evidence.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="6. Refund Exceptions & Deductions">
        <PolicyParagraph>
          We may deduct from your refund:
        </PolicyParagraph>
        <PolicyList items={[
          "Reasonable shipping or logistics costs actually incurred",
          "Non-refundable transaction fees charged by payment providers (per Section 6 of our Terms)",
          "Any platform service fees where services were fully rendered and accepted (to cover our operational costs)"
        ]} />
      </PolicySection>

      <PolicySection title="7. Dispute & Mediation Process">
        <PolicySubsection title="Initiation">
          <PolicyParagraph>
            To request a refund, submit a claim via our in-Platform support within seven (7) days of delivery/completion.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Evidence Review">
          <PolicyParagraph>
            We review live-call recordings, chat logs, and delivery confirmations.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Mediation">
          <PolicyParagraph>
            If Buyer and Seller disagree, {COMPANY_NAME} will mediate. If unresolved within fourteen (14) days, 
            escalate to the Federal Competition & Consumer Protection Commission mediation process under FCCPA guidelines.
          </PolicyParagraph>
        </PolicySubsection>
        <PolicySubsection title="Final Resolution">
          <PolicyParagraph>
            Unresolved disputes may proceed to binding arbitration or Lagos State courts as per our Terms of Service.
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="8. Company Protections">
        <PolicyList items={[
          `${COMPANY_NAME} may withhold refunds if we detect fraud, abuse, or collusion intended to manipulate escrow`,
          "We reserve the right to charge a dispute-resolution fee to discourage frivolous claims",
          "We may amend this Policy at any time; material changes will be communicated via the Platform"
        ]} />
      </PolicySection>

      <PolicySection title="9. Contact for Returns & Refunds">
        <PolicyParagraph>
          For questions or to file a return/refund request, contact us:
        </PolicyParagraph>
        <PolicyList items={[
          `Email: ${CONTACT_EMAIL}`,
          `Support Portal: ${SUPPORT_PORTAL_LINK}`
        ]} />
        <PolicyParagraph>
          References: Electronic Transactions Act 2023, Section 16(3) on cooling-off rights; Federal 
          Competition & Consumer Protection Act 2018 on consumer cancellation rights and mediation; 
          Terms of Service Section 6 on escrow and fees.
        </PolicyParagraph>
      </PolicySection>
    </PolicyLayout>
  );
};

export default RefundsPolicy;