
import React from 'react';
import { FileItem, FileStatus } from './FileItem';

interface FileListProps {
  files: { file: File; status: FileStatus; newName?: string; errorMessage?: string }[];
  onDelete: (index: number) => void;
  onDownload: (index: number) => void;
  onSend: (index: number) => void;
  onClearAll: () => void;
  onDownloadAll: () => void;
  onSaveAll: () => void;
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
    onDownloadAll, 
    onSaveAll, 
    isProcessing, 
    directoryName, 
    onSelectDirectory 
}) => {
  if (files.length === 0) {
    return null;
  }

  const canDownloadAll = files.some(f => f.newName);
  const canSaveAll = files.some(f => f.status === 'renamed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onSelectDirectory}
          className="flex-grow min-w-0 bg-[#2c3544] text-gray-300 px-4 py-2 rounded-md hover:bg-[#333f54] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left truncate"
          disabled={isProcessing}
          title={directoryName ? `Ablageort: ${directoryName}` : "Ablageort auswählen"}
        >
          {directoryName ? `Ablageort: ${directoryName}` : "Ablageort:"}
        </button>
        <button
          onClick={onDownloadAll}
          className="bg-[#2c3544] text-gray-300 px-4 py-2 rounded-md hover:bg-[#4ADE80] hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={isProcessing || !canDownloadAll}
        >
          Alle downloaden
        </button>
        <button
          onClick={onSaveAll}
          className="bg-[#2c3544] text-gray-300 px-4 py-2 rounded-md hover:bg-[#60A5FA] hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={isProcessing || !canSaveAll}
        >
          Alle speichern
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
