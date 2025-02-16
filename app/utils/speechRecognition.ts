'use client';

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Simple audio transcription using the Web Speech API as a fallback
class WebSpeechTranscriber {
  private static recognition: SpeechRecognitionInstance | null = null;
  public static isRecognizing = false;

  static initialize() {
    if (!WebSpeechTranscriber.recognition && typeof window !== 'undefined') {
      // @ts-expect-error - Web Speech API types not available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        WebSpeechTranscriber.recognition = recognition;
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

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export function startTranscription(onTranscribe: TranscriptionCallback): Promise<void> {
  return new Promise((resolve, reject) => {
    const recognition = WebSpeechTranscriber.initialize();
    if (!recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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