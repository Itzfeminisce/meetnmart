// components/FeedForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  Send,
  AlertCircle,
  Timer,
  CheckCircle2,
  Lightbulb,
  MapPin,
  Clock,
  X,
  Eye,
  Info,
  Image as ImageIcon,
  InfoIcon,
  Plus,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { locations, placeholderExample, urgencyLevels } from '@/data/pulse-mocks';
import { FeedPreview } from './FeedPreview';
import { FeedFormData, feedFormSchema } from './schema';
import { SearchableMarketSelect } from './SearchableMarketSelect';
import { FeedItem, FeedItemPreview } from '@/types';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useAxios } from '@/lib/axiosUtils';
import { uploadFiles } from '@/lib/fileUpload'
import { useQueryClient } from '@tanstack/react-query';
import { useBottomSheet, useSheetData } from '@/components/ui/bottom-sheet-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface FeedFormProps {
  triggerButton?: React.ReactNode;
}

const axiosApi = useAxios();
 
export const FeedForm: React.FC<FeedFormProps> = ({ triggerButton }) => {
  const { open } = useBottomSheet();

  const handleOpenFeedForm = () => {
    open({
      viewId: 'create-feed-post',
      header: <FeedFormHeader />,
      body: <FeedFormBody />,
      footer: <FeedFormFooter />,
      data: {
        formData: {
          content: "",
          location: "Balogun Market, Lagos",
          urgency: "not_specified"
        },
        showPreview: false,
        isProcessing: false,
        errors: {},
        uploadedImages: [],
        imageFiles: []
      },
      closable: true,
      persistent: false
    });
  };

  return (
    <div onClick={handleOpenFeedForm}>{triggerButton}</div>
    // triggerButton ? (
    //   <div onClick={handleOpenFeedForm}>{triggerButton}</div>
    // ) : (
    //   <Button
    //     onClick={handleOpenFeedForm}
    //     className="bg-orange-500 hover:bg-orange-600 text-white"
    //     size="sm"
    //   >
    //     <Plus className="w-4 h-4 mr-2" />
    //     Create Post
    //   </Button>
    // )
  );
};

// Header Component
export function FeedFormHeader() {
  const { data, updateData } = useSheetData();
  const { profile } = useAuth()
  const sheetData = data as {
    formData: FeedFormData;
    showPreview: boolean;
    isProcessing: boolean;
    errors: Partial<Record<keyof FeedFormData, string>>;
    uploadedImages: string[];
    imageFiles: File[];
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {sheetData?.showPreview ? 'Preview Post' : 'Create Post'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sheetData?.showPreview
              ? 'Review your post before sharing'
              : (profile.role === "seller" ? "Share what you\'re offering!" : "Share what you\'re looking for!")
              // 'Share what you\'re offering or looking for'
            }
          </p>
        </div>
      </div>

      {sheetData?.showPreview && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Eye className="w-3 h-3 mr-1" />
          Preview
        </Badge>
      )}
    </div>
  );
}

