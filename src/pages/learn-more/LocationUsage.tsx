import ContentPageLayout from "@/components/content/ContentPageLayout";
import { ContentHighlight, ContentLink, ContentList, ContentSection, ContentSubsection, ContentTable, ContentText } from "@/components/content/ContentStyles";

const LocationUsagePage = () => {
  return (
    <ContentPageLayout 
      title="How We Use Your Location" 
      updatedDate="May 29, 2025"
      accentColor="text-accent-primary"
    >
      {/* Introduction Section */}
      <ContentSection title="📍 Understanding Location Services">
        <ContentText>
          At our platform, your location helps create a personalized, efficient marketplace experience while maintaining the highest privacy standards.
        </ContentText>
        
        <div className="bg-background-secondary p-6 rounded-lg border-l-4 border-accent-primary mt-4">
          <ContentHighlight>
            Quick Summary: We only access your location when you actively use features that require it, and never share your precise location with other users.
          </ContentHighlight>
        </div>
      </ContentSection>

      {/* Core Features Section */}
      <ContentSection title="✨ Core Benefits">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background-secondary p-5 rounded-lg">
            <ContentSubsection title="Relevant Local Results">
              <ContentList items={[
                "See sellers within your preferred distance",
                "Get accurate delivery time estimates",
                "Discover trending products in your area"
              ]} />
            </ContentSubsection>
          </div>
          
          <div className="bg-background-secondary p-5 rounded-lg">
            <ContentSubsection title="Enhanced Transactions">
              <ContentList items={[
                "Faster order processing",
                "Better delivery routing",
                "Accurate meetup coordination"
              ]} />
            </ContentSubsection>
          </div>
        </div>
      </ContentSection>

      {/* Detailed Usage Section */}
      <ContentSection title="🔍 Detailed Usage Breakdown">
        <ContentSubsection title="For Buyers">
          <ContentTable
            headers={["Feature", "Location Precision", "Visibility"]}
            rows={[
              ["Seller Search", "Neighborhood-level", "Private"],
              ["Delivery Tracking", "Block-level", "Delivery agent only"],
              ["Market Trends", "City-level (aggregated)", "Public reports"]
            ]}
          />
        </ContentSubsection>

        <ContentSubsection title="For Sellers">
          <ContentList items={[
            "Demand heatmaps (aggregated data only)",
            "Delivery zone optimization",
            "Local promotion targeting"
          ]} />
        </ContentSubsection>
      </ContentSection>

      {/* Privacy Section */}
      <ContentSection title="🛡️ Your Privacy Controls">
        <ContentSubsection title="Transparent Options">
          <ContentList items={[
            "Precise vs approximate location toggle",
            "Temporary vs always-on permissions",
            "Feature-specific access controls"
          ]} />
        </ContentSubsection>

        <ContentSubsection title="Data Practices">
          <ContentTable
            headers={["Data Type", "Retention Period", "Usage"]}
            rows={[
              ["Precise coordinates", "24 hours", "Active transactions only"],
              ["Neighborhood data", "30 days", "Service improvement"],
              ["City-level trends", "1 year", "Market analysis"]
            ]}
          />
        </ContentSubsection>
      </ContentSection>

      {/* Technical Details */}
      <ContentSection title="⚙️ Technical Implementation">
        <ContentSubsection title="How It Works">
          <ContentList ordered items={[
            "You grant permission via browser/app settings",
            "We request location only when needed for active features",
            "Coordinates are encrypted during transmission",
            "Precise data is automatically depersonalized after 24 hours"
          ]} />
        </ContentSubsection>

        <ContentSubsection title="Security Measures">
          <ContentList items={[
            "End-to-end encryption for location data",
            "Regular third-party security audits",
            "Strict employee access controls"
          ]} />
        </ContentSubsection>
      </ContentSection>

      {/* Help Section */}
      <ContentSection title="❓ Need Help?">
        <ContentText>
          Learn more about managing location settings:
        </ContentText>
        
        <div className="mt-4 space-y-3">
          <ContentLink href="/help/location-android">
            Android Location Guide
          </ContentLink>
          <br />
          <ContentLink href="/help/location-ios">
            iOS Location Guide
          </ContentLink>
          <br />
          <ContentLink href="/privacy-policy" external>
            Full Privacy Policy
          </ContentLink>
        </div>

        <div className="bg-accent-primary/10 p-5 rounded-lg mt-6">
          <ContentHighlight className="text-lg">
            Remember: You're always in control. Disable location access anytime in your device settings, though some features may become limited.
          </ContentHighlight>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
};

export default LocationUsagePage;