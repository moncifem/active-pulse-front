import { ZyphraClient } from '@zyphra/client';

const client = new ZyphraClient({ apiKey: process.env.NEXT_PUBLIC_ZYPHRA_API_KEY });
const audioCache = new Map<string, Blob>();

export async function synthesizeSpeech(text: string, messageId: string): Promise<Blob> {
  if (!text?.trim()) {
    throw new Error('Text parameter is required and cannot be empty');
  }

  // Check cache first
  const cachedAudio = audioCache.get(messageId);
  if (cachedAudio) {
    return cachedAudio;
  }

  try {
    const audioBlob = await client.audio.speech.create({
      text: text.trim(),
      speaking_rate: 15,
      language_iso_code: 'en-us',
      mime_type: 'audio/mp3'
    });

    // Cache the result
    audioCache.set(messageId, audioBlob);
    
    // Limit cache size
    if (audioCache.size > 20) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }

    return audioBlob;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}

// Preload audio for a message
export function preloadAudio(text: string, messageId: string): void {
  if (!text?.trim() || !messageId) return;
  
  // Only preload if not already in cache and text is not too long
  if (!audioCache.has(messageId) && text.length < 1000) {
    synthesizeSpeech(text, messageId).catch(console.error);
  }
} 