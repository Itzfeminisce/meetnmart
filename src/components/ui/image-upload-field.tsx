import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ImageEditor } from '@/components/ui/image-editor';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useAxios } from '@/lib/axiosUtils';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
  showPreview?: boolean;
  filePreferedName: string;
}


export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  filePreferedName,
  onChange,
  placeholder = 'Enter image URL',
  className,
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  maxSizeMB = 5,
  aspectRatio,
  showPreview = true,
}) => {
  const axiosUtil = useAxios()
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset file input when component unmounts or when editor closes
  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  }, []);

  const validateFile = (file: File): boolean => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: `Image must be less than ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    // Create a temporary URL for the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTempImageUrl(event.target.result as string);
        setIsEditorOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    
    // Reset the file input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleUpload = async (editedImageBlob: Blob) => {
    setIsLoading(true);
    setIsEditorOpen(false)
    setUploadProgress(0);
    try {
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Create a FormData object
      const formData = new FormData();
      formData.append('file', editedImageBlob, 'image.jpg');
      formData.append("filePreferedName", filePreferedName)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await axiosUtil.Post("/uploads/file", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            // 'Authorization': `Bearer ${yourAuthToken}`, // Replace with actual token if needed
        },
      })

      const fileUrl = response.data;
      
      
      // Upload the image to your server or cloud storage
      // This is a placeholder for your actual upload logic
      
      // Simulate a url. This would typically be returned from server
      // const url = URL.createObjectURL(editedImageBlob);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update the input field with the returned URL
      onChange(fileUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been successfully uploaded',
      });
    } catch (error) {
      console.error("File uplaod failed ", error);
      
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your image',
        variant: 'destructive',
      });
    } finally {
      // Reset states after a short delay to show completion
      setTimeout(() => {
        setIsLoading(false);
        setUploadProgress(0);
        setIsEditorOpen(false);
        setTempImageUrl(null);
        
        // Reset file input to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    }
  };

  const handleCancel = () => {
    setIsEditorOpen(false);
    setTempImageUrl(null);
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    onChange('');
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadButtonClick = () => {
    // Reset the file input value before opening the file dialog
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div 
        ref={dropZoneRef}
        className={cn(
          "flex items-center gap-2",
          isDragging && "ring-2 ring-primary ring-offset-2 rounded-md"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'pr-10',
              error && 'border-red-500 focus-visible:ring-red-500'
            )}
            disabled={disabled || isLoading}
          />
          
          {value && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClearImage}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUploadButtonClick}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isLoading}
        />
      </div>
      
      {isLoading && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-muted-foreground">Uploading image... {Math.round(uploadProgress)}%</p>
        </div>
      )}
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      
      {showPreview && value && !isLoading && (
        <div className="mt-2 border rounded-md p-2 bg-muted/20">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-md">
            <img 
              src={value} 
              alt="Preview" 
              className="object-contain w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOWNhM2FmIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        </div>
      )}
      
      {isEditorOpen && tempImageUrl && (
        <ImageEditor
          imageUrl={tempImageUrl}
          onSave={handleUpload}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}; 