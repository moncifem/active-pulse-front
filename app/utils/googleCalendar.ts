import { google } from "googleapis";
import { calendar_v3 } from "@googleapis/calendar";
import { getStoredTokens } from "./tokenStorage";
import { auth } from "@clerk/nextjs/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}${process.env.GOOGLE_CALLBACK_URL || '/google-callback'}`
);

export const initGoogleCalendar = async (): Promise<calendar_v3.Calendar | null> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("No user ID found");
      return null;
    }

    const tokens = await getStoredTokens(userId);
    if (!tokens || !tokens.refresh_token) {
      console.error("No valid tokens found for user");
      return null;
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    // Don't test the connection here as it might fail if API isn't enabled yet
    return calendar;
  } catch (error) {
    console.error("Error initializing Google Calendar API:", error);
    return null;
  }
}; 