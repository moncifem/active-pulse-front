import { Credentials } from "google-auth-library";
import { cookies } from 'next/headers';

const TOKEN_PREFIX = "calendar_token:";

export async function storeTokens(userId: string, tokens: Credentials) {
  try {
    // Get the cookies instance
    const cookieStore = await cookies();
    
    // Store tokens in a secure HTTP-only cookie
    await cookieStore.set(`${TOKEN_PREFIX}${userId}`, JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  } catch (error) {
    console.error("Failed to store tokens:", error);
    throw error;
  }
}

export async function getStoredTokens(userId: string): Promise<Credentials | null> {
  try {
    // Get the cookies instance
    const cookieStore = await cookies();
    const tokenStr = await cookieStore.get(`${TOKEN_PREFIX}${userId}`)?.value;
    
    if (!tokenStr) {
      return null;
    }

    return JSON.parse(tokenStr);
  } catch (error) {
    console.error("Failed to get tokens:", error);
    return null;
  }
}

export async function removeTokens(userId: string) {
  try {
    // Get the cookies instance
    const cookieStore = await cookies();
    
    // Remove the cookie by setting it to expire immediately
    await cookieStore.set(`${TOKEN_PREFIX}${userId}`, "", {
      expires: new Date(0),
      path: "/"
    });
  } catch (error) {
    console.error("Failed to remove tokens:", error);
    throw error;
  }
}