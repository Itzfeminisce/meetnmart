import React, { useState } from 'react';
import { X, TrendingUp, Users, Eye, Calendar, Lightbulb, Target, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import CustomDialog from './ui/custom-dialog';

const MarketInsightsDialog = ({
  onOpenChange: setIsOpen,
  open: isOpen,
}: {
  onOpenChange: (boolean) => void;
  open: boolean;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const insights = [
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: "Active Shoppers Indicator",
      description: "This shows how many customers are currently browsing and buying in this market right now.",
      advantage: "Higher active shoppers = more potential customers for your products",
      tip: "Markets with 5+ active shoppers typically see 3x more sales during peak hours",
      example: "WUMITE STORE has 1 active shopper - consider promoting heavily to capture this audience"
    },
    {
      icon: <Eye className="w-6 h-6 text-blue-500" />,
      title: "Views Per User Metric",
      description: "This metric shows how engaged customers are - how many products each person views on average.",
      advantage: "Higher views per user means customers are actively shopping and comparing products",
      tip: "Markets with 4+ views/user have customers ready to purchase - perfect timing to join",
      example: "Dej Store shows 4 views/user - customers are actively comparing products and ready to buy"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "New Today Counter",
      description: "Shows how many new customers discovered this market today - indicating growth momentum.",
      advantage: "More new customers = expanding market with fresh buying power",
      tip: "Markets gaining 2+ new customers daily are experiencing growth spurts",
      example: "Both markets show 1 new customer today - steady growth indicates stable customer acquisition"
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      title: "Market Maturity Timeline",
      description: "Shows how established the market is - newer markets have less competition, mature ones have proven demand.",
      advantage: "13-day markets are in the sweet spot - established enough to have traffic, young enough to join easily",
      tip: "Markets 10-30 days old offer the best balance of opportunity and competition",
      example: "Both markets at 13 days are perfectly positioned for new sellers to establish themselves"
    }
  ];

  const actionStrategies = [
    {
      scenario: "High Active Shoppers + High Views",
      action: "JOIN IMMEDIATELY",
      reason: "Peak buying activity - maximum sales potential",
      color: "bg-green-500"
    },
    {
      scenario: "Low Active Shoppers + High Views",
      action: "PROMOTE HEAVILY",
      reason: "Engaged audience but low traffic - marketing can drive sales",
      color: "bg-market-orange"
    },
    {
      scenario: "High Active Shoppers + Low Views",
      action: "OPTIMIZE LISTINGS",
      reason: "Traffic exists but not engaging - improve product presentation",
      color: "bg-blue-500"
    },
    {
      scenario: "Consistent New Customers",
      action: "LONG-TERM INVESTMENT",
      reason: "Growing market - establish early for future dominance",
      color: "bg-purple-500"
    }
  ];

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  if (!isOpen) return null;

  return (
    <CustomDialog
      showSubmitButton={false}
      onOpenChange={setIsOpen}
      onCancel={() => setIsOpen(false)}
      open={isOpen}
      dialogTitle={
        <div>
          <h2 className="text-xl font-bold text-white">Market Intelligence Guide</h2>
          <p className="text-gray-400 text-sm">Learn to read market signals like a pro</p>
        </div>
      }
    >

      <>
        {/* Content */}
        <div className="py-6">
          {currentStep < insights.length ? (
            // Insight Steps
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {insights[currentStep].icon}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {insights[currentStep].title}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {insights[currentStep].description}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Your Advantage</h4>
                    <p className="text-gray-300 text-sm">{insights[currentStep].advantage}</p>
                  </div>
                </div>
              </div>

              <div className="bg-market-orange bg-opacity-10 border border-orange-500 border-opacity-20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-400 mb-1">Pro Tip</h4>
                    <p className="text-gray-300 text-sm mb-2">{insights[currentStep].tip}</p>
                    <div className="text-xs text-gray-400 italic">
                      Example: {insights[currentStep].example}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Action Strategies Step
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Action Strategies</h3>
                <p className="text-gray-400">Use these combinations to make smart decisions</p>
              </div>

              <div className="grid gap-4">
                {actionStrategies.map((strategy, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{strategy.scenario}</h4>
                      <span className={`${strategy.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {strategy.action}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{strategy.reason}</p>
                  </div>
                ))}
              </div>

              <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">Ready to Dominate</h4>
                    <p className="text-gray-300 text-sm">
                      You now know how to read market signals and time your entry perfectly.
                      Use these insights to maximize your sales potential!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-2 rounded-md flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: insights.length + 1 }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? 'bg-market-orange' : 'bg-gray-600'
                  }`}
              />
            ))}
          </div>

          {currentStep < insights.length ? (
              <button
              onClick={nextStep}
              className="text-market-orange flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) :  null}
        </div>
      </>
    </CustomDialog>
  );
};

export default MarketInsightsDialog;