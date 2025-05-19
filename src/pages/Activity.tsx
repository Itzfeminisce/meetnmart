import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ActivityIcon, Star, Bell, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from '@/integrations/supabase/types';
import { useFetch } from '@/hooks/api-hooks';
import { supabase } from '@/integrations/supabase/client';
import { formatTimeAgo } from '@/lib/utils';
import Loader from '@/components/ui/loader';

type Feedback = Database['public']['Functions']['get_feedbacks']

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  type: 'in-app' | 'sitewide';
};

async function fetchFeedbacks(options?: Feedback['Args']): Promise<Feedback['Returns']> {
  const { data, error } = await supabase.rpc("get_feedbacks")

  if (error) throw error

  return data
}

const Activity = () => {
  const navigate = useNavigate();
  const { data: feedbacks, isLoading, error} = useFetch(['feedbacks'], fetchFeedbacks)


  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Order',
      message: 'Alex Johnson purchased your Vintage Leather Jacket',
      isRead: false,
      timestamp: '2 hours ago',
      type: 'in-app',
    },
    {
      id: '2',
      title: 'System Update',
      message: 'New seller features available in your dashboard',
      isRead: true,
      timestamp: '1 day ago',
      type: 'sitewide',
    },
  ];

  return (
    <div className="app-container px-4 pt-6 animate-fade-in mb-6">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 -ml-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">Activity</h1>
        </div>
        <p className="text-muted-foreground">Track your seller activity and notifications</p>
      </header>

      <Tabs defaultValue="feedback" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Star size={16} />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="in-app" className="flex items-center gap-2">
              <Bell size={16} />
              In-App
            </TabsTrigger>
            <TabsTrigger value="sitewide" className="flex items-center gap-2">
              <Globe size={16} />
              Sitewide
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-4">
          {isLoading ? (
            <Loader />
          ) : feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ActivityIcon size={48} className="text-market-orange" />}
              title="No Feedback Yet"
              description="You haven't received any feedback from buyers yet. It will appear here once buyers leave reviews."
            />
          )}
        </TabsContent>

        {/* In-App Notifications Tab */}
        <TabsContent value="in-app" className="mt-4">
          {notifications.filter(n => n.type === 'in-app').length > 0 ? (
            <div className="space-y-4">
              {notifications
                .filter(n => n.type === 'in-app')
                .map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<Bell size={48} className="text-market-orange" />}
              title="No In-App Notifications"
              description="Your in-app notifications will appear here when you receive new orders or messages."
            />
          )}
        </TabsContent>

        {/* Sitewide Notifications Tab */}
        <TabsContent value="sitewide" className="mt-4">
          {notifications.filter(n => n.type === 'sitewide').length > 0 ? (
            <div className="space-y-4">
              {notifications
                .filter(n => n.type === 'sitewide')
                .map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<Globe size={48} className="text-market-orange" />}
              title="No Sitewide Notifications"
              description="Sitewide announcements and updates will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Feedback Card Component
const FeedbackCard = ({ feedback }: { feedback: Feedback['Returns'][number] }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{feedback.buyer_name}</h3>
          {/* <p className="text-sm text-muted-foreground">{"feedback.productName"}</p> */}
        </div>
        <div className="flex items-center bg-market-orange/10 px-2 py-1 rounded">
          <Star size={16} className="text-market-orange fill-market-orange mr-1" />
          <span className="font-medium">{feedback.rating}</span>
        </div>
      </div>
      <p className="mt-2 text-sm">{feedback.feedback_text}</p>
      <p className="mt-2 text-xs text-muted-foreground">{formatTimeAgo(feedback.created_at)}</p>
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification }: { notification: Notification }) => {
  return (
    <div className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${!notification.isRead ? 'bg-blue-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${!notification.isRead ? 'text-blue-800' : ''}`}>
            {notification.title}
          </h3>
          <p className={`text-sm ${!notification.isRead ? 'text-blue-700' : 'text-muted-foreground'}`}>
            {notification.message}
          </p>
        </div>
        {!notification.isRead && (
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{notification.timestamp}</p>
    </div>
  );
};

// Empty State Component
const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-market-orange/10 p-4">
            {icon}
          </div>
        </div>
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Activity;