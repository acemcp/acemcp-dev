import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";


/**
 * GET /api/project/[id]
 * Retrieves project details with metadata
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params before accessing properties
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        promptMetadata: true,
        mcpConfigs: true,
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.projectDesc,
        history: project.projectHistory,
        metadata: project.promptMetadata,
        mcpConfigs: project.mcpConfigs,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        deployedAt: project.deployedAt,
      }
    });

  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/project/[id]
 * Updates project metadata
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, identity, instructions, tone } = body;

    // Await params before accessing properties
    const { id } = await params;

    // Verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (existingProject.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { projectDesc: description }),
        promptMetadata: {
          upsert: {
            create: {
              identity: identity || null,
              instructions: instructions || null,
              tone: tone || null,
            },
            update: {
              ...(identity !== undefined && { identity }),
              ...(instructions !== undefined && { instructions }),
              ...(tone !== undefined && { tone }),
            }
          }
        }
      },
      include: {
        promptMetadata: true
      }
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.projectDesc,
        metadata: project.promptMetadata,
      }
    });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
