import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { initGoogleCalendar } from "@/app/utils/googleCalendar";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Your WhatsApp number with country code, e.g., "33612345678" for France
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get today's calendar events
    const calendar = await initGoogleCalendar();
    let todaysEvents = [];
    
    if (calendar) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: today.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      todaysEvents = response.data.items || [];
    }

    // Generate motivational message
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a motivational coach. Create a short, powerful motivational message (max 100 words) that inspires action and positive thinking."
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const motivationalText = completion.choices[0].message.content;

    // Generate audio from the text
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: motivationalText,
    });

    // Get the audio as a Buffer
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    // Format events for the message
    const eventsText = todaysEvents.length > 0 
      ? "\n\nToday's Events:\n" + todaysEvents
          .map(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            return `• ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.summary}`;
          })
          .join("\n")
      : "\n\nNo events scheduled for today.";

    // Create WhatsApp message link with your number
    const whatsappText = encodeURIComponent(motivationalText + eventsText);
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

    return NextResponse.json({
      text: motivationalText + eventsText,
      audio: audioBuffer.toString('base64'),
      whatsappLink
    });
  } catch (error) {
    console.error("Failed to generate motivation:", error);
    return NextResponse.json(
      { error: "Failed to generate motivation" },
      { status: 500 }
    );
  }
} 