'use client';

// Simple audio transcription using the Web Speech API as a fallback
class WebSpeechTranscriber {
  private static recognition: any = null;
  private static isRecognizing: boolean = false;

  static initialize() {
    if (!WebSpeechTranscriber.recognition && typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        WebSpeechTranscriber.recognition = new SpeechRecognition();
        WebSpeechTranscriber.recognition.continuous = true;
        WebSpeechTranscriber.recognition.interimResults = true;
        WebSpeechTranscriber.recognition.lang = 'en-US';
      }
    }
    return WebSpeechTranscriber.recognition;
  }

  static stop() {
    if (WebSpeechTranscriber.recognition && WebSpeechTranscriber.isRecognizing) {
      WebSpeechTranscriber.recognition.stop();
      WebSpeechTranscriber.isRecognizing = false;
    }
  }
}

export type TranscriptionResult = {
  text: string;
  isFinal: boolean;
};

export type TranscriptionCallback = (result: TranscriptionResult) => void;

export function startTranscription(onTranscribe: TranscriptionCallback): Promise<void> {
  return new Promise((resolve, reject) => {
    const recognition = WebSpeechTranscriber.initialize();
    if (!recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Send interim results
      if (interimTranscript) {
        onTranscribe({
          text: interimTranscript,
          isFinal: false
        });
      }

      // Send final results
      if (finalTranscript) {
        onTranscribe({
          text: finalTranscript,
          isFinal: true
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      WebSpeechTranscriber.isRecognizing = false;
      reject(new Error('Failed to recognize speech'));
    };

    recognition.onend = () => {
      WebSpeechTranscriber.isRecognizing = false;
      resolve();
    };

    try {
      // Stop any existing recognition session
      WebSpeechTranscriber.stop();
      
      // Start new recognition session
      recognition.start();
      WebSpeechTranscriber.isRecognizing = true;
    } catch (error) {
      WebSpeechTranscriber.isRecognizing = false;
      reject(error);
    }
  });
}

export function stopTranscription() {
  WebSpeechTranscriber.stop();
} 