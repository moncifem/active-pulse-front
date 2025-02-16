import { NextResponse } from "next/server";
import twilio from "twilio";
import { auth } from "@clerk/nextjs/server";
import { saveAudio } from "@/app/utils/audioStorage";

// Initialize Twilio client only if credentials are available
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Get environment variables with fallbacks
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if WhatsApp functionality is configured
    if (!client || !TWILIO_WHATSAPP_NUMBER || !MY_WHATSAPP_NUMBER || !APP_URL) {
      console.warn('WhatsApp messaging is not configured');
      return NextResponse.json({ 
        success: false,
        warning: "WhatsApp messaging is not configured",
      });
    }

    const { text, audio } = await req.json();

    // Send the motivational text
    await client.messages.create({
      body: text,
      from: TWILIO_WHATSAPP_NUMBER,
      to: MY_WHATSAPP_NUMBER,
    });

    // Send the audio if available
    if (audio) {
      try {
        const audioPath = await saveAudio(audio, userId);
        const audioUrl = `${APP_URL}${audioPath}`;

        await client.messages.create({
          body: "🎤 Your motivational message (voice)",
          mediaUrl: [audioUrl],
          from: TWILIO_WHATSAPP_NUMBER,
          to: MY_WHATSAPP_NUMBER,
        });
      } catch (audioError) {
        console.error('Failed to send audio:', audioError);
        // Continue even if audio fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
} 