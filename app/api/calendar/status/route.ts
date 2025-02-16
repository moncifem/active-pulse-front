import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStoredTokens } from "@/app/utils/tokenStorage";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ connected: false });
    }

    const tokens = await getStoredTokens(userId);
    return NextResponse.json({ connected: !!tokens });
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}