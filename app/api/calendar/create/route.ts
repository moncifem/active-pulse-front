import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { initGoogleCalendar } from "@/app/utils/googleCalendar";
import { add, parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, time, email, description } = await req.json();

    const calendar = await initGoogleCalendar();
    if (!calendar) {
      return NextResponse.json(
        { error: "Failed to initialize calendar" },
        { status: 500 }
      );
    }

    // Parse the date and time in CET timezone
    const dateTime = parse(`${date} ${time}`, 'dd/MM/yyyy HH:mm', new Date());
    const utcDateTime = zonedTimeToUtc(dateTime, 'Europe/Paris');

    const event = {
      summary: `Meeting with ${email}`,
      description,
      start: {
        dateTime: utcDateTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: add(utcDateTime, { minutes: 20 }).toISOString(),
        timeZone: "UTC",
      },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const meeting = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      conferenceDataVersion: 1,
      requestBody: event,
    });

    return NextResponse.json({ 
      success: true, 
      meetingId: meeting.data.id 
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
} 