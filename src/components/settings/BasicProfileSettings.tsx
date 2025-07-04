import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Camera, Save, UserCheck, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import SellerBasicProfileSettings from './SellerBasicProfileSettings';
import BuyerBasicProfileSettings from './BuyerBasicProfileSettings';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const BasicProfileSettings = () => {
  const { user, profile } = useAuth();
  

  return (
    <div className=" mb-[5rem]">
      {profile.role === "buyer" ? (
        <BuyerBasicProfileSettings />
      ): (
        <SellerBasicProfileSettings />
      )}
    </div>
  );
};

export default BasicProfileSettings;