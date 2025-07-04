import React from 'react';
import PolicyLayout from '@/components/PolicyLayout';
import { 
  PolicySection,
  PolicySubsection,
  PolicyParagraph,
  PolicyList,
  PolicyLink,
} from '@/components/PolicyStyles';

const CONTACT_EMAIL = "info@meetnmart.com"
const LAST_UPDATED_DATE = '4th of April, 2025';
const COMPANY_ADDRESS="2, Ilotin Quaters Off Ijoka Road, Akure, Ondo State"



const CookiePolicy = () => {
  return (
    <PolicyLayout 
      title="Cookie Policy" 
      updatedDate={LAST_UPDATED_DATE}
    >
      <PolicySection title="1. Introduction">
        <PolicyParagraph>
          This Cookie Policy explains how MeetnMart ("Platform", "we", "us", "our") uses cookies and 
          similar tracking technologies when you use our live negotiation marketplace platform. By using 
          MeetnMart, you consent to our use of cookies as described in this policy, unless you have 
          disabled them through your browser settings.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="2. What Are Cookies?">
        <PolicyParagraph>
          Cookies are small text files stored on your device when you visit websites. They help the 
          Platform remember information about your visit, which can make it easier to use and improve 
          your experience. We use both session cookies (which expire when you close your browser) and 
          persistent cookies (which stay on your device for a set period).
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="3. Why We Use Cookies">
        <PolicyParagraph>
          Cookies are essential for our live negotiation platform to function properly and securely. 
          They enable:
        </PolicyParagraph>
        <PolicyList items={[
          "Secure user authentication during live calls",
          "Maintaining your session while negotiating with sellers",
          "Remembering your preferences and settings",
          "Analyzing platform performance to improve service quality",
          "Protecting against fraud during transactions"
        ]} />
      </PolicySection>

      <PolicySection title="4. Categories of Cookies We Use">
        <PolicySubsection title="Essential Cookies">
          <PolicyParagraph>
            These are necessary for the Platform to function and cannot be switched off. They include:
          </PolicyParagraph>
          <PolicyList items={[
            "User authentication cookies for secure live calls",
            "Session cookies to maintain your negotiation context",
            "Security cookies to protect escrow transactions"
          ]} />
        </PolicySubsection>

        <PolicySubsection title="Analytics & Performance Cookies">
          <PolicyParagraph>
            These help us understand how users interact with our Platform:
          </PolicyParagraph>
          <PolicyList items={[
            "Call quality metrics to optimize live negotiations",
            "Feature usage to improve the marketplace experience",
            "Error tracking to enhance platform stability"
          ]} />
        </PolicySubsection>

        <PolicySubsection title="Functionality Cookies">
          <PolicyParagraph>
            These remember your preferences for a better experience:
          </PolicyParagraph>
          <PolicyList items={[
            "Language and regional settings",
            "Preferred seller categories",
            "Display preferences for the marketplace interface"
          ]} />
        </PolicySubsection>

        <PolicySubsection title="Marketing Cookies">
          <PolicyParagraph>
            These help us deliver relevant promotions (only with your consent):
          </PolicyParagraph>
          <PolicyList items={[
            "Personalized seller recommendations",
            "Special offer notifications",
            "Platform feature announcements"
          ]} />
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="5. Third-Party Cookies">
        <PolicyParagraph>
          We work with trusted partners who may set cookies for:
        </PolicyParagraph>
        <PolicyList items={[
          "Payment processors (e.g. Paystack, Flutterwave) for secure transactions",
          "Live call providers to enable audio/video negotiations",
          "Analytics services to improve platform performance",
          "AI moderation services to ensure safe interactions"
        ]} />
        <PolicyParagraph>
          These third parties have their own privacy policies and may use cookies as described in our 
          <PolicyLink href="/privacy-policy">Privacy Policy</PolicyLink>.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="6. Cookie Duration">
        <PolicyParagraph>
          Cookies remain on your device for different periods:
        </PolicyParagraph>
        <PolicyList items={[
          "Session cookies: Until you close your browser",
          "Persistent cookies: Typically 30 days to 1 year",
          "Security cookies: Up to 24 months for fraud prevention",
          "Analytics cookies: Usually 6-12 months"
        ]} />
      </PolicySection>

      <PolicySection title="7. Managing Cookies">
        <PolicyParagraph>
          You can control cookies through:
        </PolicyParagraph>
        <PolicySubsection title="Browser Settings">
          <PolicyParagraph>
            Most browsers allow you to refuse or delete cookies. Instructions are usually found in the 
            "Help" or "Preferences" section of your browser. However, disabling essential cookies may 
            prevent proper functioning of live negotiations and transactions.
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="Platform Cookie Preferences">
          <PolicyParagraph>
            You can manage non-essential cookies through our Cookie Preference Center, accessible via 
            your account settings.
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="Third-Party Controls">
          <PolicyParagraph>
            For third-party cookies (e.g. analytics), you may need to visit the provider's website to 
            opt out:
          </PolicyParagraph>
          <PolicyList items={[
            "Google Analytics: https://tools.google.com/dlpage/gaoptout",
            "Facebook: https://www.facebook.com/policies/cookies/"
          ]} />
        </PolicySubsection>
      </PolicySection>

      <PolicySection title="8. Changes to This Policy">
        <PolicyParagraph>
          We may update this Cookie Policy as our Platform evolves or legal requirements change. We will 
          notify you of significant changes through the Platform or via email.
        </PolicyParagraph>
      </PolicySection>

      <PolicySection title="9. Compliance & Contact">
        <PolicyParagraph>
          This Cookie Policy complies with the Nigeria Data Protection Regulation (NDPR) transparency 
          requirements and global best practices. For questions about our use of cookies, contact us at:
        </PolicyParagraph>
        <PolicyList items={[
          `Email: ${CONTACT_EMAIL}`,
          `Address: ${COMPANY_ADDRESS}`
        ]} />
      </PolicySection>
    </PolicyLayout>
  );
};

export default CookiePolicy;