'use client';

import { Bell, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserButton, useUser } from '@clerk/nextjs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

export function Header() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Welcome to Beta v0.45', message: 'Thanks for joining our early access program!', time: 'Just now', read: false },
        { id: 2, title: 'New Feature', message: 'Try the new Live Editor with split view.', time: '2 hours ago', read: false },
    ]);

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/50 px-6 backdrop-blur-xl" suppressHydrationWarning>
            <div className="flex flex-1 items-center gap-4" suppressHydrationWarning>
                <div className="relative w-full max-w-md" suppressHydrationWarning>
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="w-full bg-background/50 pl-9 md:w-[300px] lg:w-[400px] border-white/10 focus:border-primary/50"
                        suppressHydrationWarning
                    />
                </div>
            </div>
            <div className="flex items-center gap-4" suppressHydrationWarning>
                {user && (
                    <div className="hidden md:flex flex-col items-end" suppressHydrationWarning>
                        <span className="text-sm font-medium">{user.fullName || user.firstName}</span>
                        <span className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                )}

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative hover:bg-white/10" suppressHydrationWarning>
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            {notifications.some(n => !n.read) && (
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 bg-[#09090b] border-white/10" align="end">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h4 className="font-semibold">Notifications</h4>
                            {notifications.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-auto p-0 text-muted-foreground hover:text-white">
                                    Clear all
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="h-[300px]">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No new notifications
                                </div>
                            ) : (
                                <div className="grid">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="text-sm font-medium">{notification.title}</h5>
                                                <span className="text-xs text-muted-foreground">{notification.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <div suppressHydrationWarning>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'h-9 w-9 ring-2 ring-white/10 hover:ring-primary/50 transition-all',
                                userButtonPopoverCard: 'bg-[#09090b] border border-white/10',
                                userButtonPopoverFooter: 'hidden',
                            },
                        }}
                    />
                </div>
            </div>
        </header>
    );
}

