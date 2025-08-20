import React, { useMemo } from 'react';


interface ImageGridViewProps {
  images: string[],
  itemId: string;
  direction?: "grid" | "horizontal"
}
export const ImageGridView = ({ images = [], itemId, direction = 'grid' }: ImageGridViewProps) => {
  const ImagesSection = useMemo(() => {
    if (!images?.length) return null;

    // Horizontal mode
    if (direction === 'horizontal') {
      const displayImages = images.slice(0, 3);
      const remainingCount = images.length - 3;
      return (
        <div className="flex w-full max-w-full gap-1">
          {displayImages.map((photo, index) => (
            <div
              key={`${itemId}-img-hz-${index}`}
              className="relative overflow-hidden rounded-md flex-1 aspect-auto max-w-[100px]"
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {images.length > 3 && (
            <div className="relative overflow-hidden rounded-md flex-1 aspect-auto max-w-[100px]">
              <img
                src={images[3]}
                alt={`Photo 4`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                <span className="text-white text-xs md:text-sm font-semibold">
                  +{remainingCount}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle single image
    if (images.length === 1) {
      return (
        <div className="relative w-full max-w-full">
          <div className="relative w-full aspect-auto rounded-md overflow-hidden">
            <img
              src={images[0]}
              alt="Photo 1"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      );
    }

    // Handle two images
    if (images.length === 2) {
      return (
        <div className="relative w-full max-w-full">
          <div className="grid grid-cols-2 gap-1 aspect-auto">
            {images.slice(0, 2).map((photo, index) => (
              <div
                key={`${itemId}-img-${index}`}
                className="relative overflow-hidden rounded-md"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle three images
    if (images.length === 3) {
      return (
        <div className="relative w-full max-w-full">
          <div className="grid grid-cols-2 gap-1 aspect-auto">
            <div className="relative overflow-hidden rounded-md">
              <img
                src={images[0]}
                alt="Photo 1"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="grid grid-rows-2 gap-1">
              {images.slice(1, 3).map((photo, index) => (
                <div
                  key={`${itemId}-img-${index + 1}`}
                  className="relative overflow-hidden rounded-md"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Handle four or more images
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
      <div className="relative w-full max-w-full">
        <div className="grid grid-cols-2 gap-1 aspect-auto">
          {/* First large image */}
          <div className="relative overflow-hidden rounded-md">
            <img
              src={displayImages[0]}
              alt="Photo 1"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Right side with smaller images */}
          <div className="grid grid-rows-3 gap-1">
            {displayImages.slice(1, 4).map((photo, index) => (
              <div
                key={`${itemId}-img-${index + 1}`}
                className="relative overflow-hidden rounded-md"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Show overlay with remaining count on last image */}
                {index === 2 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                    <span className="text-white text-xs md:text-sm font-semibold">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [images, itemId, direction]);

  return ImagesSection;
};
