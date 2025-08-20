import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cacheKeys, useCreateInterests, useGetCategories } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfileStore } from '@/contexts/Store';


const InterestSelection = () => {
    const { updateOnboardingStep } = useAuth()
    const { data: interests, error: _error, isLoading } = useGetCategories()
    const interestMutation = useCreateInterests()
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [error, setError] = useState(_error?.message || '');
    const navigate = useNavigate()

    const toggleInterest = (interestId) => {
        const newSelection = selectedInterests.includes(interestId)
            ? selectedInterests.filter(id => id !== interestId)
            : [...selectedInterests, interestId];

        setSelectedInterests(newSelection);

        if (newSelection.length === 0) {
            setError('Please select at least one interest');
        } else {
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (selectedInterests.length === 0) {
            setError('Please select at least one interest');
            return;
        }
        await interestMutation.mutateAsync({ interests: selectedInterests })
      
        await updateOnboardingStep(2)
        navigate("/feeds", { replace: true })
    };

  
    return (
        <div className="mx-auto md:container md:max-w-screen-md">
            <div className="p-4 mt-4 space-y-3">
                <h2 className="text-lg md:text-2xl font-bold mb-2 text-center">
                    Personalize Your Marketplace
                </h2>
                {/* <p className="text-muted-foreground text-center max-w-xl mx-auto"> */}
                {/* Select the categories you're most interested in. </p> */}

                <p className='text-xs text-muted-foreground bg-yellow-50/20 text-yellow-500 p-4 rounded-md'>We'll use this to tailor your feed and show you the most relevant deals, sellers, and offers in your area.</p>
            </div>


            {/* Flowing Badge Layout */}
            <div className="flex flex-wrap gap-3 justify-center mb-6 p-4">
                {isLoading ? <Loader /> : (
                    interests.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge
                                        key={interest.id}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 px-4 py-2.5 text-sm font-medium rounded-full",
                                            [
                                                isSelected ? [`border-2  shadow-market-orange transform scale-105`, interest.color] :
                                                    `hover:border-current hover:shadow-sm`
                                            ],
                                        )
                                        }
                                        onClick={() => toggleInterest(interest.id)}
                                    >
                                        <span className="mr-2">{interest.icon}</span>
                                        {interest.name}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {interest.description}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })
                )}

            </div>





            {/* Submit Button */}
            <div className="text-center w-full sticky md:relative bottom-0 backdrop-blur-3xl p-2 rounded-tl-3xl rounded-tr-3xl">
                {/* Selected Count */}
                <div className="text-center mb-2">
                    <p className="text-muted-foreground">
                        {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
                    </p>
                </div>
                {/* Error Message */}
                {error && (
                    <div className="text-red-600 text-sm text-center mb-4">
                        {error}
                    </div>
                )}

                <Button
                    variant='market'
                    onClick={handleSubmit}
                    disabled={selectedInterests.length === 0 || interestMutation.isPending}
                    className={cn('w-full', selectedInterests.length > 0 ? `` : '')}
                >
                    {interestMutation.isPending ? "Saving..." : "Continue"}
                </Button>
            </div>
        </div>
    );
};

export default InterestSelection;