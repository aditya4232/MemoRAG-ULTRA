import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    subscription_tier?: 'free' | 'pro' | 'enterprise';
    api_key?: string;
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    tech_stack: string[];
    status: 'planning' | 'in_progress' | 'completed' | 'deployed';
    created_at: string;
    updated_at: string;
    repository_url?: string;
    deployment_url?: string;
}

// User profile operations
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

export const createUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });
        if (!response.ok) throw new Error('Failed to create profile');
        return await response.json();
    } catch (error) {
        console.error('Error creating user profile:', error);
        return null;
    }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return await response.json();
    } catch (error) {
        console.error('Error updating user profile:', error);
        return null;
    }
};

// Project operations
export const getUserProjects = async (userId: string): Promise<Project[]> => {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};

export const createProject = async (project: Partial<Project>): Promise<Project | null> => {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project),
        });
        if (!response.ok) throw new Error('Failed to create project');
        return await response.json();
    } catch (error) {
        console.error('Error creating project:', error);
        return null;
    }
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | null> => {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update project');
        return await response.json();
    } catch (error) {
        console.error('Error updating project:', error);
        return null;
    }
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            // If 404, the project is already gone, so consider it a success
            if (response.status === 404) {
                console.log('Project already deleted (404)');
                return true;
            }

            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Delete project error:', errorData);
            throw new Error(errorData.details || errorData.error || 'Failed to delete project');
        }

        const data = await response.json();
        console.log('Project deleted successfully:', data);
        return true;
    } catch (error: any) {
        console.error('Error deleting project:', error);
        throw error; // Re-throw to let the caller handle it
    }
};
