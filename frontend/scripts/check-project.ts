
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProject(projectId: string) {
    console.log(`Checking project: ${projectId}`);

    const { data, error } = await supabase
        .from('projects')
        .select('id, user_id, name')
        .eq('id', projectId)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Project found:');
        console.log(`ID: ${data.id}`);
        console.log(`User ID: ${data.user_id}`);
        console.log(`Name: ${data.name}`);
    }
}

const projectId = process.argv[2];
if (!projectId) {
    console.log('Please provide a project ID');
} else {
    checkProject(projectId);
}
