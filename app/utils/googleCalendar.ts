import { google } from "googleapis";
import { calendar_v3 } from "@googleapis/calendar";
import { getStoredTokens } from "./tokenStorage";
import { auth } from "@clerk/nextjs/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`
);

export const initGoogleCalendar = async (): Promise<calendar_v3.Calendar | undefined> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("No user ID found");
      return undefined;
    }

    const tokens = await getStoredTokens(userId);
    if (!tokens) {
      console.error("No tokens found for user");
      return undefined;
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    // Don't test the connection here as it might fail if API isn't enabled yet
    return calendar;
  } catch (error) {
    console.error("Error initializing Google Calendar API:", error);
    return undefined;
  }
}; 