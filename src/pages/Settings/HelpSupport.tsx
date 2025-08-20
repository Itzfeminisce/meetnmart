import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Search,
  BookOpen,
  Shield,
  Users,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpSupport = () => {
  const faqItems = [
    {
      question: "How do I start a call with a seller?",
      answer: "Navigate to the seller's profile and tap the call button. Make sure you have a stable internet connection for the best experience."
    },
    {
      question: "How does the escrow system work?",
      answer: "Our escrow system holds your payment securely until you confirm receipt of your order. This ensures safe transactions for both buyers and sellers."
    },
    {
      question: "What if I have issues with my order?",
      answer: "Contact the seller directly through the chat or call feature. If the issue persists, reach out to our support team for assistance."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to Settings > Basic Information to update your personal details, profile picture, and contact information."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption to protect your payment information. We never store your full card details on our servers."
    }
  ];

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      href: "#",
      badge: "24/7"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: Mail,
      action: "Send Email",
      href: "mailto:support@meetnmart.com"
    },
    {
      title: "Phone Support",
      description: "Call us directly",
      icon: Phone,
      action: "Call Now",
      href: "tel:+1234567890"
    }
  ];

  const helpResources = [
    {
      title: "User Guide",
      description: "Complete guide to using MeetNMart",
      icon: BookOpen,
      href: "#"
    },
    {
      title: "Privacy Policy",
      description: "Learn about our data practices",
      icon: Shield,
      href: "#"
    },
    {
      title: "Terms of Service",
      description: "Our terms and conditions",
      icon: FileText,
      href: "#"
    },
    {
      title: "Community Guidelines",
      description: "Rules for using our platform",
      icon: Users,
      href: "#"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with your account, transactions, and platform features
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Support Channels */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Get Support</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <channel.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{channel.title}</h3>
                      {channel.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {channel.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {channel.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link to={channel.href}>
                        {channel.action}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        <Card>
          <CardContent className="p-0">
            {faqItems.map((item, index) => (
              <div key={index}>
                <div className="p-4 hover:bg-muted/50 transition-colors">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <h3 className="font-medium text-left">{item.question}</h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                </div>
                {index < faqItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Help Resources */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Help Resources</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {helpResources.map((resource, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <resource.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={resource.href}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Still Need Help?</span>
          </CardTitle>
          <CardDescription>
            Our support team is here to help you with any questions or issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Business Hours</h4>
              <p className="text-sm text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Response Time</h4>
              <p className="text-sm text-muted-foreground">
                Email: Within 24 hours<br />
                Live Chat: Instant<br />
                Phone: Immediate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupport;