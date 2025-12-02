import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // AUTO-DELETE: Delete projects older than 15 days
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const { error: deleteError } = await supabaseAdmin
            .from('projects')
            .delete()
            .lt('created_at', fifteenDaysAgo.toISOString())
            .eq('user_id', userId); // Only delete user's own old projects for safety

        if (deleteError) {
            console.error('Error cleaning up old projects:', deleteError);
            // Continue execution, don't block fetching
        }

        const { data: projects, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching projects:', error);
            return NextResponse.json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json(projects || []);
    } catch (error: any) {
        console.error('Internal error in GET /api/projects:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // LIMIT CHECK: Max 5 projects
        const { count, error: countError } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            console.error('Error checking project count:', countError);
            return NextResponse.json({ error: 'Failed to verify project limits' }, { status: 500 });
        }

        if (count !== null && count >= 5) {
            return NextResponse.json({
                error: 'Project limit reached. You can only have a maximum of 5 projects. Please delete an existing project to create a new one.'
            }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, tech_stack, status } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Ensure profile exists
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (!profile) {
            // Fetch user details from Clerk to create profile
            const { currentUser } = await import('@clerk/nextjs/server');
            const user = await currentUser();

            if (user) {
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .insert([
                        {
                            id: userId,
                            email: user.emailAddresses[0]?.emailAddress,
                            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                            avatar_url: user.imageUrl
                        }
                    ]);

                if (profileError) {
                    console.error('Error creating user profile:', profileError);
                    return NextResponse.json({
                        error: 'Failed to create user profile',
                        details: profileError.message
                    }, { status: 500 });
                }
            }
        }

        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .insert([
                {
                    user_id: userId,
                    name,
                    description,
                    tech_stack: tech_stack || [],
                    status: status || 'planning'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating project:', error);
            return NextResponse.json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json(project);
    } catch (error: any) {
        console.error('Internal error in POST /api/projects:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
