
import React from 'react';
import { FileItem, FileStatus } from './FileItem';
import { Dropdown } from './Dropdown';

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
  directoryHistory: string[];
  onSelectFromHistory: (name: string) => void;

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
    onSelectDirectory, 
    directoryHistory,
    onSelectFromHistory
}) => {
  if (files.length === 0) {
    return null;
  }

  const canDownloadAll = files.some(f => f.newName);
  const canSaveAll = files.some(f => f.status === 'renamed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Dropdown 
            directoryName={directoryName} 
            directoryHistory={directoryHistory}
            onSelectDirectory={onSelectDirectory}
            onSelectFromHistory={onSelectFromHistory}
            isProcessing={isProcessing}
        />
        <button
          onClick={onSaveAll}
          className="bg-surface text-text-main px-4 py-2 rounded-md hover:bg-primary hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={isProcessing || !canSaveAll}
        >
          Alle speichern
        </button>
        <button
          onClick={onDownloadAll}
          className="bg-surface text-text-main px-4 py-2 rounded-md hover:bg-success hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={isProcessing || !canDownloadAll}
        >
          Alle downloaden
        </button>
        <button
          onClick={onClearAll}
          className="bg-surface text-text-main px-4 py-2 rounded-md hover:bg-error hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={isProcessing}
        >
          Alles leeren
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
