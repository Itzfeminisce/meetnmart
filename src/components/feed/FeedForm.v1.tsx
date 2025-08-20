// components/FeedForm.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  InfoIcon
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
import { Card, CardContent } from '../ui/card';

interface FeedFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // onSubmit: (data: FeedFormData) => Promise<FeedItem>;
}

const axiosApi = useAxios()



export const FeedForm: React.FC<FeedFormProps> = ({
  isOpen,
  onOpenChange,
  // onSubmit
}) => {
  const [formData, setFormData] = useState<FeedFormData>({
    content: "",
    location: "Balogun Market, Lagos",
    urgency: "not_specified"
  });
  const quertClient = useQueryClient()
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FeedFormData, string>>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup function to revoke object URLs when component unmounts or images are removed
  useEffect(() => {
    return () => {
      uploadedImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [uploadedImages]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Revoke old URLs before creating new ones
      uploadedImages.forEach(url => URL.revokeObjectURL(url));

      const newFiles = Array.from(files);
      const newImages = newFiles.map(file => URL.createObjectURL(file));

      setImageFiles(newFiles);
      setUploadedImages(newImages);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index]); // Revoke the URL before removing
      newImages.splice(index, 1);
      return newImages;
    });
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const validateForm = () => {
    try {
      feedFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const zodError = JSON.parse(error.message);
      const newErrors: Partial<Record<keyof FeedFormData, string>> = {};
      zodError.forEach((err: any) => {
        newErrors[err.path[0] as keyof FeedFormData] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handlePreview = async () => {
    if (validateForm()) {
      try {
        setIsProcessing(true)
        const processedFormData = await axiosApi.Post<{ data: FeedItem }>("/whispa/feeds/completion", formData).then(res => res.data)
        setFormData({ ...processedFormData, urgency: formData.urgency })
        setShowPreview(true);
      } catch (error) {
        toast("Unable to process your prompt. Please adjust your text or try again")
      } finally {
        setIsProcessing(false)
      }
    }
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);

      // Upload images if any exist
      const imageUrls = imageFiles.length > 0 ? await uploadFiles(imageFiles, "feeds") : [];

      const response = await axiosApi.Post<{ data: FeedItem }>(
        "/whispa/feeds/create",
        { ...formData, images: imageUrls, isCompletionAttempted: showPreview }
      );

      await quertClient.invalidateQueries({
        queryKey: ["feeds"]
      })

      const processedFormData = response.data;

      setFormData({
        content: "",
        location: "Balogun Market, Lagos",
        urgency: "not_specified"
      });
      // Cleanup
      uploadedImages.forEach(url => URL.revokeObjectURL(url));
      setShowPreview(false);
      setUploadedImages([]);
      setImageFiles([]);
      onOpenChange(false);

    } catch (error: any) {
      console.error(error);

      const errorMessage = isAxiosError(error)
        ? error.response?.data?.error?.message
        : "Unable to process your prompt. Please adjust your text or try again";

      toast(errorMessage);

    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Cleanup object URLs
    uploadedImages.forEach(url => URL.revokeObjectURL(url));

    setFormData({ content: "", location: "Balogun Market, Lagos", urgency: "not_specified" });
    setShowPreview(false);
    setErrors({});
    setUploadedImages([]);
    setImageFiles([]);
    onOpenChange(false);
  };


  return (
    <>
      {/* {!showPreview ? ( */}
      <div className="space-y-4">


        {showPreview ? (
          <div className="rounded-lg">
            <FeedPreview
              formData={formData as FeedItemPreview}
              uploadedImages={uploadedImages}
            />
          </div>
        ) : (
          <>
            {/* Title and Description */}
            <div className="space-y-1">
              <h3 className="text-base md:text-lg font-semibold">Create Post</h3>
              <p className="text-xs md:text-sm text-muted-foreground  flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Share what you're offering or looking for!
              </p>
            </div>
            {/* Main Content Input */}
            <div className="space-y-3">
              <div className="relative">
                <span className="text-xs text-muted-foreground absolute -top-5 right-0 m-2">
                  {formData.content.length}/500
                </span>
                <Textarea
                  className="w-full mt-4 p-2 rounded-none bg-transparent border-none shadow-none outline-none ring-0 resize-none focus:outline-none focus:ring-0 focus:border-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  style={{ boxShadow: 'none', resize: 'none' }}
                  rows={10}
                  placeholder={placeholderExample}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  value={formData.content}
                  maxLength={500}
                />


                {errors.content && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                   {errors.content}
                  </p>
                )}
              </div>
            </div>
            {/* <div className="relative">
              <Textarea
                placeholder={placeholderExample}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-24 resize-none border-0 focus:ring-0 focus:outline-none bg-gray-500/20 dark:bg-gray-900/50"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {formData.content.length}/500
              </div>
              {errors.content && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.content}
                </p>
              )}
            </div> */}


            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={image}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location and Urgency Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="w-full sm:w-[40%] flex-shrink-0 hidden md:inline-flex">
                {/* <SearchableMarketSelect
                  value={formData.location}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, destinationMarket: value }))}
                  markets={locations}
                /> */}
              </div>

              <div className="flex gap-1 flex-shrink-0 w-full sm:w-auto justify-end">
                {urgencyLevels.map(level => (
                  <Tooltip key={level.value}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={formData.urgency === level.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          urgency: prev.urgency === level.value ? "not_specified" : level.value as "low" | "medium" | "high" | "not_specified"
                        }))}
                        className={`h-8 px-2 ${formData.urgency === level.value
                          ? level.value === 'high'
                            ? 'bg-red-500 hover:bg-red-600'
                            : level.value === 'medium'
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-green-500 hover:bg-green-600'
                          : ''
                          }`}
                      >
                        {level.value === 'high' && <AlertCircle className="w-4 h-4" />}
                        {level.value === 'medium' && <Timer className="w-4 h-4" />}
                        {level.value === 'low' && <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{level.label} Priority</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Images</p>
                  </TooltipContent>
                </Tooltip>
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
          </>

        )}

        {/* Preview Suggestion */}
        <div className="border-none">
          <p className="text-sm text-market-orange bg-market-orange/10 p-4">
            Be specific about what you're offering or looking for. Include details like quantity, price range, location, and quality preferences.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          {showPreview ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="flex-1 h-8"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="ml-1 text-xs">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Make changes to your post</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  onClick={handlePreview}
                  disabled={!formData.content.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="ml-1 text-xs">Preview</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>See how your post will look</p>
              </TooltipContent>
            </Tooltip>

          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="flex-1 h-8 bg-orange-500 hover:bg-orange-600"
                onClick={handleSubmit}
                disabled={!formData.content.trim() || isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="ml-1 text-xs">Post</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share your post</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  );
};