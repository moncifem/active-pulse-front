import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@clerk/nextjs/server";
import { storeTokens } from "@/app/utils/tokenStorage";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}${process.env.GOOGLE_CALLBACK_URL || '/google-callback'}`
);

interface TokenError extends Error {
  response?: {
    data?: unknown;
    status?: number;
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("OAuth Config:", {
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}${process.env.GOOGLE_CALLBACK_URL}`,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    });

    console.log("Callback params:", {
      hasCode: !!code,
      hasState: !!state,
      error: error || "none",
    });

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_APP_URL}/error?reason=oauth_error`)
      );
    }

    const { userId } = await auth();
    if (!userId || userId !== state) {
      console.error("Auth mismatch:", { userId, state });
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_APP_URL}/error?reason=auth_mismatch`)
      );
    }

    if (!code) {
      console.error("No code received");
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_APP_URL}/error?reason=no_code`)
      );
    }

    try {
      console.log("Attempting token exchange...");
      const { tokens } = await oauth2Client.getToken(code);
      
      if (!tokens) {
        throw new Error("No tokens received");
      }

      console.log("Token exchange successful");
      await storeTokens(userId, tokens);
      console.log("Tokens stored successfully");

      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_APP_URL}/configuration`)
      );
    } catch (tokenError: unknown) {
      const error = tokenError as TokenError;
      console.error("Token exchange error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  } catch (error) {
    console.error("Token exchange failed:", error);
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_APP_URL}/error?reason=token_exchange`)
    );
  }
} 