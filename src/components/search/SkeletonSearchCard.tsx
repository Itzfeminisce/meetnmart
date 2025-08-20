import React from "react";

const SkeletonSearchCard: React.FC = () => (
    <div className="bg-muted/20 animate-pulse space-y-2 ">
        {/* Avatar Skeleton */}
        <div className="flex items-center gap-x-2 p-2">
            <div className="w-8 h-8 bg-foreground/20 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="h-2 bg-foreground/20 rounded w-4/5" />
                <div className="h-2 bg-foreground/20 rounded w-2/5" />
            </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-2">
            {/* Title Skeleton */}
            <div className="h-20 bg-foreground/40  w-full" />
            {/* Description Skeleton */}
            <div className="h-3 bg-foreground/20 rounded w-4/5" />
            <div className="h-3 bg-foreground/20 rounded w-2/5" />
        </div>
    </div>
);

export default SkeletonSearchCard;