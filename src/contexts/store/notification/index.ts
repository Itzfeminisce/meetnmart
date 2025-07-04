// store/notifications.ts
import { Notification, NotificationType } from '@/types'
import { create } from 'zustand'

interface NotificationStats {
  totalUnread: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

interface NotificationStore {
  items: Notification[],
  stats: NotificationStats,
  getVariants: () => NotificationType[],
  addNotification: (item: Notification) => void;
  addNotifications: (record: { stats: NotificationStats, items: Notification[] }) => void;
}

const defaultStats: NotificationStats = {
  monthCount: 0,
  todayCount: 0,
  totalUnread: 0,
  weekCount: 0
}


export const useNotificationStore = create<NotificationStore>((set, get) => ({
  items: [],
  stats: defaultStats,
  getVariants: () => get().items.map(n => n.type),
  addNotification: (n) =>
    set((state) => ({ items: [n, ...state.items] })),
  addNotifications: (record) => set({ items: record.items, stats: record.stats })
}))
