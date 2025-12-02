import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { WelcomeModal } from "@/components/modals/welcome-modal";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen" suppressHydrationWarning>
            <Sidebar />
            <div className="flex-1 pl-64 transition-all duration-300" suppressHydrationWarning>
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-center text-xs font-medium text-yellow-500" suppressHydrationWarning>
                    🚧 CodeGenesis Beta v0.45 - Under Active Development by Aditya Shenvi & Sneha Sah 🚧
                </div>
                <Header />
                <main className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
                <WelcomeModal />
            </div>
        </div>
    );
}
