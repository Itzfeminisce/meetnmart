import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ChatNotFound: React.FC = () => {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/messages', {
            replace: true,
        }); // Navigate to the messages page
    }
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowLeft className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Chat not found</h3>
                <p className="text-muted-foreground">This conversation doesn't exist or has been deleted</p>

                <Button
                    variant='outline'
                    className="mt-4 px-4 py-2   rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={handleBack}
                >
                    Back to Messages
                </Button>
            </div>
        </div>
    )
};

ChatNotFound.displayName = 'ChatNotFound';

export default React.memo(ChatNotFound)