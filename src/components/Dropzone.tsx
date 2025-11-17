
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, disabled }) => {

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (!disabled) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-600 rounded-xl p-12 text-center transition-colors duration-200 
        ${isDragActive ? 'border-blue-400 bg-gray-700/30' : ''} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
        <p className="text-lg font-semibold text-gray-300">Dateien hier ablegen oder zum Auswählen klicken</p>
        <p className="text-sm text-gray-500">Unterstützt PDF, JPG, PNG & WEBP</p>
      </div>
    </div>
  );
};
