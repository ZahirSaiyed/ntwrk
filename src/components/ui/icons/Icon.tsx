import React from 'react';
import { LucideProps } from 'lucide-react';
import { Star, User, Settings, Bell, Search, Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Minus, Check, AlertCircle, Info, Trash2, Edit2, Copy, Share2, Download, Upload, Eye, EyeOff, Lock, Unlock, Heart, MessageSquare, Send, Home, Calendar, Clock, Tag, Filter, Grid, List, MoreVertical, MoreHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Maximize2, Minimize2, RefreshCw, RotateCw, RotateCcw, ZoomIn, ZoomOut, ExternalLink, Link, Unlink, Code, Image, Video, Music, File, Folder, Database, Server, Cloud, Wifi, Battery, Power, Volume2, VolumeX, Mic, MicOff, Camera, VideoOff, Phone, PhoneOff, Mail, Inbox, Paperclip, Bookmark, BookOpen, Book, FileText, FileCode, FileImage, FileVideo, FileAudio, FileCog, Play, Zap, Laptop, Users, LineChart, Activity, Briefcase } from 'lucide-react';

type LucideIcon = React.ComponentType<LucideProps>;

const iconMap: Record<string, LucideIcon> = {
  Star, User, Settings, Bell, Search, Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Minus, Check, AlertCircle, Info, Trash2, Edit2, Copy, Share2, Download, Upload, Eye, EyeOff, Lock, Unlock, Heart, MessageSquare, Send, Home, Calendar, Clock, Tag, Filter, Grid, List, MoreVertical, MoreHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Maximize2, Minimize2, RefreshCw, RotateCw, RotateCcw, ZoomIn, ZoomOut, ExternalLink, Link, Unlink, Code, Image, Video, Music, File, Folder, Database, Server, Cloud, Wifi, Battery, Power, Volume2, VolumeX, Mic, MicOff, Camera, VideoOff, Phone, PhoneOff, Mail, Inbox, Paperclip, Bookmark, BookOpen, Book, FileText, FileCode, FileImage, FileVideo, FileAudio, FileCog, Play, Zap, Laptop, Users, LineChart, Activity, Briefcase
};

export type IconName = keyof typeof iconMap;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  size?: number | string;
  className?: string;
  label?: string;
  color?: string;
}

/**
 * Icon component that renders SVG icons from Lucide React
 * 
 * Usage:
 * ```tsx
 * <Icon name="Star" size={24} color="#1E1E3F" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  className = '',
  label,
  ...rest
}) => {
  const LucideIcon = iconMap[name];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" does not exist in the icon map`);
    return null;
  }

  const ariaLabel = label || `${name} icon`;

  return (
    <LucideIcon
      size={size}
      color={color}
      className={className}
      aria-label={ariaLabel}
      {...rest}
    />
  );
};

export default Icon; 