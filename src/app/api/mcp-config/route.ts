import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/mcp-config
 * Saves MCP configuration for a project
 */
export async function POST(req: Request) {
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
    const { projectId, serverUrl, authHeader, authToken, configJson } = body;
    console.log("Received projectId:", projectId);

    if (!projectId || !serverUrl || !configJson) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 403 }
      );
    }

    // Create MCP config
    const mcpConfig = await prisma.mCPConfig.create({
      data: {
        serverUrl,
        authHeader: authHeader || null,
        authToken: authToken || null,
        configJson,
        userId: user.id,
        projectId,
      }
    });

    return NextResponse.json({
      success: true,
      mcpConfig: {
        id: mcpConfig.id,
        serverUrl: mcpConfig.serverUrl,
      }
    });

  } catch (error) {
    console.error("Error saving MCP config:", error);
    return NextResponse.json(
      { error: "Failed to save MCP configuration" },
      { status: 500 }
    );
  }
}
