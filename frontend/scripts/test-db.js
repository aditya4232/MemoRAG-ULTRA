const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Simple .env parser
function loadEnv() {
    const envPath = path.resolve(__dirname, '../../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                if (key && value && !key.startsWith('#')) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Testing Supabase connection...');

    // 1. Test Profiles Table
    console.log('Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileError) {
        console.error('Error accessing profiles table:', profileError);
    } else {
        console.log('Profiles table accessible.');
    }

    // 2. Test Projects Table
    console.log('Checking projects table...');
    const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

    if (projectError) {
        console.error('Error accessing projects table:', projectError);
    } else {
        console.log('Projects table accessible.');
    }
}

test();
