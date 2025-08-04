import { FormEvent, useEffect, useState, KeyboardEvent } from "react";
import { MicIcon, SendIcon, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  browserSupportsSpeechRecognition: boolean;
  onMicClick: () => void;
  isPlaying: boolean;
  onStopAudio: () => void;
}

export function ChatInput({
  onSubmit,
  isLoading,
  browserSupportsSpeechRecognition,
  onMicClick,
  isPlaying,
  onStopAudio,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        onSubmit(inputValue);
        setInputValue("");
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white">
      <div className="flex flex-col items-center pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-end w-full md:max-w-[640px] max-w-[calc(100dvw-32px)] bg-zinc-100 rounded-2xl px-4 py-3 my-2 border min-h-[44px] max-h-[200px]"
        >
          <textarea
            className="bg-transparent flex-grow outline-none text-zinc-800 placeholder-zinc-500 border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[20px] max-h-[120px] leading-5"
            placeholder="Send a message..."
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '20px',
              maxHeight: '120px'
            }}
          />
          <Button
            type="button"
            onClick={onMicClick}
            size="icon"
            variant="ghost"
            className="ml-2 size-9 rounded-full transition-all duration-200 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:scale-105"
            aria-label="Open Voice Chat"
            disabled={!browserSupportsSpeechRecognition}
          >
            <MicIcon size={18} />
          </Button>
          {isPlaying && (
            <Button
              type="button"
              onClick={onStopAudio}
              size="icon"
              variant="ghost"
              className="ml-2 size-9 rounded-full transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:scale-105"
              aria-label="Stop Audio"
            >
              <Square size={18} />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={`ml-2 size-9 rounded-full transition-all duration-200 ${
              inputValue.trim() && !isLoading
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
            disabled={isLoading || !inputValue.trim()}
          >
            <SendIcon size={18} />
          </Button>
        </form>
      </div>
    </footer>
  );
}

