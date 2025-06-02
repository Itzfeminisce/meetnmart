import { useCallback, useState } from "react";
import { useUpdateProfileLocation } from "./api-hooks";
import { toast } from "sonner";

export const useLocation = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [locationUpdateCount, setLocationUpdateCount] = useState(0);
    const updateProfile = useUpdateProfileLocation()
  
    const detectLocation = useCallback(() => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser')
        return
      }
  
      setIsDetecting(true);
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationUpdateCount(prev => prev + 1);
          setIsDetecting(false);
          updateProfile.mutate({
            update: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
          })
        },
        (error) => {
          setIsDetecting(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error("Location access denied. Please enable location services.");
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              toast.error("Location request timed out.");
              break;
            default:
              toast.error("An unknown error occurred while detecting location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        }
      );
    }, []);
  
    return {
      location,
      isDetecting,
      detectLocation,
      locationUpdateCount,
    };
  };
  