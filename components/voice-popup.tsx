"use client";

import { useEffect, useState } from "react";
import { MicIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  transcript: string;
  listening: boolean;
  isLoading: boolean;
  browserSupportsSpeechRecognition: boolean;
  onMicClick: () => void;
}

export function VoicePopup({
  isOpen,
  onClose,
  onSubmit,
  transcript,
  listening,
  isLoading,
  browserSupportsSpeechRecognition,
  onMicClick,
}: VoicePopupProps) {
  // Auto-submit when listening stops and we have a transcript (only when popup is open)
  useEffect(() => {
    if (isOpen && !listening && transcript.trim() && !isLoading) {
      const message = transcript.trim();
      onSubmit(message);
      // Don't close the popup - let user close it manually
    }
  }, [isOpen, listening, transcript, isLoading, onSubmit]);

  // Auto-start listening after AI responds (only when popup is open)
  useEffect(() => {
    if (isOpen && !isLoading && !listening && browserSupportsSpeechRecognition) {
      // Small delay to ensure the audio response has finished
      const timer = setTimeout(() => {
        onMicClick();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, listening, browserSupportsSpeechRecognition, onMicClick]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleMicClick = () => {
    onMicClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Main Content */}
        <div className="p-6">
          {/* Large Microphone Button */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Button
                onClick={handleMicClick}
                disabled={!browserSupportsSpeechRecognition || isLoading}
                className={`w-32 h-32 rounded-full transition-all duration-300 ${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110 animate-pulse"
                    : isLoading
                      ? "bg-gray-400 text-white shadow-lg"
                      : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105"
                }`}
              >
                <MicIcon size={48} />
              </Button>
              
              {/* Animated rings when listening */}
              {listening && (
                <>
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-red-300 animate-ping" />
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-red-200 animate-ping" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-red-100 animate-ping" style={{ animationDelay: '1s' }} />
                </>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-xl font-medium text-gray-900">
                {isLoading 
                  ? "Thinking..." 
                  : listening 
                    ? "Listening..." 
                    : "Tap to speak"
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {isLoading
                  ? "I'm processing your question"
                  : listening 
                    ? "I'm listening to your question" 
                    : "Ask me anything with your voice"
                }
              </p>
            </div>

            {/* Transcript Display - Only show briefly */}
            {transcript && !listening && !isLoading && (
              <div className="w-full">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-700 text-sm font-medium">"{transcript}"</p>
                </div>
              </div>
            )}

            {/* Mic Enable/Disable Button */}
            {/* <div className="w-full">
              <Button
                onClick={handleMicClick}
                disabled={!browserSupportsSpeechRecognition || isLoading}
                variant="outline"
                className={`w-full py-3 ${
                  listening
                    ? "border-red-300 text-red-600 bg-red-50"
                    : "border-gray-300 text-gray-700 bg-white"
                }`}
              >
                <MicIcon size={20} className="mr-2" />
                {listening ? "Disable Mic" : "Enable Mic"}
              </Button>
            </div> */}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <XIcon size={24} className="mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 