
import React from 'react';
import { formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { Attachment, CommentAttachment } from '@/types';
import { Button } from '@/components/ui/button';

interface AttachmentListProps {
  attachments: (Attachment | CommentAttachment)[];
  onDelete?: (attachmentId: string) => void;
  className?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ 
  attachments, 
  onDelete,
  className = ''
}) => {
  const getFileIcon = (type: string, name: string) => {
    // Determine file type based on mime type or file extension
    if (type.startsWith('image/') || 
        name.endsWith('.jpg') || 
        name.endsWith('.jpeg') || 
        name.endsWith('.png') || 
        name.endsWith('.svg') || 
        name.endsWith('.webp')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    } else if (type.includes('zip') || type.includes('rar') || name.endsWith('.zip') || name.endsWith('.rar')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" />
          <path d="M12 5V3h-2" />
          <path d="M8 3h2" />
          <path d="M10 7h2V5" />
          <path d="M8 7h2" />
          <path d="M12 9V7h-2" />
          <path d="M8 9h2" />
          <path d="M10 11h2V9" />
          <path d="M8 11h2" />
          <rect width="8" height="8" x="14" y="14" rx="2" />
        </svg>
      );
    } else if (name.endsWith('.psd') || name.endsWith('.ai')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M8.5 17h-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1Z" />
          <path d="M8.5 12h-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1Z" />
          <path d="M16.5 17h-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1Z" />
          <path d="M16.5 12h-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1Z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = (url: string, fileName: string) => {
    // For local development with data URLs, we need to create a link
    // In production with real file URLs, this would simply navigate to the URL
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download started');
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium">Attachments ({attachments.length})</div>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div 
            key={attachment.id} 
            className="flex items-center justify-between p-2 border rounded-md bg-secondary/20 text-sm"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="text-muted-foreground">
                {getFileIcon(attachment.type, attachment.name)}
              </div>
              <div className="truncate">
                <div className="truncate font-medium">{attachment.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>•</span>
                  <span>{formatDistance(attachment.uploadedAt, new Date(), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => handleDownload(attachment.url, attachment.name)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              </Button>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive" 
                  onClick={() => onDelete(attachment.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
