import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Bell,
  Star,
  ShoppingBag,
  Settings,
  Trophy,
  TrendingUp,
  Users,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  Calendar,
  Activity as ActivityIcon,
  Zap,
  Gift,
  MessageSquare,
  ChevronDown,
  X,
  Quote,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotificationStore } from '@/contexts/store/notification';
import { useGetNotifications } from '@/hooks/api-hooks';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import moment from "moment"
import Loader from '@/components/ui/loader';
import SEO from '@/components/SEO';


const Activity = () => {
  const isMobile = useIsMobile()
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const notification = useGetNotifications()

  const notificationStore = useNotificationStore()
  const stats = notificationStore.stats;
  const activityData = notificationStore.items;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    let filtered = activityData;
    // let filtered = sampleActivityData;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilter);
    }

    if (selectedFilter === "all") return filtered

    if (showUnreadOnly) {
      filtered = filtered.filter(item => !item.is_read);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedFilter, activityData, searchQuery, showUnreadOnly]);

  const getActivityIcon = (type, discriminant?: string) => {
    const iconProps = { size: 18, className: "text-white" };
    switch (type) {
      case 'feedback': return <Star {...iconProps} />;
      case 'order': return <ShoppingBag {...iconProps} />;
      case 'system': return <Settings {...iconProps} />;
      case 'achievement': return <Trophy {...iconProps} />;
      case 'promotion': return <TrendingUp {...iconProps} />;
      case 'community': return <Users {...iconProps} />;
      case 'interaction':
        switch (true) {
          case discriminant === "bookmark":
            return <Bookmark {...iconProps} />
            break;

          default:
            break;
        }
      default: return <Bell {...iconProps} />;
    }
  };

  const getActivityColor = (type: string, discriminant?: string) => {
    switch (type) {
      case 'feedback': return 'bg-gradient-to-br from-amber-400 to-orange-500';
      case 'order': return 'bg-gradient-to-br from-emerald-400 to-teal-600';
      case 'system': return 'bg-gradient-to-br from-blue-400 to-indigo-600';
      case 'achievement': return 'bg-gradient-to-br from-purple-400 to-pink-600';
      case 'promotion': return 'bg-gradient-to-br from-rose-400 to-red-600';
      case 'community': return 'bg-gradient-to-br from-cyan-400 to-blue-500';
      case "interaction":
        switch (discriminant) {
          case "bookmark":
            return 'bg-market-purple';
            break;

          default:
            break;
        }
      default: return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };


  const filterOptions = useMemo(() => {
    const base = [
      {
        value: 'all',
        label: 'All Activities',
        icon: Bell,
        count: notificationStore.items.length,
      },
    ]

    // Extract unique types from notificationStore.items
    const typeMap = new Map<string, number>()

    for (const item of notificationStore.items) {
      const key = item.type.toLowerCase()
      typeMap.set(key, (typeMap.get(key) || 0) + 1)
    }

    const variantOptions = Array.from(typeMap.entries()).map(([type, count]) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      icon: Bell,
      count,
    }))

    return [...base, ...variantOptions]
  }, [notificationStore.items])


  const currentFilter = filterOptions.find(f => f.value === selectedFilter);
  const totalUnreadInFilter = filteredActivities.filter(item => !item.is_read).length;

  return (
    <>
      <SEO 
        title="Activities | MeetnMart"
        description="Stay updated with all your activities and notifications. Track your interactions, promotions, and community updates in one place. Manage your MeetnMart experience efficiently."
        keywords="activities, notifications, user activities, activity feed, notification center, user interactions, promotion updates, community updates, activity tracking, notification management, user dashboard, activity history, notification preferences, activity filters, unread notifications, activity types, user engagement, activity monitoring, notification settings, activity overview, user notifications"
      />
      {/* Header */}
      <AppHeader
        title='Activities'
        subtitle="Manage all your notifications and activities"
        search={{
          onSearch(query) {
            setSearchQuery(query)
          },
          onClear() {
            setSearchQuery("")
          },
        }}
        rightContent={
          <div className="flex items-center space-x-2">
            {/* Mobile Filter Dropdown */}
            {isMobile ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline-flex">{currentFilter?.label}</span>
                  {totalUnreadInFilter > 0 && (
                    <span className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalUnreadInFilter}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </Button>

                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-muted backdrop-blur-xl rounded-2xl shadow-2xl  py-2 z-50">
                    <div className="px-4 py-2 border-b border-muted-foreground/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Filter Activities</span>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="py-2 max-h-60 overflow-y-auto">
                      {filterOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedFilter === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedFilter(option.value);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200 ${isSelected
                              ? 'text-white'
                              : ' text-muted-foreground'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{option.label}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${isSelected
                              ? 'text-white'
                              : 'text-muted-foreground'
                              }`}>
                              {option.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-4 py-2 border-t  border-muted-foreground/30">
                      <button
                        onClick={() => {
                          setShowUnreadOnly(!showUnreadOnly);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all ${showUnreadOnly
                          ? 'text-white'
                          : 'text-muted-foreground'
                          }`}
                      >
                        {showUnreadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                          {showUnreadOnly ? 'Show All' : 'Unread Only'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant='ghost'
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="flex items-center space-x-2"
              >
                {showUnreadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {showUnreadOnly ? 'Show All' : 'Unread Only'}
                </span>
              </Button>
            )}
          </div>
        }
      />

      <div className="container px-4 sm:px-6 lg:px-8 mb-[5rem]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <div className="space-y-6">

                {/* Quick Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        color: "red",
                        value: stats.totalUnread,
                        label: "Unread",
                        ring: "ring-red-300/20",
                      },
                      {
                        color: "blue",
                        value: stats.todayCount,
                        label: "Today",
                        ring: "ring-blue-300/20",
                      },
                      {
                        color: "emerald",
                        value: stats.weekCount,
                        label: "This Week",
                        ring: "ring-emerald-300/20",
                      },
                      {
                        color: "purple",
                        value: stats.monthCount,
                        label: "This Month",
                        ring: "ring-purple-300/20",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm ring-1 ${item.ring}`}
                      >
                        <div className={`text-2xl font-bold text-${item.color}-300`}>
                          {item.value}
                        </div>
                        <div className={`text-xs text-${item.color}-200 font-medium`}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-4">Filter Activities</h3>
                  <div className="space-y-2">
                    {filterOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = selectedFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setSelectedFilter(option.value)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200
                         ${isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                              : 'bg-white/10 text-white/80 backdrop-blur-md hover:bg-white/15'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-white/10 text-white/60'
                              }`}
                          >
                            {option.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={isMobile ? "col-span-1" : "lg:col-span-3"}>
            {/* Mobile Creative Quick Stats */}
            {isMobile && (
              <div className="mb-6">
                <div className="relative bg-gradient-to-br via-market-purple to-market-orange rounded-3xl p-4 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-xs">Activity Overview</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>

                    <div className="flex items-stretch justify-start max-w-full overflow-x-auto scrollbar-small gap-4 pb-2">
                      {[
                        {
                          icon: <Bell className="w-4 h-4 text-red-300" />,
                          bg: "bg-red-500/20",
                          label: "Unread",
                          value: stats.totalUnread,
                        },
                        {
                          icon: <Calendar className="w-4 h-4 text-blue-300" />,
                          bg: "bg-blue-500/20",
                          label: "Today",
                          value: stats.todayCount,
                        },
                        {
                          icon: <TrendingUp className="w-4 h-4 text-emerald-300" />,
                          bg: "bg-emerald-500/20",
                          label: "This Week",
                          value: stats.weekCount,
                        },
                        {
                          icon: <Trophy className="w-4 h-4 text-purple-300" />,
                          bg: "bg-purple-500/20",
                          label: "This Month",
                          value: stats.monthCount,
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="min-w-[140px] h-28 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 flex flex-col justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 ${item.bg} rounded-full flex items-center justify-center`}>
                              {item.icon}
                            </div>
                          </div>
                          <div className="flex flex-col text-white text-center">
                            <span className="text-2xl font-bold leading-tight">{item.value}</span>
                            <span className="text-white/80 text-sm font-medium">{item.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="space-y-4">
              {notification.isLoading ? <Loader /> : filteredActivities.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <ActivityIcon className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No Activities Found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 ${activity.is_read ? '' : 'ring-2 ring-indigo-400/30'
                      }`}

                  >
                    <div className="flex items-start space-x-4">
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg ${getActivityColor(activity.type, activity?.metadata?.type)}`}>
                        {getActivityIcon(activity.type, activity?.metadata?.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-muted-foreground">{activity.title}</h3>
                                <p className="text-foreground text-sm leading-relaxed mb-3 first:capitalize">{activity.description || activity.metadata?.message || activity.title || activity.type}</p>
                              </div>
                              {!activity.is_read && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                              )}
                              {activity.priority === 'high' && (
                                <Zap className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            {/* <p className="text-foreground text-sm leading-relaxed mb-3 capitalize">{activity.metadata?.message}</p> */}

                            {/* Metadata */}
                            {activity.metadata && (
                              <div className="mb-3 relative space-y-2">
                                {/* Flex-wrapped metadata */}
                                <div className="flex flex-wrap items-center gap-4">
                                  {activity.metadata.sender && (
                                    <div className="flex items-center space-x-2">
                                      <img
                                        src={activity.metadata.sender.avatar}
                                        alt={activity.metadata.sender.avatar}
                                        className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                                      />
                                      <span className="text-sm font-medium text-muted-foreground">{activity.metadata.sender.name}</span>
                                    </div>
                                  )}

                                  {activity.metadata.rating && (
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${i < activity.metadata.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {activity.metadata.amount && (
                                    <div className="flex items-center space-x-1 px-3 py-1 bg-market-orange/10 rounded-full">
                                      <DollarSign className="w-4 h-4 text-market-orange/70" />
                                      <span className="text-sm font-semibold text-market-orange">
                                        {formatCurrency(activity.metadata.amount)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {activity.metadata.badges && (
                                  activity.metadata.badges.map((badge, index) => (
                                    <div
                                      key={index}
                                      className="px-2 py-1 inline-block bg-market-purple/10 text-market-purple text-xs font-medium rounded-full whitespace-nowrap shrink-0"
                                    >
                                      {badge}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="md:flex items-center  space-y-2 md:space-x-4 md:space-y-0 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{moment(activity.created_at).fromNow()}</span>
                                </div>
                                {activity.metadata?.duration && (
                                  <div className="flex items-center space-x-1">
                                    <span>Duration: {activity.metadata.duration} Min</span>
                                  </div>
                                )}
                              </div>

                              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Activity;