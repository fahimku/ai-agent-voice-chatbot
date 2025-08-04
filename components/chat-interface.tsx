"use client";

import { useCallback, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useChat } from "@/hooks/use-chat";
import { useAudio } from "@/hooks/use-audio";
import { useSpeechRecognitionWithDebounce } from "@/hooks/use-speech-recognition";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { VoicePopup } from "@/components/voice-popup";

export function ChatInterface() {
  const hasMounted = useMounted();
  const { messages, isLoading, sendMessage } = useChat();
  const { playAudio, stopAudio, isPlaying, isProcessing } = useAudio();
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);

  // Handle voice messages (from voice popup) - respond with audio only
  const handleVoiceMessage = useCallback(
    async (text: string) => {
      // Stop any currently playing audio before processing new message
      stopAudio();
      
      const botMessage = await sendMessage(text);
      if (botMessage) {
        await playAudio(botMessage.content);
      }
      // Don't close voice popup - let user close it manually
    },
    [sendMessage, playAudio, stopAudio],
  );

  // Handle text messages (from text input) - respond with text only
  const handleTextMessage = useCallback(
    async (text: string) => {
      const botMessage = await sendMessage(text);
      // No audio response for text messages
    },
    [sendMessage],
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  } = useSpeechRecognitionWithDebounce({
    onTranscriptComplete: handleVoiceMessage,
  });

  const handleMicClick = () => {
    setIsVoicePopupOpen(true);
  };

  const handleVoicePopupClose = () => {
    setIsVoicePopupOpen(false);
    if (listening) {
      stopListening();
    }
    resetTranscript();
    // Stop any playing audio when popup closes
    stopAudio();
  };

  const handleVoicePopupMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleInputSubmit = async (message: string) => {
    resetTranscript();
    await handleTextMessage(message);
  };

  const handleVoicePopupSubmit = async (message: string) => {
    resetTranscript();
    await handleVoiceMessage(message);
  };

  if (!hasMounted) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex flex-col h-dvh bg-white font-sans">
        <ChatHeader />
        <main className="flex-1 overflow-y-auto pt-20 pb-28">
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md mx-4 text-center">
              <div className="p-8 flex flex-col items-center gap-4 text-zinc-500">
                <p className="text-red-500">
                  Sorry, your browser does not support speech recognition.
                </p>
              </div>
            </div>
          </div>
        </main>
        <ChatInput
          onSubmit={handleInputSubmit}
          isLoading={isLoading}
          browserSupportsSpeechRecognition={false}
          onMicClick={handleMicClick}
          isPlaying={isPlaying}
          onStopAudio={stopAudio}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-white font-sans">
      <ChatHeader />

      <main className="flex-1 overflow-y-auto pt-20 pb-28">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </main>

      <ChatInput
        onSubmit={handleInputSubmit}
        isLoading={isLoading}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        onMicClick={handleMicClick}
        isPlaying={isPlaying}
        onStopAudio={stopAudio}
      />

      <VoicePopup
        isOpen={isVoicePopupOpen}
        onClose={handleVoicePopupClose}
        onSubmit={handleVoicePopupSubmit}
        transcript={transcript}
        listening={listening}
        isLoading={isLoading}
        isAudioProcessing={isProcessing}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        onMicClick={handleVoicePopupMicClick}
        onStopAudio={stopAudio}
      />
    </div>
  );
}
