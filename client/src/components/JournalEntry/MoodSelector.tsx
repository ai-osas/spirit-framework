import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Smile,
  Frown,
  Zap,
  AlertCircle,
  Meh,
  Target,
  XCircle
} from 'lucide-react';
import type { Mood } from '@shared/schema';

interface Props {
  onChange: (mood: Mood | null) => void;
  initialMood?: Mood | null;
}

const EMOTIONS = [
  { name: 'happy', icon: Smile, color: '#FFD700' },
  { name: 'sad', icon: Frown, color: '#4169E1' },
  { name: 'excited', icon: Zap, color: '#FF4500' },
  { name: 'anxious', icon: AlertCircle, color: '#9932CC' },
  { name: 'neutral', icon: Meh, color: '#808080' },
  { name: 'focused', icon: Target, color: '#228B22' },
  { name: 'frustrated', icon: XCircle, color: '#DC143C' }
] as const;

export function MoodSelector({ onChange, initialMood }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[number] | null>(
    initialMood ? EMOTIONS.find(e => e.name === initialMood.emotion) || null : null
  );
  const [intensity, setIntensity] = useState<number>(initialMood?.intensity || 3);

  const handleEmotionSelect = (emotion: typeof EMOTIONS[number]) => {
    setSelectedEmotion(emotion);
    if (emotion) {
      onChange({
        emotion: emotion.name,
        intensity,
        color: emotion.color,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleIntensityChange = (value: number[]) => {
    setIntensity(value[0]);
    if (selectedEmotion) {
      onChange({
        emotion: selectedEmotion.name,
        intensity: value[0],
        color: selectedEmotion.color,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
      <h3 className="text-sm font-medium text-gray-700">How are you feeling?</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {EMOTIONS.map((emotion) => {
          const Icon = emotion.icon;
          const isSelected = selectedEmotion?.name === emotion.name;
          
          return (
            <Button
              key={emotion.name}
              variant={isSelected ? "default" : "ghost"}
              className={`p-2 aspect-square ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
              style={{
                backgroundColor: isSelected ? emotion.color : undefined,
                color: isSelected ? 'white' : emotion.color,
              }}
              onClick={() => handleEmotionSelect(emotion)}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>

      {selectedEmotion && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Intensity</span>
            <span className="text-sm font-medium" style={{ color: selectedEmotion.color }}>
              {intensity}
            </span>
          </div>
          <Slider
            defaultValue={[intensity]}
            max={5}
            min={1}
            step={1}
            onValueChange={handleIntensityChange}
          />
        </div>
      )}
    </div>
  );
}
