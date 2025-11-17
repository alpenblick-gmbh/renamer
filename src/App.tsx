
import { useState, useCallback, useEffect } from 'react';
import { Dropzone } from './components/Dropzone';
import { FileItem, FileStatus } from './components/FileItem';
import { InfoIcon, HeartIcon } from './components/icons';
import { GEMINI_PROMPT } from './constants';
import { convertPdfToImage, getNewFileName } from './lib/utils';
import { AlpenblickLogo } from './components/AlpenblickLogo';

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
}

// Placeholder for the provider list
const ANBIETER_LISTE = "Telekom, Vodafone, O2, Apple, Amazon";

function App() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDelete = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };
  
  const clearAll = () => {
    setFiles([]);
  }

  const handleDownload = (file: File, newName?: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = newName || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFooter = () => {
    const parts = APP_CONFIG.footerTemplate.split(/(\{\{.*?\}\})/g);
    return parts.map((part, index) => {
      if (part === '{{heart}}') {
        return <HeartIcon key={index} className="inline-block align-baseline text-blue-400 mx-1" />;
      } else if (part === '{{link}}') {
        return <a key={index} href={APP_CONFIG.footerLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">{APP_CONFIG.footerLinkText}</a>;
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
            <Dropzone onFilesAdded={handleFilesAdded} disabled={isProcessing} />
          </div>
          
          {files.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Dateien</h2>
                <button 
                  onClick={clearAll}
                  className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-700 rounded-md hover:bg-red-800 hover:text-white transition-colors duration-200 disabled:opacity-50"
                  disabled={isProcessing}
                >
                  Alle löschen
                </button>
              </div>
               <div className="space-y-4">
                {files.map((appFile) => (
                  <FileItem
                    key={appFile.id}
                    file={appFile.file}
                    status={appFile.status}
                    newName={appFile.newName}
                    errorMessage={appFile.errorMessage}
                    onDelete={() => handleDelete(appFile.id)}
                    onDownload={() => handleDownload(appFile.file, appFile.newName)}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
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
