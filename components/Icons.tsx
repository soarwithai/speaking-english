import React from 'react';
import { Play, Mic, RefreshCw, BookOpen, GraduationCap, MessageCircle, Send } from 'lucide-react';

export const PlayIcon = ({ className }: { className?: string }) => <Play className={className} />;
export const MicIcon = ({ className }: { className?: string }) => <Mic className={className} />;
export const RefreshIcon = ({ className }: { className?: string }) => <RefreshCw className={className} />;
export const BookIcon = ({ className }: { className?: string }) => <BookOpen className={className} />;
export const CapIcon = ({ className }: { className?: string }) => <GraduationCap className={className} />;
export const ChatIcon = ({ className }: { className?: string }) => <MessageCircle className={className} />;
export const SendIcon = ({ className }: { className?: string }) => <Send className={className} />;