"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Plus, FolderGit2, MoreVertical, Github, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserProjects, Project } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { toast } from "sonner"
import { NewProjectModal } from "@/components/modals/new-project-modal"

export default function ProjectsPage() {
    const { user } = useUser()
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)

    useEffect(() => {
        async function fetchProjects() {
            if (!user) return
            try {
                const data = await getUserProjects(user.id)
                setProjects(data)
            } catch (error) {
                toast.error("Failed to load projects")
            } finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [user])

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8" suppressHydrationWarning>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage and organize your AI-generated applications.</p>
                </div>
                <Button onClick={() => setIsNewProjectOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    New Project
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9 bg-black/20 border-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="border-white/10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[200px] rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <FolderGit2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        {searchQuery ? "Try adjusting your search query." : "Start by creating your first AI-powered application."}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => setIsNewProjectOpen(true)}>Create Project</Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/dashboard/editor?id=${project.id}`} className="block h-full">
                                <Card className="bg-black/40 border-white/10 hover:border-primary/50 transition-all group h-full flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {project.description || "No description provided."}
                                                </CardDescription>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            {project.tech_stack?.map((tech) => (
                                                <span key={tech} className="px-2 py-1 rounded-md bg-white/5 text-xs font-medium text-muted-foreground border border-white/5">
                                                    {tech}
                                                </span>
                                            ))}
                                            {(!project.tech_stack || project.tech_stack.length === 0) && (
                                                <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-medium text-muted-foreground border border-white/5">
                                                    HTML/CSS
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t border-white/5 pt-4 flex justify-between text-xs text-muted-foreground">
                                        <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            {project.repository_url && <Github className="h-4 w-4 hover:text-white cursor-pointer" />}
                                            {project.deployment_url && <Globe className="h-4 w-4 hover:text-white cursor-pointer" />}
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
            <NewProjectModal open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
        </div>
    )
}
