"use client"

import { useState, useRef, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Download, Play, Code2, Eye, Share2, Sparkles, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { downloadProjectAsZip } from "@/lib/zip-utils"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function EditorPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const projectId = searchParams.get("id")

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am CodeGenesis. Describe what you want to build, and I will architect and code it for you.' }
    ])
    const [input, setInput] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [code, setCode] = useState(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { background-color: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
    </style>
</head>
<body>
    <div class="text-center">
        <h1 class="text-4xl font-bold mb-4 text-indigo-400">Ready to Build</h1>
        <p class="text-slate-400">Enter a prompt to start generating your application.</p>
    </div>
</body>
</html>
  `)
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview')

    // Load project if ID exists
    useEffect(() => {
        if (!projectId) return

        const loadProject = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}`)
                if (!response.ok) throw new Error("Failed to load project")

                const data = await response.json()

                // Restore code
                if (data.files && data.files["index.html"]) {
                    setCode(data.files["index.html"].content)
                }

                // Restore chat history
                if (data.generations && data.generations.length > 0) {
                    const history: Message[] = []
                    // Add initial greeting
                    history.push({ role: 'assistant', content: 'Hello! I am CodeGenesis. Describe what you want to build, and I will architect and code it for you.' })

                    data.generations.forEach((gen: any) => {
                        history.push({ role: 'user', content: gen.prompt })
                        history.push({ role: 'assistant', content: gen.response || "I've updated the code." })
                    })
                    setMessages(history)
                }
            } catch (error: any) {
                console.error("Error loading project:", error)
                toast.error("Failed to load project", {
                    description: error.message || "Could not fetch project details"
                })
            }
        }
        loadProject()
    }, [projectId])

    const handleSend = async (customPrompt?: string) => {
        const promptToSend = customPrompt || input
        if (!promptToSend.trim()) return

        const userMessage = { role: 'user' as const, content: promptToSend }
        setMessages(prev => [...prev, userMessage])
        if (!customPrompt) setInput("")
        setIsGenerating(true)

        try {
            // Get keys from localStorage
            const storedKeys = localStorage.getItem("codegenesis_api_keys")
            const keys = storedKeys ? JSON.parse(storedKeys) : {}

            if (!keys.openai && !keys.anthropic) {
                toast.error("Missing API Keys", {
                    description: "Please configure your API keys in Settings to generate code.",
                    action: {
                        label: "Settings",
                        onClick: () => window.location.href = "/dashboard/settings/api-keys"
                    }
                })
                setIsGenerating(false)
                return
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openai-key': keys.openai || '',
                    'x-anthropic-key': keys.anthropic || ''
                },
                body: JSON.stringify({
                    prompt: promptToSend,
                    model: keys.anthropic ? 'claude-3-5-sonnet' : 'gpt-4o',
                    code: code // Send current code for context
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate')
            }

            const aiMessage = { role: 'assistant' as const, content: "I've updated the code based on your request." }
            setMessages(prev => [...prev, aiMessage])
            setCode(data.code)
            toast.success("Generation Complete!", {
                description: "Your application has been updated.",
            })

            // Play sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
            audio.volume = 0.5
            audio.play().catch(() => { }) // Ignore auto-play errors

            // Save generation if in project mode
            if (projectId) {
                await fetch(`/api/projects/${projectId}/generations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: promptToSend,
                        response: "I've updated the code based on your request.",
                        code: data.code,
                        model: keys.anthropic ? 'claude-3-5-sonnet' : 'gpt-4o',
                        provider: keys.anthropic ? 'anthropic' : 'openai'
                    })
                })
            }

        } catch (error: any) {
            toast.error("Generation Failed", {
                description: error.message
            })
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }])
        } finally {
            setIsGenerating(false)
        }
    }

    const handleRecommend = () => {
        handleSend("Analyze the current code and recommend 3 improvements or features to add, then implement the most important one.")
    }

    const handleDownload = async () => {
        try {
            await downloadProjectAsZip("codegenesis-project", [
                { name: "index.html", content: code }
            ])
            toast.success("Project Downloaded", {
                description: "Your project files have been saved as a ZIP archive.",
            })
        } catch (error) {
            toast.error("Download Failed", {
                description: "Could not generate ZIP file.",
            })
        }
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 p-2 bg-black/40 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold">New Project</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/5 rounded-full">Beta</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveTab(activeTab === 'code' ? 'preview' : 'code')}>
                        {activeTab === 'code' ? <Eye className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                        {activeTab === 'code' ? 'View Preview' : 'View Code'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10" onClick={handleRecommend}>
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Recommend Edits
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                        Download ZIP
                    </Button>
                    <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                {/* Chat Panel */}
                <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                    <div className="flex flex-col h-full bg-black/20">
                        <div className="p-3 border-b border-white/10 font-medium text-sm flex justify-between items-center">
                            <span>AI Architect</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <RefreshCw className="h-3 w-3" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-white/10 text-slate-200'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 rounded-lg p-3 text-sm flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-slate-400">Architecting solution...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t border-white/10 bg-black/40">
                            <div className="relative">
                                <Input
                                    placeholder="Describe your app..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="pr-10 bg-white/5 border-white/10 focus-visible:ring-primary"
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-1 top-1 h-8 w-8 bg-primary hover:bg-primary/90"
                                    onClick={() => handleSend()}
                                    disabled={isGenerating}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="mt-2 text-xs text-center text-muted-foreground">
                                Press Enter to send • Beta v0.45
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Preview/Code Panel */}
                <ResizablePanel defaultSize={70}>
                    <div className="h-full bg-[#1e1e1e]">
                        {activeTab === 'preview' ? (
                            <div className="h-full flex flex-col">
                                <div className="bg-white/5 border-b border-white/10 p-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="flex-1 text-center bg-black/20 rounded py-0.5 px-2 mx-4 truncate">
                                        localhost:3000/preview
                                    </div>
                                </div>
                                <iframe
                                    srcDoc={code}
                                    className="flex-1 w-full bg-white"
                                    title="Preview"
                                    sandbox="allow-scripts"
                                />
                            </div>
                        ) : (
                            <div className="h-full overflow-auto p-4 font-mono text-sm text-blue-300">
                                <pre>{code}</pre>
                            </div>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
