import { Upload, X } from 'lucide-react';
import { useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const FileUploader = ({ onFileSelect, selectedFile, onClear }: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Cliquez ou déposez un fichier
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WebP, PDF, Word ou TXT
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".png,.jpg,.jpeg,.webp,.pdf,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
        </div>
      ) : (
        <div className="border-2 border-blue-400 rounded-2xl p-6 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-gray-800 mb-1">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={onClear}
              className="ml-4 p-2 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
