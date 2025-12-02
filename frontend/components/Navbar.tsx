'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles, Code2 } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <div className="relative h-8 w-8">
                        <Image
                            src="/icon.png"
                            alt="CodeGenesis Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        CodeGenesis
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
                    <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
                    <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-4">
                    <SignedOut>
                        <Link href="/sign-in">
                            <Button variant="ghost" size="sm" className="text-sm">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button size="sm" className="gap-2">
                                Get Started
                            </Button>
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button variant="default" size="sm" className="gap-2">
                                Dashboard
                            </Button>
                        </Link>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'h-9 w-9',
                                },
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
