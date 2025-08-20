import React, { useState, useEffect } from 'react';
import {
    Home,
    Search,
    Bell,
    Mail,
    Bookmark,
    User,
    Settings,
    LogOut,
    X,
    Menu
} from 'lucide-react';
import AppHeader from './AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { MeetnMartText } from './ui/svg/MeetnMartText';

export const Sidebar = ({ isOpen, onClose }) => {
    const { profile, signOut } = useAuth()
    const location = useLocation()
    const isMobile = useIsMobile()
    // Prevent background scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);


    const menuItems = [
        { icon: Home, label: 'Home', link: "/feeds" },
        // { icon: Bookmark, label: 'Bookmarks', link: "#" },
        { icon: User, label: 'Profile', link: `/${profile.role}-dashboard` },
        { icon: Settings, label: 'Settings', link: `/settings/${profile.role}${isMobile ? "" : "/basic-information"}` },
    ];

    if (!isMobile) return null

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9999] md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full px-2 w-64 bg-background border-r border-muted z-[9999] 
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        md:relative md:translate-x-0 md:z-auto overflow-x-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <AppHeader
                    // @ts-ignore
                    title={<MeetnMartText variant="professional" size="small" />}
                    rightContent={
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full md:hidden"
                        >
                            <X size={20} />
                        </button>
                    }
                />

                {/* User Profile Section */}
                <div className="w-full pb-4 pl-2">
                    <div className="flex items-center space-x-3 rounded-full cursor-pointer">
                        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-market-orange/20 hover:ring-market-orange/40 transition-all">
                            <AvatarImage src={profile?.avatar} alt="Profile" />
                            <AvatarFallback className="bg-marring-market-orange/10 text-marring-market-orange font-semibold text-lg">
                                {getInitials(profile?.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/80 truncate">{profile.name}</p>
                            <p className="text-sm text-gray-500 truncate capitalize">{profile.role}</p>
                        </div>
                    </div>
                </div>
                {/* Navigation Items */}
                <nav className="space-y-2 ">
                    {menuItems.map((item, index) => (
                        <Link to={item.link}
                            key={index}
                            className={cn(
                                `
                w-full flex items-center space-x-3  py-3 
                transition-colors duration-200 text-left pl-2 rounded-md
              `, location.pathname == item.link ? 'bg-market-orange/10 text-market-orange font-medium' : "text-muted-foreground"
                            )}
                        >
                            {/* <Link to={item.link}> */}
                            <item.icon size={24} />
                            <span className="text-lg">{item.label}</span>
                            {/* </Link> */}
                        </Link>
                    ))}
                </nav>

                <div className="px-2 border-t bg-background absolute bottom-0 w-full">
                    <button onClick={signOut} className="flex items-center space-x-3 py-3   transition-colors duration-200 text-left text-destructive ">
                        <LogOut size={20} />
                        <span>Log out</span>
                    </button>
                </div>

            </div>
        </>
    );
};