"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Save, Trash2, Shield, CheckCircle2, Cpu, Zap } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApiKeysPage() {
    const [keys, setKeys] = useState({
        openai: "",
        anthropic: "",
        openrouter: "",
        groq: "",
        stability: ""
    })
    const [models, setModels] = useState({
        openai: "gpt-4o",
        anthropic: "claude-3-5-sonnet-20240620",
        openrouter: "google/gemini-2.0-flash-exp:free",
        groq: "llama3-70b-8192"
    })
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
    const [configuredProviders, setConfiguredProviders] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchConfiguredProviders()
    }, [])

    const fetchConfiguredProviders = async () => {
        try {
            const response = await fetch('/api/keys')
            if (response.ok) {
                const data = await response.json()
                setConfiguredProviders(data.providers?.map((p: any) => p.provider) || [])
            }
        } catch (error) {
            console.error('Error fetching providers:', error)
        }
    }

    const handleSave = async (provider: string) => {
        const apiKey = keys[provider as keyof typeof keys]
        if (!apiKey) {
            toast.error("Please enter an API key")
            return
        }

        setIsSaving(prev => ({ ...prev, [provider]: true }))
        try {
            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    modelId: models[provider as keyof typeof models],
                    isCustomModel: models[provider as keyof typeof models] === 'custom'
                })
            })

            if (response.ok) {
                toast.success(`${provider.toUpperCase()} API key saved securely`, {
                    description: "Your key is encrypted and stored in the database"
                })
                setKeys(prev => ({ ...prev, [provider]: "" }))
                fetchConfiguredProviders()
            } else {
                const error = await response.json()
                toast.error(error.error || "Failed to save API key")
            }
        } catch (error) {
            toast.error("Failed to save API key")
            console.error(error)
        } finally {
            setIsSaving(prev => ({ ...prev, [provider]: false }))
        }
    }

    const handleDelete = async (provider: string) => {
        if (!confirm(`Are you sure you want to delete your ${provider.toUpperCase()} API key?`)) {
            return
        }

        try {
            const response = await fetch(`/api/keys?provider=${provider}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast.success(`${provider.toUpperCase()} API key deleted`)
                fetchConfiguredProviders()
            } else {
                toast.error("Failed to delete API key")
            }
        } catch (error) {
            toast.error("Failed to delete API key")
            console.error(error)
        }
    }

    const toggleShowKey = (provider: string) => {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
    }

    const isConfigured = (provider: string) => configuredProviders.includes(provider)

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    Secure API Configuration
                </h1>
                <p className="text-muted-foreground mt-2">
                    Your API keys are encrypted and stored securely in the database. They are never exposed to the client.
                </p>
            </div>

            <div className="grid gap-6">
                {/* OpenAI */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-green-500" />
                                OpenAI
                            </div>
                            {isConfigured('openai') && (
                                <div className="flex items-center gap-2 text-sm text-green-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Configured
                                </div>
                            )}
                        </CardTitle>
                        <CardDescription>Standard industry models (GPT-4, GPT-3.5).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showKeys.openai ? "text" : "password"}
                                        value={keys.openai}
                                        onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                                        placeholder={isConfigured('openai') ? "••••••••••••••••" : "sk-..."}
                                        className="pr-10 bg-black/20 border-white/10"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('openai')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                    >
                                        {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button
                                    onClick={() => handleSave('openai')}
                                    disabled={isSaving.openai || !keys.openai}
                                    className="gap-2"
                                >
                                    {isSaving.openai ? "Saving..." : <><Save className="h-4 w-4" /> Save</>}
                                </Button>
                                {isConfigured('openai') && (
                                    <Button
                                        onClick={() => handleDelete('openai')}
                                        variant="destructive"
                                        size="icon"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {(keys.openai || isConfigured('openai')) && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.openai} onValueChange={(val) => setModels(prev => ({ ...prev, openai: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Anthropic */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-purple-500" />
                                Anthropic
                            </div>
                            {isConfigured('anthropic') && (
                                <div className="flex items-center gap-2 text-sm text-green-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Configured
                                </div>
                            )}
                        </CardTitle>
                        <CardDescription>High-performance Claude models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showKeys.anthropic ? "text" : "password"}
                                        value={keys.anthropic}
                                        onChange={(e) => setKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                                        placeholder={isConfigured('anthropic') ? "••••••••••••••••" : "sk-ant-..."}
                                        className="pr-10 bg-black/20 border-white/10"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('anthropic')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                    >
                                        {showKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button
                                    onClick={() => handleSave('anthropic')}
                                    disabled={isSaving.anthropic || !keys.anthropic}
                                    className="gap-2"
                                >
                                    {isSaving.anthropic ? "Saving..." : <><Save className="h-4 w-4" /> Save</>}
                                </Button>
                                {isConfigured('anthropic') && (
                                    <Button
                                        onClick={() => handleDelete('anthropic')}
                                        variant="destructive"
                                        size="icon"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {(keys.anthropic || isConfigured('anthropic')) && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.anthropic} onValueChange={(val) => setModels(prev => ({ ...prev, anthropic: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
                                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* OpenRouter */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-blue-500" />
                                OpenRouter
                            </div>
                            {isConfigured('openrouter') && (
                                <div className="flex items-center gap-2 text-sm text-green-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Configured
                                </div>
                            )}
                        </CardTitle>
                        <CardDescription>Access to various models (Llama, Mistral, Gemini, etc.).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showKeys.openrouter ? "text" : "password"}
                                        value={keys.openrouter}
                                        onChange={(e) => setKeys(prev => ({ ...prev, openrouter: e.target.value }))}
                                        placeholder={isConfigured('openrouter') ? "••••••••••••••••" : "sk-or-..."}
                                        className="pr-10 bg-black/20 border-white/10"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('openrouter')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                    >
                                        {showKeys.openrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button
                                    onClick={() => handleSave('openrouter')}
                                    disabled={isSaving.openrouter || !keys.openrouter}
                                    className="gap-2"
                                >
                                    {isSaving.openrouter ? "Saving..." : <><Save className="h-4 w-4" /> Save</>}
                                </Button>
                                {isConfigured('openrouter') && (
                                    <Button
                                        onClick={() => handleDelete('openrouter')}
                                        variant="destructive"
                                        size="icon"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {(keys.openrouter || isConfigured('openrouter')) && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.openrouter} onValueChange={(val) => setModels(prev => ({ ...prev, openrouter: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</SelectItem>
                                        <SelectItem value="meta-llama/llama-3-70b-instruct">Llama 3 70B</SelectItem>
                                        <SelectItem value="mistralai/mistral-large">Mistral Large</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Groq */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-orange-500" />
                                Groq
                            </div>
                            {isConfigured('groq') && (
                                <div className="flex items-center gap-2 text-sm text-green-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Configured
                                </div>
                            )}
                        </CardTitle>
                        <CardDescription>Ultra-fast inference.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showKeys.groq ? "text" : "password"}
                                        value={keys.groq}
                                        onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value }))}
                                        placeholder={isConfigured('groq') ? "••••••••••••••••" : "gsk_..."}
                                        className="pr-10 bg-black/20 border-white/10"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('groq')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                    >
                                        {showKeys.groq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button
                                    onClick={() => handleSave('groq')}
                                    disabled={isSaving.groq || !keys.groq}
                                    className="gap-2"
                                >
                                    {isSaving.groq ? "Saving..." : <><Save className="h-4 w-4" /> Save</>}
                                </Button>
                                {isConfigured('groq') && (
                                    <Button
                                        onClick={() => handleDelete('groq')}
                                        variant="destructive"
                                        size="icon"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {(keys.groq || isConfigured('groq')) && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.groq} onValueChange={(val) => setModels(prev => ({ ...prev, groq: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                                        <SelectItem value="llama3-8b-8192">Llama 3 8B</SelectItem>
                                        <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="space-y-1">
                            <h3 className="font-semibold text-blue-500">Security Notice</h3>
                            <p className="text-sm text-muted-foreground">
                                All API keys are encrypted using industry-standard encryption (AES-256) before being stored in the database.
                                Keys are only decrypted server-side when making API calls and are never sent to the client.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
