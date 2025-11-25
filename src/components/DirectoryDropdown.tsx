
import React, { useState, useRef, useEffect } from 'react';

interface DirectoryDropdownProps {
  directoryName: string | null;
  directoryHistory: string[];
  onSelectDirectory: () => void;
  onSelectFromHistory: (name: string) => void;
  isProcessing: boolean;
}

export const DirectoryDropdown: React.FC<DirectoryDropdownProps> = ({ 
    directoryName, 
    directoryHistory, 
    onSelectDirectory, 
    onSelectFromHistory, 
    isProcessing 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    onSelectFromHistory(name);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-grow min-w-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#2c3544] text-gray-300 px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left truncate"
        disabled={isProcessing}
        title={directoryName ? `Ablageort: ${directoryName}` : "Ablageort auswählen"}
      >
        {directoryName ? `Ablageort: ${directoryName}` : "Ablageort:"}
      </button>
      {isOpen && (
        <div className="absolute z-10 top-full mt-2 w-full bg-[#2c3544] border border-gray-700 rounded-md shadow-lg">
          <button
            onClick={() => {
                onSelectDirectory();
                setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
          >
            Neuen Ordner wählen...
          </button>

           <div className="border-t border-gray-600 my-1"></div>
           
           <button
            onClick={() => {
                onSelectDirectory();
                setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-blue-400 font-medium flex items-center gap-2"
          >
            <span>📁</span> Rechnungen (Drive)
          </button>

          {directoryHistory.length > 0 && <div className="border-t border-gray-600 my-1"></div>}

          {directoryHistory.map((name, index) => (
            <button
              key={index}
              onClick={() => handleSelect(name)}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 truncate text-gray-400 text-sm"
              title={name}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
