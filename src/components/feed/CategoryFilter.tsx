import React from 'react';
import { Category } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useFeedStore } from '@/contexts/Store';
import { useGetCategories } from '@/hooks/api-hooks';

interface CategoryFilterProps {
}
export const CategoryFilter = () => {
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories()
  const feedStore = useFeedStore()

  return (
    <div className="pb-4">
      {
        isLoadingCategories ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto scrollbar-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => feedStore.filterBy({ categoryId: "all" })}
                  className={`flex px-4 items-center justify-center space-x-1 rounded-xl transition-all
                    ${feedStore.activeCategoryId === "all"
                      ? "bg-primary text-primary-foreground"
                      : `hover:opacity-80`
                    }`}
                >
                  <span className="text-xs truncate font-medium">{"All"}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>All Categories</p>
              </TooltipContent>
            </Tooltip>

            {categories.map(category => {
              const [bgColor, textColor] = category.color.split(' ');

              return (
                <Tooltip key={category.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => feedStore.filterBy({ categoryId: category.id })}
                      className={`flex items-center justify-center px-2 space-x-1 rounded-xl transition-all
                        ${feedStore.activeCategoryId === category.id
                          ? "bg-primary text-primary-foreground"
                          : `${bgColor} ${textColor} hover:opacity-80`
                        }`}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-xs truncate font-medium">{category.name}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='capitalize'>{category.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )
      }
    </div>
  );
};