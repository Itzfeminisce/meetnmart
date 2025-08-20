import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAxios } from '@/lib/axiosUtils';

// Validation schema for the form
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const JoinNewsletter = () => {
  const axiosUtil = useAxios();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize the form with validation
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: NewsletterFormValues) => {
    setIsSubmitting(true);
    try {
      // Call the edge function to handle newsletter registration
      const response = await axiosUtil.Post<{data: any}>("/newsletter", {
        email: values.email,
      });
      toast({
        title: "Subscribed!",
        description: response.data || "Thanks for joining the MeetnMart newsletter. You'll receive updates soon!",
      });
      form.reset();
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Something went wrong",
        description: error.response?.data || "We couldn't add you to the newsletter. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="py-20 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-market-deep-purple to-market-deep-purple/50 opacity-80"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-market-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-market-orange/20 rounded-full blur-3xl"></div>
      </div>
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get the latest updates, news, and exclusive offers from MeetnMart directly to your inbox.
          </p>
          <div className="glass py-8 rounded-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="flex-grow bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-market-orange hover:bg-market-orange/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Join Newsletter"}
                </Button>
                <p className="text-sm text-gray-400">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </Form>
            {/* <div className="mt-8 pt-8 border-t border-white/10">
              <p className="font-medium mb-4">Coming Soon:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="px-3 py-1 bg-market-purple/20 border border-market-purple/30 rounded-full text-sm">
                  AI Moderation
                </span>
                <span className="px-3 py-1 bg-market-purple/20 border border-market-purple/30 rounded-full text-sm">
                  Seller Verification
                </span>
                <span className="px-3 py-1 bg-market-purple/20 border border-market-purple/30 rounded-full text-sm">
                  Instant Translation
                </span>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default JoinNewsletter;
