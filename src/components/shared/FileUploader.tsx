
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Supported file types
const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed', // Added additional MIME type for zip files
  'application/octet-stream', // Some browsers may use this for zip/rar files
  'application/x-rar-compressed',
  'application/vnd.adobe.photoshop',
  'application/illustrator',
  'application/x-photoshop',
  'application/postscript',
];

const FILE_TYPE_EXTENSIONS = '.png,.jpg,.jpeg,.svg,.webp,.zip,.rar,.psd,.ai';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  label?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect,
  label = 'Add attachment'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const validateAndProcessFile = (file: File) => {
    // Get file extension from name
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Check if the file type is allowed by MIME type or file extension
    const isValidMimeType = ALLOWED_FILE_TYPES.includes(file.type);
    const isValidExtension = fileExtension && ['png', 'jpg', 'jpeg', 'svg', 'webp', 'zip', 'rar', 'psd', 'ai'].includes(fileExtension);
    
    console.log('File type:', file.type, 'Extension:', fileExtension);
    
    if (!isValidMimeType && !isValidExtension) {
      toast.error('Invalid file type. Please upload only png, jpg, svg, webp, zip, rar, psd, or ai files.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }
    
    // Pass the valid file to the parent component
    onFileSelect(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };
  
  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={FILE_TYPE_EXTENSIONS}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-muted-foreground"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 12v6" />
            <path d="m15 15-3-3-3 3" />
          </svg>
          <p className="text-sm text-muted-foreground">
            {label} or drag and drop
          </p>
          <p className="text-xs text-muted-foreground/70">
            PNG, JPG, SVG, WEBP, ZIP, RAR, PSD, AI (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};
