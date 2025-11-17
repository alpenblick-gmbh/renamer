import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, DownloadIcon, TrashIcon, SendIcon, LoadingSpinner } from './icons';

export type FileStatus = 'pending' | 'analyzing' | 'renamed' | 'error';

interface FileItemProps {
  file: File;
  status: FileStatus;
  newName?: string;
  errorMessage?: string;
  onDelete: () => void;
  onDownload: () => void;
  onSend: () => void;
  isProcessing: boolean;
}

const StatusIndicator: React.FC<{ status: FileStatus }> = ({ status }) => {
  switch (status) {
    case 'analyzing':
      return <LoadingSpinner className="h-5 w-5 text-blue-400" />;
    case 'renamed':
      return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
    case 'error':
       return <ExclamationCircleIcon className="h-5 w-5 text-red-400" />;
    default:
      return <div className="h-5 w-5" />;
  }
};

const StatusText: React.FC<{ status: FileStatus, errorMessage?: string }> = ({ status, errorMessage }) => {
    switch (status) {
      case 'analyzing':
        return <p className="text-sm text-blue-400">Wird analysiert...</p>;
      case 'renamed':
        return <p className="text-sm text-green-400">Erfolgreich umbenannt</p>;
      case 'error':
        return <p className="text-sm text-red-400">Fehler: {errorMessage}</p>;
      default:
        return null;
    }
}

export const FileItem: React.FC<FileItemProps> = ({ file, status, newName, errorMessage, onDelete, onDownload, onSend, isProcessing }) => {
  const showActionButtons = status === 'renamed';

  const baseButtonClassName = "p-[10px] rounded-full text-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="bg-[#2c3544] p-4 rounded-lg flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 w-full min-w-0">
        <div className="flex-shrink-0">
          <StatusIndicator status={status} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-200 truncate">{newName || file.name}</p>
           <StatusText status={status} errorMessage={errorMessage} />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {showActionButtons && (
          <>
            <button
              onClick={onSend}
              className={`${baseButtonClassName} hover:bg-[#60A5FA] hover:text-gray-900`}
              aria-label="Send"
            >
              <SendIcon className="h-5 w-5" />
            </button>

            <button
              onClick={onDownload}
              className={`${baseButtonClassName} hover:bg-[#4ADE80] hover:text-gray-900`}
              aria-label="Download"
            >
              <DownloadIcon className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          onClick={onDelete}
          disabled={isProcessing && status === 'analyzing'}
          className={`${baseButtonClassName} hover:bg-[#F87171] hover:text-gray-900`}
          aria-label="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
