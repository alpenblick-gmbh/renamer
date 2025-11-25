import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, DownloadIcon, TrashIcon, SendIcon, LoadingSpinner, ExclamationTriangleIcon } from './icons';

export type FileStatus = 'pending' | 'analyzing' | 'renamed' | 'error' | 'saved' | 'cancelled' | 'downloaded' | 'permission-error';

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
      return <LoadingSpinner className="h-5 w-5 text-primary" />;
    case 'renamed':
      return <CheckCircleIcon className="h-5 w-5 text-success" />;
    case 'saved':
    case 'downloaded':
      return <CheckCircleIcon className="h-5 w-5 text-text-dim" />;
    case 'error':
       return <ExclamationCircleIcon className="h-5 w-5 text-error" />;
    case 'permission-error':
       return <ExclamationTriangleIcon className="h-5 w-5 text-warning" />;
    case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-error" />;
    default:
      return <div className="h-5 w-5" />;
  }
};

const StatusText: React.FC<{ status: FileStatus, errorMessage?: string }> = ({ status, errorMessage }) => {
    switch (status) {
      case 'analyzing':
        return <p className="text-sm text-primary">Wird analysiert...</p>;
      case 'renamed':
        return <p className="text-sm text-success">Erfolgreich umbenannt</p>;
      case 'saved':
        return <p className="text-sm text-text-dim">Erfolgreich gespeichert</p>;
      case 'downloaded':
        return <p className="text-sm text-text-dim">Download erfolgreich</p>;
      case 'error':
        return <p className="text-sm text-error">Fehler: {errorMessage}</p>;
      case 'permission-error':
        return <p className="text-sm text-warning">{errorMessage}</p>;
      case 'cancelled':
        return <p className="text-sm text-error">Vorgang vom Benutzer abgebrochen</p>;
      default:
        return null;
    }
}

export const FileItem: React.FC<FileItemProps> = ({ file, status, newName, errorMessage, onDelete, onDownload, onSend, isProcessing }) => {
  const showActionButtons = status === 'renamed' || status === 'saved' || status === 'cancelled' || status === 'downloaded' || status === 'permission-error';

  const baseButtonClassName = "p-[10px] rounded-full text-text-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="bg-surface p-4 rounded-lg flex items-center justify-between transition-all duration-300">
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
              className={`${baseButtonClassName} hover:bg-primary hover:text-background`}
              aria-label="Send"
            >
              <SendIcon className="h-5 w-5" />
            </button>

            <button
              onClick={onDownload}
              className={`${baseButtonClassName} hover:bg-success hover:text-background`}
              aria-label="Download"
            >
              <DownloadIcon className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          onClick={onDelete}
          disabled={isProcessing && status === 'analyzing'}
          className={`${baseButtonClassName} hover:bg-error hover:text-background`}
          aria-label="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
