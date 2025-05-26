import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ActivityIcon, Star, Bell, Globe, Video, MessageSquareQuote, Clock, Calendar, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from '@/integrations/supabase/types';
import { useGetUserFeedbacks } from '@/hooks/api-hooks';
import { formatDuration, formatTimeAgo } from '@/lib/utils';
import Loader from '@/components/ui/loader';
import ErrorComponent from '@/components/ErrorComponent';
import { useIsMobile } from '@/hooks/use-mobile';

type Feedback = Database['public']['Functions']['get_feedbacks']

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  type: 'in-app' | 'sitewide';
};

const Activity = () => {
  const navigate = useNavigate();
  const { data: feedbacks, isLoading, error } = useGetUserFeedbacks();
  const isMobile = useIsMobile();

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

  if (error) return <ErrorComponent error={error} onRetry={() => navigate(0)} />;

  return (
    <div className="py-6 animate-fade-in">
     <div className="container mx-auto ">
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

     {isMobile ? (
        <MobileView 
          feedbacks={feedbacks} 
          isLoading={isLoading} 
          notifications={notifications} 
        />
      ) : (
        <DesktopView 
          feedbacks={feedbacks} 
          isLoading={isLoading} 
          notifications={notifications} 
        />
      )}
     </div>
    </div>
  );
};

const MobileView = ({ feedbacks, isLoading, notifications }) => {
  return (
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
      <TabsContent value="feedback" className="mt-4 h-[calc(100vh-220px)] overflow-y-auto scrollbar-small">
        {isLoading ? (
          <Loader />
        ) : feedbacks?.length > 0 ? (
          <div className="space-y-4 pr-2">
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
      <TabsContent value="in-app" className="mt-4 h-[calc(100vh-220px)] overflow-y-auto scrollbar-small">
        {notifications.filter(n => n.type === 'in-app').length > 0 ? (
          <div className="space-y-4 pr-2">
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
      <TabsContent value="sitewide" className="mt-4 h-[calc(100vh-220px)] overflow-y-auto scrollbar-small">
        {notifications.filter(n => n.type === 'sitewide').length > 0 ? (
          <div className="space-y-4 pr-2">
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
  );
};

const DesktopView = ({ feedbacks, isLoading, notifications }) => {
  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      {/* Feedback Column */}
      <div className="col-span-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4 p-2 bg-secondary rounded-lg">
          <Star size={18} />
          <h2 className="font-semibold">Feedback</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-small">
          {isLoading ? (
            <Loader />
          ) : feedbacks?.length > 0 ? (
            <div className="space-y-4 pr-2">
              {feedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ActivityIcon size={48} className="text-market-orange" />}
              title="No Feedback Yet"
              description="You haven't received any feedback from buyers yet."
            />
          )}
        </div>
      </div>

      {/* In-App Notifications Column */}
      <div className="col-span-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4 p-2 bg-secondary rounded-lg">
          <Bell size={18} />
          <h2 className="font-semibold">In-App</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-small">
          {notifications.filter(n => n.type === 'in-app').length > 0 ? (
            <div className="space-y-4 pr-2">
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
              description="Your in-app notifications will appear here."
            />
          )}
        </div>
      </div>

      {/* Sitewide Notifications Column */}
      <div className="col-span-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4 p-2 bg-secondary rounded-lg">
          <Globe size={18} />
          <h2 className="font-semibold">Sitewide</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-small">
          {notifications.filter(n => n.type === 'sitewide').length > 0 ? (
            <div className="space-y-4 pr-2">
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
              description="Sitewide announcements will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Feedback Card Component
const FeedbackCard = ({ feedback }: { feedback: Feedback['Returns'][number] }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-background">
      <div className="flex gap-3">
        {feedback.seller_avatar && (
          <div className="relative flex-shrink-0">
            <img
              src={feedback.seller_avatar}
              alt={feedback.seller_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-medium text-foreground">{feedback.seller_name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="relative">
                <Star
                  size={20}
                  className={`${star <= feedback.rating ? 'text-primary fill-primary' : 'text-muted'}`}
                />
                {star === Math.ceil(feedback.rating) && feedback.rating % 1 > 0 && (
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: `${(feedback.rating % 1) * 100}%` }}
                  >
                    <Star size={20} className="text-primary fill-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mt-2">
            {feedback.feedback_text ? (
              <>
                <MessageSquareQuote size={16} className="float-left mr-1 text-muted-foreground" />
                <p className="text-sm text-foreground">{feedback.feedback_text}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No Description</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {feedback.call_duration && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>{formatDuration(feedback.call_duration)}</span>
              </div>
            )}

            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formatTimeAgo(feedback.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
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