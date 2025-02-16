import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { initGoogleCalendar } from "@/app/utils/googleCalendar";
import { add, parse, format } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

const AVAILABLE_SLOTS = ["08:00", "08:20", "08:40", "09:00", "09:20", "09:40"];

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    
    if (!dateStr) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const calendar = await initGoogleCalendar();
    if (!calendar) {
      return NextResponse.json(
        { error: "Failed to initialize calendar" },
        { status: 500 }
      );
    }

    const date = parse(dateStr, 'yyyyMMdd', new Date());
    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: date.toISOString(),
      timeMax: add(date, { days: 1 }).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const availableSlots = AVAILABLE_SLOTS.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, minutes, 0, 0);
      
      const slotEnd = add(slotDate, { minutes: 20 });
      
      return !events.some(event => {
        const eventStart = new Date(event.start?.dateTime || '');
        const eventEnd = new Date(event.end?.dateTime || '');
        return slotDate < eventEnd && slotEnd > eventStart;
      });
    });

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
} 