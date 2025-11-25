
import { useState, useCallback, useEffect, useRef } from 'react';
import { Dropzone } from './components/Dropzone';
import { FileList } from './components/FileList';
import { InfoIcon, HeartIcon } from './components/icons';
import { GEMINI_PROMPT } from './prompts';
import { convertPdfToImage, getNewFileName } from './lib/utils';
import { AlpenblickLogo } from './components/AlpenblickLogo';
import { FileStatus } from './components/FileItem';
import { auth } from './firebase'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut

// --- CONFIGURATION ---
const APP_CONFIG = {
    logoUrl: "https://alpenblick.net/media/AB_Logo_Kreativeagentur_rn.svg",
    subtitleText: "PDFs & Bilder intelligent umbenennen.",
    footerLinkText: "Alpenblick",
    footerLink: "https://alpenblick.net/",
    footerTemplate: "Renamer | Mit {{heart}} von {{link}} entwickelt. © 2024"
};

interface AppFile {
  id: string;
  file: File;
  status: FileStatus;
  newName?: string;
  errorMessage?: string;
  dirHandle?: FileSystemDirectoryHandle;
}

// Placeholder for the provider list
const ANBIETER_LISTE = "Telekom, Vodafone, O2, Apple, Amazon";

function MainApp() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [directoryHistory, setDirectoryHistory] = useState<{name: string, handle: FileSystemDirectoryHandle}[]>([]);
  const lastFileIndexRef = useRef<number | null>(null);


  useEffect(() => {
    const loadedHistory = localStorage.getItem('directoryHistory');
    if (loadedHistory) {
        const historyNames = JSON.parse(loadedHistory);
        setDirectoryHistory(historyNames.map((name: string) => ({ name, handle: {} as FileSystemDirectoryHandle })));
    }
  }, []);

  const updateDirectoryHistory = (name: string, handle: FileSystemDirectoryHandle) => {
    setDirectoryHistory(prev => {
        const newHistory = [{ name, handle }, ...prev.filter(h => h.name !== name)].slice(0, 10);
        localStorage.setItem('directoryHistory', JSON.stringify(newHistory.map(h => h.name)));
        return newHistory;
    });
  };


  const handleFilesAdded = useCallback((addedFiles: File[]) => {
    const newFiles: AppFile[] = addedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      status: 'pending',
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  useEffect(() => {
    const processFile = async (appFile: AppFile) => {
      setIsProcessing(true);
      setFiles(prev => prev.map(f => f.id === appFile.id ? { ...f, status: 'analyzing' } : f));
      try {
        let imageBase64: string;
        if (appFile.file.type === 'application/pdf') {
          imageBase64 = await convertPdfToImage(appFile.file);
        } else if (appFile.file.type.startsWith('image/')) {
          imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(appFile.file);
          });
        } else {
          throw new Error(`Unsupported file type: ${appFile.file.type}`);
        }

        const filledPrompt = GEMINI_PROMPT.replace('{{ANBIETER_LISTE}}', ANBIETER_LISTE);
        const newName = await getNewFileName(imageBase64, filledPrompt);
        const originalExtension = appFile.file.name.split('.').pop() || '';

        setFiles(prev => prev.map(f => 
          f.id === appFile.id 
            ? { ...f, status: 'renamed', newName: `${newName}.${originalExtension}` } 
            : f
        ));
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setFiles(prev => prev.map(f => 
          f.id === appFile.id 
            ? { ...f, status: 'error', errorMessage } 
            : f
        ));
      } finally {
         const pendingFile = files.find(f => f.status === 'pending');
         if (!pendingFile) {
            setIsProcessing(false);
         }
      }
    };

    const pendingFile = files.find(f => f.status === 'pending');
    if (pendingFile) {
      processFile(pendingFile);
    } else {
        setIsProcessing(false);
    }
  }, [files]);

  const handleDelete = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  const clearAll = () => {
    setFiles([]);
  }

  const handleSelectFromHistory = (name: string) => {
    const selectedDir = directoryHistory.find(h => h.name === name);
    if (selectedDir) {
        setDirHandle(selectedDir.handle);
        setDirectoryName(selectedDir.name);
        setFiles(prevFiles => prevFiles.map(f => f.status === 'saved' ? { ...f, status: 'renamed' } : f));
    }
  };
  
  const handleSelectDirectory = async () => {
    try {
        const handle = await (window as any).showDirectoryPicker();
        setDirHandle(handle);
        setDirectoryName(handle.name);
        updateDirectoryHistory(handle.name, handle);
        // Reset status to allow re-saving
        setFiles(prevFiles => prevFiles.map(f => 
            f.status === 'saved' || f.status === 'permission-error' ? { ...f, status: 'renamed' } : f
        ));
        return handle;
    } catch (err) {
        console.error("Error selecting directory:", err);
        return null;
    }
  };


  const handleDownload = (index: number) => {
    const fileToDownload = files[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(fileToDownload.file);
    link.download = fileToDownload.newName || fileToDownload.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'downloaded' } : f));
  };
  
  const handleSend = async (index: number) => {
    let currentDirHandle = dirHandle;
    if (!currentDirHandle) {
        lastFileIndexRef.current = index; // Remember which file we tried to send
        currentDirHandle = await handleSelectDirectory();
    }

    if (!currentDirHandle) {
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'cancelled' } : f));
      return;
    }

    const fileToSend = files[index];
    if (!fileToSend.newName) return;

    try {
        const fileHandle = await currentDirHandle.getFileHandle(fileToSend.newName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(fileToSend.file);
        await writable.close();
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'saved' } : f));
    } catch (error) {
        console.error('Error saving file:', error);
        if (error instanceof TypeError && (error.message.includes('getFileHandle') || error.message.includes('not a function'))) {
             setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'permission-error', errorMessage: 'Hoppla. Wähle den Ordner erneut aus, um die Dateien zu speichern.' } : f));
             lastFileIndexRef.current = index;
             await handleSelectDirectory();
        } else {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', errorMessage } : f));
        }
    }
  };

  // This effect runs after a directory is selected
  useEffect(() => {
    if (lastFileIndexRef.current !== null) {
        const fileIndex = lastFileIndexRef.current;
        // Check if the file still exists and is in a savable state
        if (files[fileIndex] && (files[fileIndex].status === 'renamed' || files[fileIndex].status === 'permission-error')) {
             handleSend(fileIndex); // Retry sending the specific file
        }
        lastFileIndexRef.current = null; // Reset the ref
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirHandle]); // Dependency on dirHandle ensures this runs after a new directory is selected


  const handleDownloadAll = () => {
    files.forEach((file, index) => {
      if (file.newName) {
        handleDownload(index);
      }
    });
  };

  const handleSaveAll = async () => {
    let currentDirHandle = dirHandle;
    if (!currentDirHandle) {
        currentDirHandle = await handleSelectDirectory();
    }

    if (!currentDirHandle) {
        setFiles(prev => prev.map(f => (f.status === 'renamed' || f.status === 'permission-error') ? { ...f, status: 'cancelled' } : f));
        return;
    }
    // After selecting a directory, we can trigger a re-save for all applicable files.
    // We change their status to renamed to make them eligible for saving again.
    setFiles(prevFiles => prevFiles.map(f => (f.status === 'permission-error') ? { ...f, status: 'renamed' } : f));
    
    // Use a small timeout to allow the state update to be processed before saving
    setTimeout(() => {
        // The save logic is now inside the component, so we access the latest state via a callback in setFiles
        setFiles(currentFiles => {
            const filesToSave = currentFiles.filter(f => f.status === 'renamed');
        
            const savePromises = filesToSave.map(async (fileToSave) => {
                if (!fileToSave.newName) return null;
                try {
                    const fileHandle = await currentDirHandle!.getFileHandle(fileToSave.newName, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(fileToSave.file);
                    await writable.close();
                    return { id: fileToSave.id, status: 'saved' };
                } catch (error) {
                    console.error('Error saving file:', error);
                    if (error instanceof TypeError && (error.message.includes('getFileHandle') || error.message.includes('not a function'))) {
                         return { id: fileToSave.id, status: 'permission-error', errorMessage: 'Hoppla. Wähle den Ordner erneut aus, um die Dateien zu speichern.' };
                    } else {
                         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
                         return { id: fileToSave.id, status: 'error', errorMessage };
                    }
                }
            });

            Promise.all(savePromises).then(results => {
                setFiles(prevFiles => {
                    const resultMap = new Map(results.filter(r => r).map(r => [r!.id, r!]));
                    return prevFiles.map(file => {
                        const result = resultMap.get(file.id);
                        if (result) {
                            return { ...file, status: result.status as FileStatus, errorMessage: result.errorMessage };
                        }
                        return file;
                    });
                });
            });

            return currentFiles; // Return current files, state will be updated by promises
        });
    }, 100); // Small delay
};


  const renderFooter = () => {
    const parts = APP_CONFIG.footerTemplate.split(/(\{\{.*?\}\})/g);
    return parts.map((part, index) => {
      if (part === '{{heart}}') {
        return <HeartIcon key={index} className="h-5 w-5 inline-block align-middle text-primary mx-1 transition-colors duration-300 hover:text-primary-dark hover:animate-breathe" style={{ position: 'relative', top: '-1px' }} />;
      } else if (part === '{{link}}') {
        return <a key={index} href={APP_CONFIG.footerLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{APP_CONFIG.footerLinkText}</a>;
      } else {
        return part;
      }
    });
  };

  const signOutUser = () => {
    signOut(auth).catch((error) => {
        console.error("Sign Out Error:", error);
    });
  };


  return (
    <div className="min-h-screen bg-background text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-12 flex flex-col items-center flex-shrink-0">
            <div className="w-full flex justify-center items-center relative">
                <AlpenblickLogo className="w-auto h-20" src={APP_CONFIG.logoUrl} />
                <button
                    onClick={signOutUser}
                    className="absolute right-0 bg-surface hover:bg-surface-hover text-text-dim hover:text-text-muted font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Sign Out
                </button>
            </div>
            <p className="text-lg text-text-muted mt-6">{APP_CONFIG.subtitleText}</p>
        </header>

        <main className="space-y-6 flex-grow">
          <div className="bg-container border border-surface-hover rounded-xl p-6 sm:p-8 shadow-lg">
            <Dropzone onFilesAdded={handleFilesAdded} isProcessing={isProcessing} />
          </div>
          
          {files.length > 0 && (
            <div className="bg-container border border-surface-hover rounded-xl p-6 sm:p-8 shadow-lg">
                <FileList 
                  files={files}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onSend={handleSend}
                  onClearAll={clearAll}
                  onDownloadAll={handleDownloadAll}
                  onSaveAll={handleSaveAll}
                  isProcessing={isProcessing}
                  directoryName={directoryName}
                  onSelectDirectory={handleSelectDirectory}
                  directoryHistory={directoryHistory.map(h => h.name)}
                  onSelectFromHistory={handleSelectFromHistory}
                />
            </div>
          )}

          <div className="flex items-start text-sm text-text-dim bg-container/50 p-4 rounded-lg mt-8">
            <InfoIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span>
             Ihre Dateien werden lokal im Browser verarbeitet. Für die Analyse wird die erste Seite des Dokuments als Bild an die Google Gemini API gesendet. Es werden keine vollständigen Dateien hochgeladen.
            </span>
          </div>
        </main>
        <footer className="text-center mt-12 text-text-dim text-sm flex-shrink-0 pb-4">
          <p>{renderFooter()}</p>
        </footer>
      </div>
    </div>
  );
}

export default MainApp;
