import { useAxios } from './axiosUtils';
import { toast } from 'sonner';

interface ImageUploadResponse {
  data: {
    urls: string[];
  };
}

export const uploadFiles = async (files: File[], resourceGroup: string): Promise<string[]> => {
  if (files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const axiosApi = useAxios();
    const response = await axiosApi.Post<ImageUploadResponse>(
      '/uploads/file',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Resource-Group-Name': resourceGroup
        },
      }
    ).then(it => it.data);
    return response.urls
  } catch (error) {
    console.error('Error uploading images:', error);
    toast('Failed to upload images. Please try again.');
    throw error;
  }
};
