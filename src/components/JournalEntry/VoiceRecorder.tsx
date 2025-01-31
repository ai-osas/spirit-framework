// src/components/JournalEntry/VoiceRecorder.tsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, X } from 'lucide-react';

interface Props {
  onRecordingComplete: (url: string) => void;
}

export function VoiceRecorder({ onRecordingComplete }: Props) {
  const [isInit, setIsInit] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        onRecordingComplete(URL.createObjectURL(blob));
        chunks.current = [];
      };

      recorder.start();
      setIsInit(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsInit(false);
  };

  return (
    <>
      <button 
        className={`p-2 rounded-md ${isInit ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
        onClick={isInit ? stopRecording : startRecording}
      >
        <Mic className="w-4 h-4" />
      </button>

      {isInit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm">Recording...</span>
          <button onClick={stopRecording}>
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </>
  );
}