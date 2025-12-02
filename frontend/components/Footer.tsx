import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">CodeGenesis</h3>
                        <p className="text-sm text-muted-foreground">
                            Autonomous AI Software Architect. Build production-ready applications at the speed of thought.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/how-it-works" className="hover:text-foreground">How it Works</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                            <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
                            <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/terms" className="hover:text-foreground">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Developers</h4>
                        <ul className="space-y-6 text-sm text-muted-foreground">
                            <li className="flex flex-col gap-1">
                                <span className="font-medium text-foreground">Aditya Shenvi</span>
                                <p className="text-xs leading-relaxed">
                                    Cloud, Fullstack & AI Engineer Aspirant.<br />
                                    Final Year CSE Student.<br />
                                    Looking for full-time opportunities.
                                </p>
                                <div className="flex gap-3 mt-1">
                                    <Link href="https://www.linkedin.com/in/adityashenvi/" target="_blank" className="hover:text-blue-500 transition-colors">
                                        <Linkedin className="h-4 w-4" />
                                    </Link>
                                    <Link href="https://github.com/aditya4232" target="_blank" className="hover:text-white transition-colors">
                                        <Github className="h-4 w-4" />
                                    </Link>
                                </div>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-medium text-foreground">Sneha Sah</span>
                                <p className="text-xs leading-relaxed">
                                    Cyber Security Tech.<br />
                                    Open for opportunities.
                                </p>
                                <div className="flex gap-3 mt-1">
                                    <Link href="https://www.linkedin.com/in/sneha-sah-760b40250/" target="_blank" className="hover:text-blue-500 transition-colors">
                                        <Linkedin className="h-4 w-4" />
                                    </Link>
                                    <Link href="https://github.com/amyy45" target="_blank" className="hover:text-white transition-colors">
                                        <Github className="h-4 w-4" />
                                    </Link>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>&copy; 2025 CodeGenesis. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-foreground"><Github className="h-4 w-4" /></Link>
                        <Link href="#" className="hover:text-foreground"><Twitter className="h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
