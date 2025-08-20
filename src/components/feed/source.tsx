import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Plus, 
  Phone, 
  MessageCircle, 
  Truck, 
  TrendingUp,
  Clock,
  Users,
  Zap,
  Edit3,
  Send,
  AlertCircle,
  Timer,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FeedPage = () => {
  const [selectedMarket, setSelectedMarket] = useState("Balogun Market");
  const [feedFilter, setFeedFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Balogun Market, Lagos");
  const [urgency, setUrgency] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const markets = ["Balogun Market", "Alaba Market", "Computer Village", "Oke Arin Market"];
  const locations = [
    "Balogun Market, Lagos",
    "Alaba Market, Lagos", 
    "Computer Village, Lagos",
    "Oke Arin Market, Lagos"
  ];

  const categories = ["Fish", "Tomatoes", "Fashion", "Electronics", "Logistics", "Grains"];

  const urgencyLevels = [
    { value: "low", label: "No rush", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Today", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  const pulseData = [
    {
      id: "1",
      type: "buyer_request",
      title: "Fresh Catfish Needed",
      content: "Looking for fresh catfish, about 2kg. Prefer live fish if possible for weekend family gathering.",
      category: "Fish",
      price_range: "₦4,000 - ₦6,000",
      needed_by: "Today 6PM",
      quantity: "2kg",
      delivery_preference: false,
      location: "Balogun Market",
      market_id: "balogun_market",
      created_by: "user_kemi_a",
      created_at: "2024-12-06T14:45:00Z",
      source: "user"
    },
    {
      id: "2", 
      type: "seller_offer",
      title: "Premium Fresh Catfish Available",
      content: "Fresh catfish just arrived this morning from farm. Various sizes available, very healthy fish.",
      category: "Fish",
      price_range: "₦2,500/kg",
      needed_by: null,
      quantity: "20kg+ available",
      delivery_preference: true,
      location: "Balogun Market",
      market_id: "balogun_market", 
      created_by: "user_musa_fish",
      created_at: "2024-12-06T14:42:00Z",
      source: "user"
    },
    {
      id: "3",
      type: "delivery_ping",
      title: "Bike Delivery Available Now",
      content: "Available for quick deliveries around Balogun area. Bike is ready, can handle fragile items too.",
      category: "Logistics",
      price_range: "₦500 - ₦2,000",
      needed_by: null,
      quantity: null,
      delivery_preference: true,
      location: "Near Balogun Market", 
      market_id: "balogun_market",
      created_by: "user_ahmed_d",
      created_at: "2024-12-06T14:39:00Z",
      source: "user"
    },
    {
      id: "4",
      type: "buyer_request",
      title: "Urgent Phone Accessories Delivery",
      content: "Need phone cases and chargers delivered to Victoria Island urgently. Can pay premium for speed.",
      category: "Electronics",
      price_range: "₦15,000 budget",
      needed_by: "Within 2 hours",
      quantity: "Mixed items",
      delivery_preference: true,
      location: "Computer Village",
      market_id: "computer_village",
      created_by: "user_david_o", 
      created_at: "2024-12-06T14:32:00Z",
      source: "user"
    },
    {
      id: "5",
      type: "seller_offer",
      title: "Bulk Tomatoes - Market Rate",
      content: "Fresh tomatoes direct from farm. Quality guaranteed, perfect for restaurants and bulk buyers.",
      category: "Tomatoes", 
      price_range: "₦800/basket",
      needed_by: null,
      quantity: "50+ baskets",
      delivery_preference: false,
      location: "Oke Arin Market",
      market_id: "oke_arin_market",
      created_by: "sim_entity_001",
      created_at: "2024-12-06T14:28:00Z", 
      source: "simulated"
    }
  ];

  const getCardStyle = (type) => {
    switch(type) {
      case "buyer_request":
        return "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20";
      case "seller_offer":
        return "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20";
      case "delivery_ping":
        return "border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "buyer_request": return <Users className="w-4 h-4 text-blue-600" />;
      case "seller_offer": return <Zap className="w-4 h-4 text-green-600" />;
      case "delivery_ping": return <Truck className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getPlaceholder = () => {
    const examples = [
      "Looking for fresh tomatoes, 5kg for my restaurant...",
      "Selling premium rice, ₦800/cup, delivery available...",
      "Available for deliveries in Ikeja area, bike ready...",
      "Need urgent phone repair, screen cracked..."
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  };

  const generatePreviewCard = () => {
    if (!postContent.trim()) return null;
    
    return {
      id: "preview",
      type: "buyer_request", // This would be auto-detected by AI
      title: "Your Market Request", // Would be AI-generated
      content: postContent,
      category: "General", // Would be AI-inferred
      price_range: null, // Would be AI-extracted if mentioned
      needed_by: urgency === "high" ? "ASAP" : urgency === "medium" ? "Today" : null,
      quantity: null, // Would be AI-extracted if mentioned
      delivery_preference: false, // Would be AI-inferred
      location: selectedLocation,
      market_id: selectedLocation.toLowerCase().replace(/[^a-z]/g, '_'),
      created_by: "you",
      created_at: new Date().toISOString(),
      source: "user"
    };
  };

  const handleSubmit = () => {
    // Here the content would be sent to backend for AI processing
    console.log("Submitting:", { postContent, selectedLocation, urgency });
    setIsModalOpen(false);
    setPostContent("");
    setUrgency("");
    setShowPreview(false);
  };

  const filteredPulse = feedFilter === "all" ? pulseData : 
    pulseData.filter(item => item.type === feedFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">MeetnMart</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pulse</p>
              </div>
            </div>
            
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-48">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="Auto-detected location" />
                  </div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 17 ? 'afternoon' : 'evening'}, 
              here's what's happening in {selectedMarket}
            </p>
          </div>
        </div>
      </header>

      {/* Pulse Overview Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>12 sellers online</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <Clock className="w-3 h-3" />
              <span>3 buyer needs posted in last hour</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <Truck className="w-3 h-3" />
              <span>2 delivery agents active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            <Badge 
              variant={feedFilter === "all" ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFeedFilter("all")}
            >
              All Activity
            </Badge>
            {categories.map(category => (
              <Badge 
                key={category}
                variant="secondary"
                className="cursor-pointer whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredPulse.map((item) => (
            <Card key={item.id} className={`${getCardStyle(item.type)} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(item.type)}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      {item.source === 'simulated' && (
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" title="AI Generated" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                      {item.content}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      {item.price_range && (
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Price:</span>
                          <span className="text-green-600 font-semibold">{item.price_range}</span>
                        </div>
                      )}
                      {item.quantity && (
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Qty:</span>
                          <span>{item.quantity}</span>
                        </div>
                      )}
                      {item.needed_by && (
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                          <Timer className="w-3 h-3" />
                          <span className="text-orange-600 font-medium">{item.needed_by}</span>
                        </div>
                      )}
                      {item.delivery_preference && (
                        <div className="flex items-center space-x-1 text-purple-600">
                          <Truck className="w-3 h-3" />
                          <span className="text-xs font-medium">Delivery OK</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                    {item.type === 'buyer_request' && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Truck className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Action Button */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>What's happening in your market?</span>
            </DialogTitle>
          </DialogHeader>
          
          {!showPreview ? (
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder={getPlaceholder()}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-24 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Be specific: what you need, quantity, budget, timeline
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Location (auto-detected)
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Urgency (optional)
                  </label>
                  <div className="flex space-x-2">
                    {urgencyLevels.map(level => (
                      <Button
                        key={level.value}
                        variant={urgency === level.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUrgency(urgency === level.value ? "" : level.value)}
                        className="flex-1"
                      >
                        {level.value === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {level.value === 'medium' && <Timer className="w-3 h-3 mr-1" />}
                        {level.value === 'low' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setShowPreview(true)}
                  disabled={!postContent.trim()}
                >
                  Preview
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <span>Live preview - how others will see your post</span>
                </div>
                
                {generatePreviewCard() && (() => {
                  const previewCard = generatePreviewCard();
                  return (
                    <Card className={`${getCardStyle("buyer_request")} hover:shadow-md transition-all duration-200 ring-2 ring-blue-200 dark:ring-blue-800/50`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon("buyer_request")}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {postContent.length > 30 ? 
                                  postContent.substring(0, 30).trim() + "..." : 
                                  postContent.length > 0 ? postContent.split('.')[0] || postContent.substring(0, 25) : 
                                  "Your Market Request"
                                }
                              </span>
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {postContent.toLowerCase().includes('fish') ? 'Fish' :
                                 postContent.toLowerCase().includes('phone') || postContent.toLowerCase().includes('electronic') ? 'Electronics' :
                                 postContent.toLowerCase().includes('tomato') ? 'Tomatoes' :
                                 postContent.toLowerCase().includes('deliver') ? 'Logistics' :
                                 postContent.toLowerCase().includes('fashion') || postContent.toLowerCase().includes('cloth') ? 'Fashion' :
                                 'General'}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                              {postContent}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              {(postContent.includes('₦') || postContent.includes('naira') || postContent.includes('budget')) && (
                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Budget:</span>
                                  <span className="text-green-600 font-semibold">
                                    {postContent.match(/₦[\d,]+/)?.[0] || "Negotiable"}
                                  </span>
                                </div>
                              )}
                              
                              {(postContent.match(/\d+\s?(kg|cup|basket|piece|liter)/i) || postContent.match(/\d+/)) && (
                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Qty:</span>
                                  <span>{postContent.match(/\d+\s?\w+/i)?.[0] || "As needed"}</span>
                                </div>
                              )}
                              
                              {urgency && (
                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                  <Timer className="w-3 h-3" />
                                  <span className="text-orange-600 font-medium">
                                    {urgency === "high" ? "ASAP" : urgency === "medium" ? "Today" : "No rush"}
                                  </span>
                                </div>
                              )}
                              
                              {(postContent.toLowerCase().includes('deliver') || postContent.toLowerCase().includes('urgent')) && (
                                <div className="flex items-center space-x-1 text-purple-600">
                                  <Truck className="w-3 h-3" />
                                  <span className="text-xs font-medium">Delivery OK</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{selectedLocation}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>now</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
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
                      </CardContent>
                    </Card>
                  );
                })()}
                
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 mt-0.5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">AI will enhance your post:</p>
                      <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                        <li>• Smart title generation</li>
                        <li>• Auto-detect category & pricing</li>
                        <li>• Extract quantity & timing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post to Market
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedPage;