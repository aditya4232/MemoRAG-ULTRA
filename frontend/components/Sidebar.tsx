'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FolderGit2,
    Settings,
    Code2,
    LifeBuoy,
    LogOut
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FolderGit2, label: 'Projects', href: '/dashboard/projects' },
    { icon: Code2, label: 'Editor', href: '/dashboard/editor' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useClerk();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background/50 backdrop-blur-xl transition-transform" suppressHydrationWarning>
            <div className="flex h-full flex-col" suppressHydrationWarning>
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-border px-6" suppressHydrationWarning>
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight" suppressHydrationWarning>
                        <div className="relative h-8 w-8" suppressHydrationWarning>
                            <Image
                                src="/icon.png"
                                alt="CodeGenesis Logo"
                                fill
                                sizes="32px"
                                className="object-contain"
                            />
                        </div>
                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            CodeGenesis
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4" suppressHydrationWarning>
                    <nav className="space-y-1 px-3" suppressHydrationWarning>
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                    suppressHydrationWarning
                                >
                                    <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4" suppressHydrationWarning>
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        suppressHydrationWarning
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
