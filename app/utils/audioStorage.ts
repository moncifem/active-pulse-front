import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

export async function saveAudio(audioBase64: string, userId: string): Promise<string> {
  try {
    // Create audio directory if it doesn't exist
    if (!existsSync(AUDIO_DIR)) {
      await mkdir(AUDIO_DIR, { recursive: true });
    }

    // Create a unique filename
    const filename = `motivation-${userId}-${Date.now()}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Save the file
    await writeFile(filepath, audioBuffer);

    // Return the public URL
    return `/audio/${filename}`;
  } catch (error) {
    console.error('Failed to save audio:', error);
    throw error;
  }
} 