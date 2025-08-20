// components/NotificationListener.tsx
import { supabase } from '@/integrations/supabase/client'
import { useEffect } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import { useNotificationStore } from '@/contexts/store/notification'
import { useNotifications } from '@/hooks/useNotification'
import { toast } from 'sonner'
import NotificationPermissionCard from './NotificationPermissionCard'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/contexts/AuthContext'

export default function NotificationListener() {
    const { isAuthenticated } = useAuth()
    const socket = useSocket()
    const notificationStore = useNotificationStore()
    const isMobile = useIsMobile()

    const { isInitialized, permissionStatus, requestPermission, showNotification, initializeNotifications } = useNotifications()



    function listener(newNotification) {
        console.log("[notification:insert:event_listener] INCOMING", newNotification);
        notificationStore.addNotification(newNotification)
    }

    function check_required_user_preferences_handler(payload) {
        // console.log({ check_required_user_preferences_handler: payload, permissionStatus, isInitialized });


    }

    useEffect(() => {
        socket.subscribe("notification:insert", listener)

        return () => {
            socket.unsubscribe("notification:insert", listener)
        }
    }, [listener])


    useEffect(() => {

        async function setUpSystemPreferences() {
            if (!isAuthenticated) return;
            if (!isInitialized) {
                await initializeNotifications()
            }

            if (isInitialized) {
                if (permissionStatus !== "granted") {
                    await requestPermission()
                }

            }


            socket.subscribe("check_required_user_preferences", check_required_user_preferences_handler)

        }

        setUpSystemPreferences()


        return () => {
            socket.unsubscribe("check_required_user_preferences", check_required_user_preferences_handler)
        }
    }, [check_required_user_preferences_handler, permissionStatus, isInitialized])


    useEffect(() => {
        const abortController = new AbortController();

        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<{ instructions: string }>;
            const instructions = customEvent.detail.instructions ?? "";

            toast.info(<NotificationPermissionCard instructions={instructions} onPermissionRequest={isInitialized && requestPermission} />,
                {
                    id: "notify-access",
                    duration: isMobile ? 6000 : 10000,
                    dismissible: true,
                    important: true,
                    position: "bottom-right"
                }
            );
        };

        window.addEventListener("show-notification-instructions", handler, {
            once: true,
            signal: abortController.signal,
        });

        return () => abortController.abort();
    }, [isInitialized, requestPermission]);



    return null
}