// Body Component
export function FeedFormBody() {
  const { data, updateData } = useSheetData();
  const sheetData = data as {
    formData: FeedFormData;
    showPreview: boolean;
    isProcessing: boolean;
    errors: Partial<Record<keyof FeedFormData, string>>;
    uploadedImages: string[];
    imageFiles: File[];
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFormData = (updates: Partial<FeedFormData>) => {
    updateData?.({
      ...data,
      formData: { ...sheetData.formData, ...updates }
    });
  };

  const updateSheetData = (updates: any) => {
    updateData?.({ ...data, ...updates });
  };

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      sheetData?.uploadedImages?.forEach(url => URL.revokeObjectURL(url));
    };
  }, [sheetData?.uploadedImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Revoke old URLs before creating new ones
      sheetData.uploadedImages.forEach(url => URL.revokeObjectURL(url));

      const newFiles = Array.from(files);
      const newImages = newFiles.map(file => URL.createObjectURL(file));

      updateSheetData({
        imageFiles: newFiles,
        uploadedImages: newImages
      });

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...sheetData.uploadedImages];
    const newFiles = [...sheetData.imageFiles];

    URL.revokeObjectURL(newImages[index]);
    newImages.splice(index, 1);
    newFiles.splice(index, 1);

    updateSheetData({
      uploadedImages: newImages,
      imageFiles: newFiles
    });
  };

  if (sheetData?.showPreview) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card">
          <FeedPreview
            formData={sheetData.formData as FeedItemPreview}
            uploadedImages={sheetData.uploadedImages}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Content Input */}
      <div className="space-y-3">
        <div className="relative">
          <span className="text-xs text-muted-foreground absolute -top-5 right-0 m-2">
            {sheetData?.formData.content.length || 0}/500
          </span>
          <Textarea
            className="w-full mt-4 p-2 rounded-none bg-transparent border-none shadow-none outline-none ring-0 resize-none focus:outline-none focus:ring-0 focus:border-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
            style={{ boxShadow: 'none', resize: 'none' }}
            rows={10}
            placeholder={placeholderExample}
            onChange={(e) => updateFormData({ content: e.target.value })}
            value={sheetData?.formData.content || ""}
            maxLength={500}
          />


          {sheetData?.errors?.content && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {sheetData.errors.content}
            </p>
          )}
        </div>
      </div>

      {/* Image Previews */}
      {sheetData?.uploadedImages?.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Attached Images</label>
          <div className="grid grid-cols-3 gap-3">
            {sheetData.uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority and Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <label className="text-sm font-medium">Priority Level</label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Add Images
          </Button>
        </div>

        <div className="flex gap-2">
          {urgencyLevels.map(level => (
            <Tooltip key={level.value}>
              <TooltipTrigger asChild>
                <Button
                  variant={sheetData?.formData.urgency === level.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFormData({
                    urgency: sheetData?.formData.urgency === level.value
                      ? "not_specified"
                      : level.value as "low" | "medium" | "high" | "not_specified"
                  })}
                  className={`flex-1 ${sheetData?.formData.urgency === level.value
                      ? level.value === 'high'
                        ? 'bg-red-500 hover:bg-red-600'
                        : level.value === 'medium'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      : ''
                    }`}
                >
                  {level.value === 'high' && <AlertCircle className="w-4 h-4 mr-1" />}
                  {level.value === 'medium' && <Timer className="w-4 h-4 mr-1" />}
                  {level.value === 'low' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                  {level.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{level.label} Priority</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Preview Suggestion */}
      <Card className="border-none">
        <CardContent className="p-3">
          <p className="text-sm text-market-orange bg-market-orange/10 p-4">
            Be specific about what you're offering or looking for. Include details like quantity, price range, location, and quality preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Footer Component
export function FeedFormFooter() {
  const { data, updateData } = useSheetData();
  const { closeById } = useBottomSheet();
  const queryClient = useQueryClient();

  const sheetData = data as {
    formData: FeedFormData;
    showPreview: boolean;
    isProcessing: boolean;
    errors: Partial<Record<keyof FeedFormData, string>>;
    uploadedImages: string[];
    imageFiles: File[];
  };

  const validateForm = () => {
    try {
      feedFormSchema.parse(sheetData.formData);
      updateData?.({ ...data, errors: {} });
      return true;
    } catch (error: any) {
      const zodError = JSON.parse(error.message);
      const newErrors: Partial<Record<keyof FeedFormData, string>> = {};
      zodError.forEach((err: any) => {
        newErrors[err.path[0] as keyof FeedFormData] = err.message;
      });
      updateData?.({ ...data, errors: newErrors });
      return false;
    }
  };

  const handlePreview = async () => {
    if (!validateForm()) return;

    try {
      updateData?.({ ...data, isProcessing: true });

      const processedFormData = await axiosApi.Post<{ data: FeedItem }>(
        "/whispa/feeds/completion",
        sheetData.formData
      ).then(res => res.data);

      updateData?.({
        ...data,
        formData: { ...processedFormData, urgency: sheetData.formData.urgency },
        showPreview: true,
        isProcessing: false
      });
    } catch (error) {
      toast("Unable to process your prompt. Please adjust your text or try again");
      updateData?.({ ...data, isProcessing: false });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      updateData?.({ ...data, isProcessing: true });

      // Upload images if any exist
      const imageUrls = sheetData.imageFiles.length > 0
        ? await uploadFiles(sheetData.imageFiles, "feeds")
        : [];

      const response = await axiosApi.Post<{ data: FeedItem }>(
        "/whispa/feeds/create",
        {
          ...sheetData.formData,
          images: imageUrls,
          isCompletionAttempted: sheetData.showPreview
        }
      );

      await queryClient.invalidateQueries({
        queryKey: ["feeds"]
      });

      // Cleanup
      sheetData.uploadedImages.forEach(url => URL.revokeObjectURL(url));

      toast.success("Post created successfully!");
      closeById?.('create-feed-post');

    } catch (error: any) {
      console.error(error);

      const errorMessage = isAxiosError(error)
        ? error.response?.data?.error?.message
        : "Unable to process your prompt. Please adjust your text or try again";

      toast.error(errorMessage);
    } finally {
      updateData?.({ ...data, isProcessing: false });
    }
  };

  const handleEdit = () => {
    updateData?.({ ...data, showPreview: false });
  };

  const isContentEmpty = !sheetData?.formData.content.trim();

  return (
    <div className="p-2 border-t bg-background space-y-3">
      {/* Action Buttons */}
      <div className="flex gap-3">
        {sheetData?.showPreview ? (
          <>
            <Button
              size='sm'
              variant="outline"
              onClick={handleEdit}
              disabled={sheetData.isProcessing}
              className="flex-1"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Post
            </Button>
            <Button
              size='sm'
              onClick={handleSubmit}
              disabled={sheetData.isProcessing}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {sheetData.isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publish Post
            </Button>
          </>
        ) : (
          <>
            <Button
            size='sm'
              variant="outline"
              onClick={handlePreview}
              disabled={isContentEmpty || sheetData?.isProcessing}
              className="flex-1"
            >
              {sheetData?.isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Preview
            </Button>
            <Button
            size='sm'
              onClick={handleSubmit}
              disabled={isContentEmpty || sheetData?.isProcessing}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {sheetData?.isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Now
            </Button>
          </>
        )}
      </div>

      {/* Status Indicator */}
      {sheetData?.isProcessing && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {sheetData.showPreview ? 'Publishing your post...' : 'Processing your content...'}
          </p>
        </div>
      )}
    </div>
  );
}