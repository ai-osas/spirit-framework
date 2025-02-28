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
  PlusCircle,
  Trash2
} from 'lucide-react';
import { type MediaPreview} from '@/types/journal';
import { MediaPreviewComponent } from './MediaPreview';
import { VoiceRecorder } from './VoiceRecorder';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/hooks/useWallet';
import { type JournalEntry } from '@shared/schema';
import { Editor } from './Editor';
import { calculateEntryReward, distributeReward } from '@/lib/rewardService';
import { toast } from '../../hooks/use-toast'; // Fixed import path


interface JournalEntryProps {
  id?: string;
}

export default function JournalEntry({ id }: JournalEntryProps) {
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { account } = useWallet();

  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/entries'],
    enabled: !!account
  });

  const { data: entry } = useQuery<JournalEntry>({
    queryKey: ['/api/journal/entries', id],
    enabled: !!id
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/journal/entries', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      navigate('/journal');
    }
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/journal/entries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      navigate('/journal');
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/journal/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      navigate('/journal');
    }
  });

  // Load existing entry if editing
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      if (entry.media?.length) {
        setMedia(entry.media.map(m => ({
          id: m.id,
          type: m.file_type,
          url: m.file_url,
          name: m.file_type === 'image' ? 'Image' : 'Audio'
        })));
      }
      setIsLoading(false);
    }
  }, [entry]);

  const saveEntry = async () => {
    if (!title || !content) {
      setSaveError('Please add a title and content before saving');
      return;
    }

    // Double check wallet connection
    if (!account && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          setSaveError('Please connect your wallet before saving');
          return;
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
        setSaveError('Please connect your wallet before saving');
        return;
      }
    }

    if (!account) {
      setSaveError('Please connect your wallet before saving');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const entryData = {
        title,
        content,
        wallet_address: account,
        media: media.map(m => ({
          id: m.id,
          file_type: m.type,
          file_url: m.url
        }))
      };

      if (id) {
        await updateEntryMutation.mutateAsync({ id, data: entryData });
      } else {
        // First save the entry
        await createEntryMutation.mutateAsync(entryData);

        // Calculate and distribute reward for new entries
        try {
          // Get the latest entry before this one
          const previousEntry = entries[entries.length - 1];
          const rewardAmount = await calculateEntryReward(entryData, previousEntry);

          // Only attempt distribution if there's a reward to give
          if (rewardAmount > 0n) {
            const success = await distributeReward(account, rewardAmount);

            if (success) {
              toast({
                title: "Reward Earned!",
                description: `You've earned SPIRIT tokens for your journal entry! Rewards increase with longer entries, media attachments, and daily entries.`,
              });

              queryClient.invalidateQueries({ queryKey: ['token-balance'] });
            } else {
              toast({
                variant: "destructive",
                title: "Reward Distribution Not Available",
                description: "Token distribution has not been approved by admin yet. Your reward will be available once approved.",
              });
            }
          } else {
            toast({
              title: "No Reward Earned",
              description: "Journal entries need to be at least 200 characters long to earn rewards. Add media or maintain daily entries for bonus rewards!",
            });
          }
        } catch (rewardError: any) {
          console.error('Failed to distribute reward:', rewardError);
          // Show error toast but don't block the save operation
          toast({
            variant: "destructive",
            title: "Reward Distribution Failed",
            description: rewardError.message || "Failed to distribute SPIRIT tokens. Please try again later.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      setSaveError('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
            <button 
              onClick={saveEntry}
              disabled={isSaving}
              className="text-blue-500 disabled:opacity-50 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {id ? 'Save Changes' : 'Save'}
            </button>
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
          <button 
            onClick={() => {
              setTitle('');
              setContent('');
              setMedia([]);
              setSaveError(null);
              navigate('/journal/new');
            }}
            className="w-full p-4 text-left hover:bg-gray-50 border-b text-blue-500 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Entry
          </button>

          {filteredEntries.map(entry => (
            <div 
              key={entry.id}
              className="flex items-center hover:bg-gray-50 border-b"
            >
              <button 
                onClick={() => navigate(`/journal/${entry.id}`)}
                className={`flex-1 p-4 text-left ${
                  entry.id === Number(id) ? 'bg-blue-50' : ''
                }`}
              >
                <h3 className="font-medium truncate">{entry.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this entry?')) {
                    await deleteEntryMutation.mutateAsync(entry.id.toString());
                  }
                }}
                className="p-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" {...getRootProps()}>
        {/* Header */}
        <div className="h-14 px-6 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/journal')}
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
        <AnimatePresence>
          {saveError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-8 pt-4"
            >
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {saveError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!account && (
          <div className="px-8 pt-4">
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Please connect your wallet to save journal entries
            </div>
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

            <Editor
              content={content}
              onChange={setContent}
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