import { Credentials } from "google-auth-library";
import { cookies } from 'next/headers';

const TOKEN_PREFIX = "calendar_token:";

export async function storeTokens(userId: string, tokens: Credentials) {
  try {
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
    const cookieStore = await cookies();
    const tokenCookie = await cookieStore.get(`${TOKEN_PREFIX}${userId}`);
    
    if (!tokenCookie?.value) {
      return null;
    }

    return JSON.parse(tokenCookie.value);
  } catch (error) {
    console.error("Failed to get tokens:", error);
    return null;
  }
}

export async function removeTokens(userId: string): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.delete(`${TOKEN_PREFIX}${userId}`);
}