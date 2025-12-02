'use client';

import { UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function ClientUserButton() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" suppressHydrationWarning={true} />;
    }

    return (
        <UserButton
            appearance={{
                elements: {
                    avatarBox: 'h-9 w-9 ring-2 ring-white/10 hover:ring-primary/50 transition-all',
                    userButtonPopoverCard: 'bg-[#09090b] border border-white/10',
                    userButtonPopoverFooter: 'hidden',
                },
            }}
        />
    );
}
