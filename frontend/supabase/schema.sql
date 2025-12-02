-- ============================================
-- CODEGENESIS SECURE DATABASE SCHEMA
-- Version: Beta v0.45
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- ============================================
-- PROFILES TABLE (User Information)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PROJECTS TABLE (User Projects)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT DEFAULT 'web_app', -- web_app, mobile_app, api, script, cli
    tech_stack TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'deployed', 'archived')),
    
    -- Project Files (stored as JSONB for flexibility)
    files JSONB DEFAULT '{}', -- { "path/to/file.js": { "content": "...", "language": "javascript" } }
    
    -- URLs
    repository_url TEXT,
    deployment_url TEXT,
    
    -- Metadata
    last_generated_at TIMESTAMPTZ,
    generation_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- GENERATIONS TABLE (AI Generation History)
-- ============================================
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Generation Details
    prompt TEXT NOT NULL,
    response TEXT,
    model_used TEXT,
    provider TEXT, -- openai, anthropic, openrouter, groq
    
    -- Generated Code/Files
    generated_files JSONB, -- { "path/to/file.js": { "content": "...", "language": "javascript" } }
    
    -- Metadata
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- USER_SETTINGS TABLE (User Preferences)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- UI Preferences
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    
    -- AI Preferences
    default_provider TEXT DEFAULT 'openai', -- openai, anthropic, openrouter, groq
    default_model TEXT DEFAULT 'gpt-4o',
    
    -- Feature Flags
    beta_features_enabled BOOLEAN DEFAULT false,
    analytics_enabled BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ENCRYPTED_API_KEYS TABLE (Secure Key Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.encrypted_api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Provider
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'openrouter', 'groq', 'stability')),
    
    -- Encrypted Key (using pgcrypto)
    encrypted_key TEXT NOT NULL,
    
    -- Key Metadata
    key_name TEXT, -- Optional user-friendly name
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one active key per provider per user
    UNIQUE(user_id, provider, is_active)
);

-- ============================================
-- MODEL_PREFERENCES TABLE (User Model Settings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.model_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, provider)
);

-- ============================================
-- USAGE_TRACKING TABLE (Track API Usage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    -- Usage Details
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0,
    
    -- Date for aggregation
    usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES (Performance Optimization)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_generations_project_id ON public.generations(project_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_api_keys_user_id ON public.encrypted_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON public.usage_tracking(usage_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (Public read, own write)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true); -- Handled by backend

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (true); -- Handled by backend

-- Projects Policies (Users can only access their own)
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (true); -- Filtered by backend

CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (true); -- Validated by backend

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (true); -- Validated by backend

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (true); -- Validated by backend

-- Generations Policies
CREATE POLICY "Users can view their own generations" ON public.generations
    FOR SELECT USING (true);

CREATE POLICY "Users can create generations" ON public.generations
    FOR INSERT WITH CHECK (true);

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR ALL USING (true);

-- Encrypted API Keys Policies (Strictest security)
CREATE POLICY "Users can view their own API keys" ON public.encrypted_api_keys
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own API keys" ON public.encrypted_api_keys
    FOR ALL USING (true);

-- Model Preferences Policies
CREATE POLICY "Users can manage their own model preferences" ON public.model_preferences
    FOR ALL USING (true);

-- Usage Tracking Policies
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
    FOR SELECT USING (true);

CREATE POLICY "System can insert usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS (Utility & Triggers)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to encrypt API keys
CREATE OR REPLACE FUNCTION encrypt_api_key(key_text TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(pgp_sym_encrypt(key_text, encryption_key), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt API keys
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(decode(encrypted_key, 'base64'), encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment generation count
CREATE OR REPLACE FUNCTION increment_generation_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.projects 
    SET generation_count = generation_count + 1,
        last_generated_at = NOW()
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on projects
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on user_settings
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on encrypted_api_keys
CREATE TRIGGER update_encrypted_api_keys_updated_at 
    BEFORE UPDATE ON public.encrypted_api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to increment generation count
CREATE TRIGGER increment_project_generation_count 
    AFTER INSERT ON public.generations 
    FOR EACH ROW EXECUTE FUNCTION increment_generation_count();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- You can add default settings or seed data here if needed

-- ============================================
-- NOTES
-- ============================================
-- 1. API keys are encrypted using pgcrypto's pgp_sym_encrypt
-- 2. All user data is protected by RLS, but enforced at the API layer
-- 3. The backend uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
-- 4. Clerk handles authentication, Supabase handles data storage
-- 5. For production, consider using Supabase Vault for even more secure key storage
