// components/FeedPreview.tsx
import React from 'react';
import {
  Phone,
  MessageCircle,
  Truck,
  Clock,
  Users,
  Zap,
  Timer,
  MapPin,
  Hash,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeedFormData } from './schema';
import { FeedItem, FeedItemPreview } from '@/types';

interface FeedPreviewProps {
  formData: FeedItemPreview;
  uploadedImages?: string[];
}

const inferCategory = (content: string): string => {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('fish')) return 'Fish';
  if (lowerContent.includes('phone') || lowerContent.includes('electronic')) return 'Electronics';
  if (lowerContent.includes('tomato')) return 'Tomatoes';
  if (lowerContent.includes('deliver')) return 'Logistics';
  if (lowerContent.includes('fashion') || lowerContent.includes('cloth')) return 'Fashion';

  return 'General';
};

const extractPriceInfo = (content: string): string | null => {
  const priceMatch = content.match(/₦[\d,]+/);
  if (priceMatch) return priceMatch[0];
  if (content.includes('naira') || content.includes('budget')) return "Negotiable";
  return null;
};

const extractQuantity = (content: string): string | null => {
  const qtyMatch = content.match(/\d+\s?(kg|cup|basket|piece|liter)/i) || content.match(/\d+/);
  return qtyMatch ? (qtyMatch[0] + (qtyMatch[1] || "")) : "As needed";
};

const shouldShowDelivery = (content: string): boolean => {
  return content.toLowerCase().includes('deliver') || content.toLowerCase().includes('urgent');
};

const generateTitle = (content: string): string => {
  if (content.length > 30) {
    return content.substring(0, 30).trim() + "...";
  }

  const firstSentence = content.split('.')[0];
  if (firstSentence && firstSentence.length < 50) {
    return firstSentence;
  }

  return content.substring(0, 25) + "...";
};

const getCardStyle = (type: string) => {
  const baseStyle = 'hover:shadow-md transition-shadow rounded-none';

  switch (type) {
    case "buyer_request":
      return `${baseStyle} border-l-4 border-l-market-blue bg-market-blue/5 dark:bg-market-blue/20`;
    case "seller_offer":
      return `${baseStyle} border-l-4 border-l-market-green bg-market-green/5 dark:bg-market-green/20`;
    case "delivery_ping":
      return `${baseStyle} border-l-4 border-l-market-purple bg-market-purple/5 dark:bg-market-purple/20`;
    default:
      return `${baseStyle} border border-gray-200 dark:border-gray-700`;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "buyer_request":
      return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case "seller_offer":
      return <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "delivery_ping":
      return <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    default:
      return <Hash className="w-4 h-4 text-market-orange dark:text-market-orange/80" />;
  }
};

export const FeedPreview: React.FC<FeedPreviewProps> = ({ formData, uploadedImages = [] }) => {
  console.log({ formData });

  const category = formData.category; //inferCategory(formData.content);
  const priceInfo = formData.price_range; //extractPriceInfo(formData.content);
  const quantity = formData.quantity; //extractQuantity(formData.content);
  const showDelivery = formData.delivery_preference; //shouldShowDelivery(formData.content);
  const title = formData.title; //generateTitle(formData.content);

  const getUrgencyText = () => {
    switch (formData.urgency) {
      case "high": return "ASAP";
      case "medium": return "Today";
      case "low": return "No rush";
      default: return "Not Specified";
    }
  };

  return (
    <div className="space-y-4">
      <Card className={getCardStyle("buyer_request")}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {getTypeIcon("buyer_request")}
                  <span className="font-semibold text-base sm:text-lg text-foreground truncate">
                    {title}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed break-words">
                  {formData.content}
                </p>

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={image}
                              alt={`Uploaded ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {priceInfo && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Price:</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {priceInfo}
                  </span>
                </div>
              )}
              {quantity && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Qty:</span>
                  <span>{quantity}</span>
                </div>
              )}
              {formData.urgency && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  Urgency:
                  <span className="text-orange-600 dark:text-orange-400 font-medium ml-1">
                    {getUrgencyText()}
                  </span>
                </div>
              )}
              {showDelivery && (
                <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                  <Truck className="w-3 h-3" />
                  <span className="text-xs font-medium">{formData.delivery_preference ? "Delivery Required" : "Not Needed"}</span>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between  w-full gap-4">
                <div className="flex items-center gap-x-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{formData.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formData.needed_by}</span>
                  </div>
                </div>


                {/* Desktop Action Buttons */}
                <div className="hidden sm:block">
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 opacity-50">
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 opacity-50">
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 opacity-50">
                      <Truck className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="sm:hidden">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 opacity-50">
                    <Phone className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 opacity-50">
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 opacity-50">
                    <Truck className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};