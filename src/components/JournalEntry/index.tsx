// src/components/JournalEntry/index.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  ChevronLeft,
  Clock,
  Camera,
  Paperclip,
  Search,
  Loader2,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { type MediaPreview} from '@/types/journal';
import { MediaPreviewComponent } from './MediaPreview';
import { VoiceRecorder } from './VoiceRecorder';
import { useRouter } from 'next/navigation';
import { createEntry, getEntries, getEntry, updateEntry } from '@/lib/journal';

interface JournalEntryProps {
  id?: string;
}
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  media?: Array<{
    id: string;
    file_type: 'image' | 'audio';
    file_url: string;
  }>;
}

export default function JournalEntry({ id }: JournalEntryProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Load existing entry if editing
  useEffect(() => {
    if (id) {
      const loadEntry = async () => {
        try {
          const data = await getEntry(id);
          setTitle(data.title);
          setContent(data.content);
          if (data.media?.length) {
            setMedia(data.media.map((m: { id: string; file_type: 'image' | 'audio'; file_url: string }) => ({
              id: m.id,
              type: m.file_type,
              url: m.file_url,
              name: m.file_type === 'image' ? 'Image' : 'Audio'
            })));
          }
        } catch (error) {
          console.error('Failed to load entry:', error);
          router.push('/journal');
        } finally {
          setIsLoading(false);
        }
      };
      loadEntry();
    }
  }, [id, router]);

  // Fetch entries for sidebar
  useEffect(() => {
    let mounted = true;
    
    const loadEntries = async () => {
      try {
        const data = await getEntries();
        if (mounted) {
          setEntries(data);
        }
      } catch (error) {
        console.error('Failed to load entries:', error);
      }
    };

    loadEntries();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle entry saving
  // Handle entry saving
const saveEntry = async () => {
  if (!title || !content) {
    setSaveError('Please add a title and content before saving');
    return;
  }

  try {
    setIsSaving(true);
    setSaveError(null);

    const files = await Promise.all(
      media
        .filter(m => m.type === 'image' && !m.url.includes('http'))
        .map(async m => {
          const response = await fetch(m.url);
          const blob = await response.blob();
          return new File([blob], m.name, { type: 'image/jpeg' });
        })
    );

    if (id) {
      await updateEntry(id, {
        title,
        content,
        media: files
      });
    } else {
      const newEntry = await createEntry({
        title,
        content,
        media: files
      });
      // Update the entries list with the new entry
      setEntries(prevEntries => [{
        id: newEntry.id,
        title: newEntry.title,
        content: newEntry.content,
        created_at: newEntry.created_at,
        ...newEntry // include any other properties
      }, ...prevEntries]);
    }

    router.push('/journal/new');
  } catch (error) {
    console.error('Failed to save entry:', error);
    setSaveError('Failed to save entry. Please try again.');
  } finally {
    setIsSaving(false);
  }
};

  // Enhanced dropzone config
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'audio/*': ['.mp3', '.m4a']
    },
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      const newMedia = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        type: file.type.startsWith('image/') ? 'image' as const : 'audio' as const,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setMedia([...media, ...newMedia]);
    }
  });

  // Filtered entries based on search
  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Journal</h2>
            {id ? (
              <button 
                onClick={saveEntry}
                disabled={isSaving}
                className="text-blue-500 disabled:opacity-50 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            ) : (
              location.pathname === '/journal/new' ? (
                <button 
                  onClick={saveEntry}
                  disabled={isSaving}
                  className="text-blue-500 disabled:opacity-50 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/journal/new')}
                  className="text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
                >
                  New Entry
                </button>
              )
            )}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* New Entry button at top of list */}
          <button 
            onClick={() => router.push('/journal/new')}
            className="w-full p-4 text-left hover:bg-gray-50 border-b text-blue-500 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Entry
          </button>

          {filteredEntries.map(entry => (
            <button 
              key={entry.id}
              onClick={() => router.push(`/journal/${entry.id}`)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b ${
                entry.id === id ? 'bg-blue-50' : ''
              }`}
            >
              <h3 className="font-medium truncate">{entry.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" {...getRootProps()}>
        {/* Header */}
        <div className="h-14 px-6 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/journal')}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last edited just now</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="px-8 pt-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {saveError}
            </motion.div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-6">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-medium mb-6 bg-transparent focus:outline-none placeholder-gray-300"
            />
            
            {/* Media Grid */}
            <AnimatePresence>
              {media.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  {media.map((item) => (
                    <MediaPreviewComponent
                      key={item.id}
                      item={item}
                      onRemove={() => {
                        setMedia(media.filter(m => m.id !== item.id));
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              ref={contentRef}
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 resize-none bg-transparent focus:outline-none text-lg placeholder-gray-300 min-h-[calc(100vh-300px)]"
            />
          </div>
        </div>

        {/* Floating Tools */}
        <motion.div
          className="fixed bottom-6 right-6 bg-white rounded-full shadow-lg flex items-center gap-2 p-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={open}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Camera className="w-5 h-5" />
          </button>
          <VoiceRecorder
            onRecordingComplete={(url) => {
              setMedia([...media, {
                id: Date.now().toString(),
                type: 'audio',
                url,
                name: 'Voice Note'
              }]);
            }}
          />
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Paperclip className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Drop Overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 flex items-center justify-center z-50"
          >
            <motion.div
              className="bg-blue-50 rounded-lg p-12 border-2 border-blue-200 border-dashed"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <p className="text-blue-600 text-lg font-medium">Drop media here</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input {...getInputProps()} />
    </div>
  );
}