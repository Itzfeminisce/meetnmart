import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Heart } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';

const SettingsPage = () => {
    const { user, signOut, userRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    // State to control mobile view: false = list, true = detail
    const [showDetail, setShowDetail] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Helper to handle section click
    const handleSectionClick = (action: () => void) => {
        if (isMobile) {
            setShowDetail(true);
        }
        action();
    };

    const settingsSections = [
        {
            title: 'Account',
            items: [
                {
                    icon: <User className="h-5 w-5" />,
                    title: 'Basic Information',
                    description: 'Edit your profile and personal details',
                    action: () => handleSectionClick(() => navigate(`./basic-information`)),
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: <Heart className="h-5 w-5" />,
                    title: 'Interests',
                    description: 'Manage your interests',
                    action: () => handleSectionClick(() => navigate(`./interests`)),
                    showChevron: true,
                },
                {
                    icon: <Bell className="h-5 w-5" />,
                    title: 'Notifications',
                    description: 'Manage your notification preferences',
                    action: () => null, //handleSectionClick(() => navigate('./notifications')),
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: <HelpCircle className="h-5 w-5" />,
                    title: 'Help & Support',
                    description: 'Get help and contact support',
                    action: () => null, // handleSectionClick(() => navigate('./help')),
                    showChevron: true,
                },
                
                {
                    icon: <Shield className="h-5 w-5" />,
                    title: 'Terms of Service',
                    description: 'Read our terms of service',
                    action: () => handleSectionClick(() => navigate('/terms-of-service')),
                    showChevron: true,
                },
                {
                    icon: <Shield className="h-5 w-5" />,
                    title: 'Privacy Policy',
                    description: 'Read our privacy policy',
                    action: () => handleSectionClick(() => navigate('/privacy-policy')),
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Account Actions',
            items: [
                {
                    icon: <LogOut className="h-5 w-5" />,
                    title: 'Sign Out',
                    description: 'Sign out of your account',
                    action: handleSignOut,
                    showChevron: false,
                    variant: 'destructive' as const,
                },
            ],
        },
    ];

    // Mobile: show back button in detail view
    const handleBack = () => {
        setShowDetail(false);
        navigate(-1);
    };

    return (
        <>
            <SEO 
                title="Settings | MeetnMart"
                description="Manage your MeetnMart account settings, preferences, and profile. Customize notifications, privacy settings, payment methods, and account security. Take control of your marketplace experience."
                keywords="settings, account settings, user preferences, notification settings, privacy settings, payment settings, security settings, profile settings, account management, user dashboard, settings configuration, notification preferences, privacy policy, account security, payment methods, user profile, settings management, account customization, user preferences, settings dashboard, account configuration"
            />
            <AppHeader
                title="Settings"
                showBackButton
                onBackClick={handleBack}
                rightContent={
                    <Button className='' variant='outline' asChild>
                        <Link to={`/${userRole}-dashboard`}>Goto Dashboard</Link>
                    </Button>
                }
            />
            <div className="calc(max-h-screen-20%) overflow-hidden">
                {/* Desktop layout */}
                {!isMobile && (
                    <div className={cn("grid", "grid-cols-4", "")}>
                        <div className="overflow-x-hidden overflow-y-auto scrollbar-small max-h-screen py-4 ">
                            {/* Settings Sections */}
                            <div className="space-y-6">
                                {settingsSections.map((section, sectionIndex) => (
                                    <Card key={sectionIndex} className="border-0 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                                {section.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            {section.items.map((item, itemIndex) => (
                                                <div key={itemIndex}>
                                                    <Button
                                                        variant="ghost"
                                                        className={`w-full justify-start h-auto p-4 hover:bg-muted/50 ${item.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''}`}
                                                        onClick={item.action}
                                                    >
                                                        <div className="flex items-center w-full">
                                                            <div className={`mr-3 ${item.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                {item.icon}
                                                            </div>
                                                            <div className="flex-1 text-left">
                                                                <div className={`font-medium ${item.variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>
                                                                    {item.title}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {item.description}
                                                                </div>
                                                            </div>
                                                            {item.showChevron && (
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground mr-auto" />
                                                            )}
                                                        </div>
                                                    </Button>
                                                    {itemIndex < section.items.length - 1 && (
                                                        <Separator className="my-1" />
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* Version Info */}
                            <div className="text-center pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Version 1.0.0
                                </p>
                            </div>
                        </div>
                        {/* Right section */}
                        <div className={cn("col-span-3 max-h-screen p-4 overflow-auto scrollbar-small", isMobile ? "col-span-full" : "")}>
                            <Outlet />
                        </div>
                    </div>
                )}
                {/* Mobile layout */}
                {isMobile && (
                    <div>
                        {/* Show list or detail based on showDetail */}
                        {!showDetail ? (
                            <div className="overflow-x-hidden overflow-y-auto scrollbar-small max-h-screen pb-4">
                                <div className="">
                                    {settingsSections.map((section, sectionIndex) => (
                                        <Card key={sectionIndex} className="border-0 shadow-sm">
                                            <CardHeader className="pb-3 pl-4 ml-0">
                                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                                    {section.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1 pl-0 ml-0">
                                                {section.items.map((item, itemIndex) => (
                                                    <div key={itemIndex}>
                                                        <Button
                                                            variant="ghost"
                                                            className={` w-full justify-start h-auto p-4 hover:bg-muted/50 ${item.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''}`}
                                                            onClick={item.action}
                                                        >
                                                            <div className="flex items-center w-full">
                                                                <div className={`mr-3 ${item.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                    {item.icon}
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <div className={`font-medium ${item.variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>
                                                                        {item.title}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {item.description}
                                                                    </div>
                                                                </div>
                                                                {item.showChevron && (
                                                                    <ChevronRight className="h-4 w-4 text-muted-foreground mr-auto" />
                                                                )}
                                                            </div>
                                                        </Button>
                                                        {itemIndex < section.items.length - 1 && (
                                                            <Separator className="my-1" />
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                {/* Version Info */}
                                <div className="text-center pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Version 1.0.0
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4">
                                {/* Back button is handled by AppHeader */}
                                <Outlet />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default SettingsPage;
