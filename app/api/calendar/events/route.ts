import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { initGoogleCalendar } from "@/app/utils/googleCalendar";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const calendar = await initGoogleCalendar();
    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not connected or needs reauthorization. Please reconnect your calendar." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: start,
        timeMax: end,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 100,
      });

      return NextResponse.json({ 
        events: response.data.items || [],
        success: true
      });

    } catch (calendarError: unknown) {
      console.error("Calendar API error:", calendarError);
      
      // Check if user needs to reconnect their calendar
      if ((calendarError as any).code === 401) {
        return NextResponse.json(
          { error: "Calendar authentication expired. Please reconnect." },
          { status: 401 }
        );
      }

      throw calendarError; // Let outer catch handle other errors
    }

  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}