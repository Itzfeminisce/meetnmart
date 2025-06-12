// components/FloatingActionButton.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  children: React.ReactNode;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      {children}
    </Dialog>
  );
};