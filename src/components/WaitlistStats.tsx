
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export type StatsData = {
  total: number;
  last24Hours: number;
  isLoading: boolean;
}

const WaitlistStats: React.FC<StatsData> = ({total, isLoading,last24Hours}) => {

  if (!total) return

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Waitlist Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-market-purple animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold">{total || 0}</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Last 24 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-market-orange animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold">{last24Hours || 0}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistStats;
