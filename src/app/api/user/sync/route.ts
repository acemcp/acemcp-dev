import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/user/sync
 * Syncs Supabase authenticated user to Prisma database
 * Creates User and Account records if they don't exist
 */
export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already exists
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { accounts: true }
    });

    if (prismaUser) {
      // Update existing user
      prismaUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          image: user.user_metadata?.avatar_url || null,
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        },
        include: { accounts: true }
      });
    } else {
      // Create new user with Supabase ID
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          image: user.user_metadata?.avatar_url || null,
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        },
        include: { accounts: true }
      });
    }

    // Handle OAuth account linking
    if (user.app_metadata?.provider && user.app_metadata?.provider !== 'email') {
      const provider = user.app_metadata.provider;
      const providerAccountId = user.id; // Supabase uses user.id as provider account id
      
      // Check if account already exists
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: provider,
            providerAccountId: providerAccountId
          }
        }
      });

      // Create account if doesn't exist
      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: provider,
            providerAccountId: providerAccountId,
            access_token: null, // Supabase manages tokens
            refresh_token: null,
            expires_at: null,
            token_type: 'Bearer',
            scope: null,
            id_token: null,
            session_state: null,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name,
        image: prismaUser.image,
      }
    });

  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
