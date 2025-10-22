import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/user/projects
 * Retrieves all projects for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      include: {
        promptMetadata: true,
        mcpConfigs: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.projectDesc,
        metadata: project.promptMetadata,
        mcpConfigsCount: project.mcpConfigs.length,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        deployedAt: project.deployedAt,
      }))
    });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
