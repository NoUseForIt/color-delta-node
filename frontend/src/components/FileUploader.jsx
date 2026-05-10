import { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { validateCCTFile } from '../utils/formatters';

const FileUploader = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateCCTFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validation = validateCCTFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".cct"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}

        <div>
          <p className="text-lg font-medium text-gray-700">
            {isLoading ? 'Upload en cours...' : 'Glissez un fichier .cct ici'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ou cliquez pour sélectionner
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FileText className="w-4 h-4" />
          <span>Format accepté : .cct (max 5MB)</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
