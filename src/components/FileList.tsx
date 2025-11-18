
import React from 'react';
import { FileItem, FileStatus } from './FileItem';

interface FileListProps {
  files: { file: File; status: FileStatus; newName?: string; errorMessage?: string }[];
  onDelete: (index: number) => void;
  onDownload: (index: number) => void;
  onSend: (index: number) => void;
  onClearAll: () => void;
  isProcessing: boolean;
  directoryName: string | null;
  onSelectDirectory: () => void;
}

export const FileList: React.FC<FileListProps> = ({ 
    files, 
    onDelete, 
    onDownload, 
    onSend, 
    onClearAll, 
    isProcessing, 
    directoryName, 
    onSelectDirectory 
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onSelectDirectory}
          className="flex-grow bg-[#2c3544] text-gray-300 px-4 py-2 rounded-md hover:bg-[#333f54] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          disabled={isProcessing}
        >
          {directoryName ? `Ablageort: ${directoryName}` : "Ablageort:"}
        </button>
        <button
          onClick={onClearAll}
          className="bg-[#2c3544] text-gray-300 px-4 py-2 rounded-md hover:bg-[#F87171] hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={isProcessing}
        >
          Alle löschen
        </button>
      </div>
      <div className="space-y-4">
        {files.map((file, index) => (
          <FileItem
            key={index}
            file={file.file}
            status={file.status}
            newName={file.newName}
            errorMessage={file.errorMessage}
            onDelete={() => onDelete(index)}
            onDownload={() => onDownload(index)}
            onSend={() => onSend(index)}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </div>
  );
};
