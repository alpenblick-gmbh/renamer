
import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, DownloadIcon, TrashIcon, SpinnerIcon } from './icons';

export type FileStatus = 'pending' | 'analyzing' | 'renamed' | 'error';

interface FileItemProps {
  file: File;
  status: FileStatus;
  newName?: string;
  errorMessage?: string;
  onDelete: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

const StatusIndicator: React.FC<{ status: FileStatus }> = ({ status }) => {
  switch (status) {
    case 'analyzing':
      return <SpinnerIcon className="animate-spin h-5 w-5 text-blue-400" />;
    case 'renamed':
      return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
    case 'error':
       return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

const StatusText: React.FC<{ status: FileStatus, errorMessage?: string }> = ({ status, errorMessage }) => {
    switch (status) {
      case 'analyzing':
        return <p className="text-sm text-blue-400">Wird analysiert...</p>;
      case 'error':
        return <p className="text-sm text-red-500">Fehler: {errorMessage}</p>;
      default:
        return null;
    }
}

export const FileItem: React.FC<FileItemProps> = ({ file, status, newName, errorMessage, onDelete, onDownload, isProcessing }) => {
  const isActionable = status === 'renamed' || status === 'error';

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 w-full min-w-0">
        <div className="flex-shrink-0">
          <StatusIndicator status={status} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-200 truncate">{newName || file.name}</p>
           <StatusText status={status} errorMessage={errorMessage} />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {isActionable && (
          <button
            onClick={onDownload}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Download"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
        )}
         <button
            onClick={onDelete}
            disabled={isProcessing && status === 'analyzing'}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
      </div>
    </div>
  );
};
