import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { prompt, response, code, model, provider } = body;

        // Verify project ownership
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('user_id')
            .eq('id', id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Insert generation
        const { data: generation, error: generationError } = await supabaseAdmin
            .from('generations')
            .insert([
                {
                    project_id: id,
                    user_id: userId,
                    prompt,
                    response,
                    generated_files: { "index.html": { content: code, language: "html" } }, // Store code in generated_files
                    model_used: model || 'gpt-4o',
                    provider: provider || 'openai',
                    success: true
                }
            ])
            .select()
            .single();

        if (generationError) {
            console.error('Error saving generation:', generationError);
            return NextResponse.json({ error: generationError.message }, { status: 500 });
        }

        // Update project files with latest code
        const { error: updateError } = await supabaseAdmin
            .from('projects')
            .update({
                files: { "index.html": { content: code, language: "html" } },
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating project files:', updateError);
        }

        return NextResponse.json(generation);
    } catch (error) {
        console.error('Internal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
