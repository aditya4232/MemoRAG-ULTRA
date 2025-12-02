import { supabaseAdmin } from './supabase-server';

// Encryption key - In production, use a secure environment variable
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || 'your-super-secret-encryption-key-change-this-in-production';

/**
 * Store an encrypted API key for a user
 */
export async function storeEncryptedApiKey(
    userId: string,
    provider: 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'stability',
    apiKey: string,
    keyName?: string
) {
    try {
        // First, deactivate any existing active keys for this provider
        await supabaseAdmin
            .from('encrypted_api_keys')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('provider', provider)
            .eq('is_active', true);

        // Encrypt the key using Supabase function
        const { data: encryptedData, error: encryptError } = await supabaseAdmin
            .rpc('encrypt_api_key', {
                key_text: apiKey,
                encryption_key: ENCRYPTION_KEY
            });

        if (encryptError) throw encryptError;

        // Store the encrypted key
        const { data, error } = await supabaseAdmin
            .from('encrypted_api_keys')
            .insert({
                user_id: userId,
                provider,
                encrypted_key: encryptedData,
                key_name: keyName,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error storing encrypted API key:', error);
        return { success: false, error };
    }
}

/**
 * Retrieve and decrypt an API key for a user
 */
export async function getDecryptedApiKey(
    userId: string,
    provider: 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'stability'
) {
    try {
        // Get the active encrypted key
        const { data: keyData, error: fetchError } = await supabaseAdmin
            .from('encrypted_api_keys')
            .select('encrypted_key, id')
            .eq('user_id', userId)
            .eq('provider', provider)
            .eq('is_active', true)
            .single();

        if (fetchError || !keyData) {
            return { success: false, error: 'API key not found' };
        }

        // Decrypt the key
        const { data: decryptedKey, error: decryptError } = await supabaseAdmin
            .rpc('decrypt_api_key', {
                encrypted_key: keyData.encrypted_key,
                encryption_key: ENCRYPTION_KEY
            });

        if (decryptError) throw decryptError;

        // Update last_used_at
        await supabaseAdmin
            .from('encrypted_api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', keyData.id);

        return { success: true, apiKey: decryptedKey };
    } catch (error) {
        console.error('Error retrieving decrypted API key:', error);
        return { success: false, error };
    }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(
    userId: string,
    provider: 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'stability'
) {
    try {
        const { error } = await supabaseAdmin
            .from('encrypted_api_keys')
            .delete()
            .eq('user_id', userId)
            .eq('provider', provider);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting API key:', error);
        return { success: false, error };
    }
}

/**
 * List all providers with configured keys for a user
 */
export async function listConfiguredProviders(userId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('encrypted_api_keys')
            .select('provider, key_name, is_active, last_used_at, created_at')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
        return { success: true, providers: data };
    } catch (error) {
        console.error('Error listing configured providers:', error);
        return { success: false, error };
    }
}

/**
 * Store model preference
 */
export async function storeModelPreference(
    userId: string,
    provider: string,
    modelId: string,
    isCustom: boolean = false
) {
    try {
        const { data, error } = await supabaseAdmin
            .from('model_preferences')
            .upsert({
                user_id: userId,
                provider,
                model_id: modelId,
                is_custom: isCustom
            }, {
                onConflict: 'user_id,provider'
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error storing model preference:', error);
        return { success: false, error };
    }
}

/**
 * Get model preference
 */
export async function getModelPreference(userId: string, provider: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('model_preferences')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', provider)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return { success: true, preference: data };
    } catch (error) {
        console.error('Error getting model preference:', error);
        return { success: false, error };
    }
}

/**
 * Track API usage
 */
export async function trackUsage(
    userId: string,
    projectId: string | null,
    provider: string,
    model: string,
    tokensUsed: number,
    costUsd: number = 0
) {
    try {
        const { error } = await supabaseAdmin
            .from('usage_tracking')
            .insert({
                user_id: userId,
                project_id: projectId,
                provider,
                model,
                tokens_used: tokensUsed,
                cost_usd: costUsd
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error tracking usage:', error);
        return { success: false, error };
    }
}
