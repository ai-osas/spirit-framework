import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { type MediaPreview } from '@/types/journal';

interface Props {
  item: MediaPreview;
  onRemove: () => void;
}

export function MediaPreviewComponent({ item, onRemove }: Props) {
  return (
    <motion.div
      layout
      className="relative group"
    >
      {item.type === 'image' ? (
        <div className="w-32 h-32 rounded-lg overflow-hidden">
          <Image 
            src={item.url} 
            alt="" 
            layout="fill"
            objectFit="cover"
          />
        </div>
      ) : (
        <div className="w-48 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
          <audio src={item.url} controls className="w-full px-4" />
        </div>
      )}
      <button 
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white rounded-full shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </motion.div>
  );
}