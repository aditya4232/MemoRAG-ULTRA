'use client';

import { UserButton } from '@clerk/nextjs';

export default function ClientUserButton() {
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
