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
        { error: "Calendar not connected" },
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

      const events = response.data.items?.filter((event) =>
        Boolean(event.start?.dateTime)
      ) || [];

      return NextResponse.json({ events });
    } catch (calendarError: any) {
      console.error("Calendar API error details:", {
        message: calendarError.message,
        code: calendarError.code,
        status: calendarError.status,
        errors: calendarError.errors
      });

      // Handle specific error cases
      if (calendarError.code === 403) {
        if (calendarError.message?.includes('API has not been used')) {
          return NextResponse.json(
            { error: "Calendar API not enabled. Please contact administrator." },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { error: "Calendar access denied" },
          { status: 403 }
        );
      }

      if (calendarError.code === 401) {
        return NextResponse.json(
          { error: "Calendar authentication failed" },
          { status: 401 }
        );
      }

      throw calendarError;
    }
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}