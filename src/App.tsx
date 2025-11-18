
import { useState, useCallback, useEffect } from 'react';
import { Dropzone } from './components/Dropzone';
import { FileList } from './components/FileList';
import { InfoIcon, HeartIcon } from './components/icons';
import { GEMINI_PROMPT } from './constants';
import { convertPdfToImage, getNewFileName } from './lib/utils';
import { AlpenblickLogo } from './components/AlpenblickLogo';
import { FileStatus } from './components/FileItem';

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

function App() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);


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
  
  const handleSelectDirectory = async () => {
    try {
        const handle = await (window as any).showDirectoryPicker();
        setDirHandle(handle);
        setDirectoryName(handle.name);
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', errorMessage } : f));
    }
  };

  const renderFooter = () => {
    const parts = APP_CONFIG.footerTemplate.split(/(\{\{.*?\}\})/g);
    return parts.map((part, index) => {
      if (part === '{{heart}}') {
        return <HeartIcon key={index} className="h-5 w-5 inline-block align-middle text-blue-400 mx-1" style={{ position: 'relative', top: '-1px' }} />;
      } else if (part === '{{link}}') {
        return <a key={index} href={APP_CONFIG.footerLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">{APP_CONFIG.footerLinkText}</a>;
      } else {
        return part;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-12 flex flex-col items-center">
            <AlpenblickLogo className="w-auto h-20 mb-6" src={APP_CONFIG.logoUrl} />
            <p className="text-lg text-gray-400">{APP_CONFIG.subtitleText}</p>
        </header>

        <main className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
            <Dropzone onFilesAdded={handleFilesAdded} isProcessing={isProcessing} />
          </div>
          
          {files.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
                <FileList 
                  files={files}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onSend={handleSend}
                  onClearAll={clearAll}
                  isProcessing={isProcessing}
                  directoryName={directoryName}
                  onSelectDirectory={handleSelectDirectory}
                />
            </div>
          )}

          <div className="flex items-start text-sm text-gray-500 bg-gray-800/50 p-4 rounded-lg mt-8">
            <InfoIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span>
             Ihre Dateien werden lokal im Browser verarbeitet. Für die Analyse wird die erste Seite des Dokuments als Bild an die Google Gemini API gesendet. Es werden keine vollständigen Dateien hochgeladen.
            </span>
          </div>
        </main>
        <footer className="text-center mt-12 text-gray-600 text-sm">
          <p>{renderFooter()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
