import { useCallback, useRef, useState } from "react";

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentRequestRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const stopAudio = useCallback(() => {
    // Cancel any ongoing TTS request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }
    
    // Mark as cancelled to prevent playing audio from cancelled requests
    isCancelledRef.current = true;
    
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(
    async (text: string) => {
      try {
        // Cancel any previous request and stop current audio
        stopAudio();
        
        // Reset cancelled flag for new request
        isCancelledRef.current = false;
        
        // Create new abort controller for this request
        const abortController = new AbortController();
        currentRequestRef.current = abortController;

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: abortController.signal,
        });
        
        // Check if request was cancelled
        if (isCancelledRef.current) {
          return;
        }
        
        if (!response.ok) throw new Error("Failed to generate audio");

        const AudioContext =
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const audioData = await response.arrayBuffer();
        
        // Check again if request was cancelled after getting audio data
        if (isCancelledRef.current) {
          return;
        }
        
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        const source = audioContext.createBufferSource();
        currentSourceRef.current = source;

        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        setIsPlaying(true);

        source.onended = () => {
          setIsPlaying(false);
          currentSourceRef.current = null;
        };

        source.start(0);
      } catch (error) {
        // Don't log error if it was cancelled
        if (error.name !== 'AbortError') {
          console.error("Error playing audio:", error);
        }
        setIsPlaying(false);
        currentSourceRef.current = null;
      } finally {
        // Clear the request reference
        currentRequestRef.current = null;
      }
    },
    [stopAudio],
  );

  return { playAudio, stopAudio, isPlaying };
};
