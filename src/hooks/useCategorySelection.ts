import { useCallback, useMemo, useState } from "react";
import { useGetCategories } from "./api-hooks";
import { Category } from "@/types";

export const useCategorySelection = () => {
    const {data: _categories = []} = useGetCategories()
  
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
  
    const handleCategoryToggle = useCallback((category: Category) => {
      setSelectedCategories([category]);
    }, [_categories]);
  
    const filteredCategories = useMemo(() => {
      if (searchQuery.length === 0) return _categories;
      return _categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [searchQuery, _categories]);
  
    const popularCategories = useMemo(() =>
      filteredCategories.filter(cat => cat.popular),
      [filteredCategories]
    );
  
    const otherCategories = useMemo(() =>
      filteredCategories.filter(cat => !cat.popular),
      [filteredCategories]
    );
  
    return {
      selectedCategories,
      searchQuery,
      setSearchQuery,
      handleCategoryToggle,
      filteredCategories,
      popularCategories,
      otherCategories,
    };
  };
  