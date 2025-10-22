import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

/**
 * POST /api/project/create
 * Creates a new project with initial prompt and metadata
 */
export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, prompt, identity, instructions, tone } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Ensure user exists in Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!prismaUser) {
      // Create user if doesn't exist
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          image: user.user_metadata?.avatar_url || null,
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        }
      });
    }

    // Create project with metadata
    const project = await prisma.project.create({
      data: {
        name,
        projectDesc: description || null,
        projectHistory: prompt ? { initialPrompt: prompt, createdAt: new Date().toISOString() } : Prisma.JsonNull,
        ownerId: user.id,
        promptMetadata: {
          create: {
            identity: identity || null,
            instructions: instructions || null,
            tone: tone || null,
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
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
