import React, { useCallback } from 'react';
import { useDropzone, DropzoneState } from 'react-dropzone';
import { UploadIcon } from './icons';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
}

export const Dropzone: React.FC<DropZoneProps> = ({ onFilesAdded, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive }: DropzoneState = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
        'image/webp': ['.webp'],
    },
    disabled: isProcessing
  });

  const dropzoneClassName = `
    flex flex-col items-center justify-center w-full h-64 
    border-2 border-dashed border-gray-600 rounded-lg 
    cursor-pointer transition-colors duration-300
    ${isDragActive ? 'bg-[#2c3544]' : 'bg-gray-800/50'}
    ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50'}
  `;

  return (
    <div {...getRootProps()} className={dropzoneClassName}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
        <UploadIcon className="w-10 h-10 mb-3" />
        <p className="mb-2 text-sm">Dateien hier ablegen oder zum Auswählen klicken</p>
        <p className="text-xs">Unterstützt PDF, JPG, PNG & WEBP</p>
      </div>
    </div>
  );
};
