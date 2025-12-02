import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.log('GET /api/projects/[id]: Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        console.log('GET /api/projects/[id]: Resolved params:', resolvedParams);
        const { id } = resolvedParams;
        console.log(`GET /api/projects/${id}: Fetching for user ${userId}`);

        // Fetch project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (projectError) {
            console.error(`GET /api/projects/${id}: Supabase error:`, projectError);
        }

        if (!project) {
            console.log(`GET /api/projects/${id}: Project not found`);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.user_id !== userId) {
            console.log(`GET /api/projects/${id}: Forbidden (Owner: ${project.user_id}, Requester: ${userId})`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch generations for chat history
        const { data: generations, error: generationsError } = await supabaseAdmin
            .from('generations')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: true });

        if (generationsError) {
            console.error('Error fetching generations:', generationsError);
        }

        return NextResponse.json({
            ...project,
            generations: generations || []
        });
    } catch (error) {
        console.error('Internal error in GET /api/projects/[id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const updates = await req.json();

        // Verify ownership
        const { data: existingProject, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (existingProject.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update project
        const { data: updatedProject, error: updateError } = await supabaseAdmin
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Internal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: existingProject, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (existingProject.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete project
        const { error: deleteError } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Internal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
