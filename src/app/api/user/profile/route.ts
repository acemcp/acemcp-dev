import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/user/profile
 * Fetches the authenticated user's profile
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

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            projects: true,
            conversations: true,
            mcpConfigs: true,
          }
        }
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Updates the authenticated user's profile
 */
export async function PUT(req: Request) {
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
    const { name, image } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        ...(image && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        ...(image && { avatar_url: image }),
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedUser,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/profile
 * Deletes the authenticated user's account
 */
export async function DELETE(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
