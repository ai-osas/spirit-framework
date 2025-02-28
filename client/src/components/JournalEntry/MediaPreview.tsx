import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MediaPreview } from '@/types/journal';

interface MediaPreviewProps {
  item: MediaPreview;
  onRemove: () => void;
}

export function MediaPreviewComponent({ item, onRemove }: MediaPreviewProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative rounded-lg overflow-hidden bg-gray-100"
    >
      {item.type === 'image' ? (
        <img 
          src={item.url} 
          alt={item.name} 
          className="w-full h-48 object-cover"
        />
      ) : (
        <audio 
          src={item.url} 
          controls 
          className="w-full h-12 mt-4"
        />
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
