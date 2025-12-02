"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { createProject } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"

export function NewProjectModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { user } = useUser()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "web_app",
        techStack: "nextjs",
        requirements: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!formData.name) {
            toast.error("Project name is required")
            return
        }

        setIsLoading(true)
        try {
            // Combine details into description for AI context
            const fullDescription = `Type: ${formData.type}\nTech Stack: ${formData.techStack}\n\nRequirements:\n${formData.requirements}\n\nDescription:\n${formData.description}`

            const project = await createProject({
                id: undefined, // Let DB generate ID
                user_id: user.id,
                name: formData.name,
                description: fullDescription,
                tech_stack: [formData.techStack, formData.type],
                status: 'planning'
            })

            if (project) {
                toast.success("Project created successfully")
                onOpenChange(false)
                // Redirect to editor with new project context
                router.push(`/dashboard/editor?id=${project.id}`)
            } else {
                throw new Error("Failed to create project")
            }
        } catch (error) {
            toast.error("Failed to create project")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#09090b] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Tell us about your idea. The more details you provide, the better the AI can architect your solution.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., E-commerce Platform"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Project Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="web_app">Web Application</SelectItem>
                                    <SelectItem value="mobile_app">Mobile App</SelectItem>
                                    <SelectItem value="api">REST API</SelectItem>
                                    <SelectItem value="script">Automation Script</SelectItem>
                                    <SelectItem value="cli">CLI Tool</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="techStack">Primary Tech Stack</Label>
                        <Select
                            value={formData.techStack}
                            onValueChange={(val) => setFormData({ ...formData, techStack: val })}
                        >
                            <SelectTrigger className="bg-black/20 border-white/10">
                                <SelectValue placeholder="Select stack" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nextjs">Next.js + React + Tailwind</SelectItem>
                                <SelectItem value="react_node">React + Node.js</SelectItem>
                                <SelectItem value="python_fastapi">Python FastAPI</SelectItem>
                                <SelectItem value="python_django">Python Django</SelectItem>
                                <SelectItem value="flutter">Flutter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requirements">Detailed Requirements</Label>
                        <Textarea
                            id="requirements"
                            placeholder="Describe the features, user flows, and specific needs..."
                            className="min-h-[100px] bg-black/20 border-white/10"
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            AI uses this to generate the initial architecture and code structure.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="Brief summary..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-black/20 border-white/10"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 gap-2">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Create & Architect
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
