import { useState } from 'react';
import { FileType, ConversionOption } from './types';
import { FileUploader } from './components/FileUploader';
import { ConversionOptions } from './components/ConversionOptions';
import { convertImage } from './utils/imageConverter';
import { convertPdfToImages } from './utils/pdfConverter';
import { convertTextToPdf } from './utils/textConverter';
import {
  convertTextToDocx,
  convertImageToDocx,
  convertPdfToDocx, // ✅ UTILISATION BACKEND
} from './utils/docConverter';
import { Download } from 'lucide-react';
import JSZip from 'jszip';
import logo from './assets/logo.png';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<ConversionOption[]>([]);

  /* =========================
     FILE TYPE & OPTIONS
  ========================== */

  const getFileType = (file: File): FileType => {
    if (file.type === 'image/png') return 'image/png';
    if (file.type === 'image/jpeg') return 'image/jpeg';
    if (file.type === 'image/webp') return 'image/webp';
    if (file.type === 'application/pdf') return 'application/pdf';
    if (file.type === 'text/plain') return 'text/plain';
    return 'unknown';
  };

  const getConversionOptions = (fileType: FileType): ConversionOption[] => {
    switch (fileType) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/webp':
        return [
          { value: 'png', label: 'PNG', icon: '🖼️' },
          { value: 'jpg', label: 'JPG', icon: '📷' },
          { value: 'webp', label: 'WebP', icon: '🌐' },
          { value: 'pdf', label: 'PDF', icon: '📄' },
          { value: 'docx', label: 'Word (DOCX)', icon: '📘' },
        ];
      case 'application/pdf':
        return [
          { value: 'image', label: 'Images (ZIP)', icon: '🗜️' },
          { value: 'pdf', label: 'PDF', icon: '📄' },
          { value: 'docx', label: 'Word (DOCX)', icon: '📘' },
        ];
      case 'text/plain':
        return [
          { value: 'pdf', label: 'PDF', icon: '📄' },
          { value: 'docx', label: 'Word (DOCX)', icon: '📘' },
          { value: 'txt', label: 'Texte (TXT)', icon: '📝' },
        ];
      default:
        return [];
    }
  };

  /* =========================
     HANDLERS
  ========================== */

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const options = getConversionOptions(getFileType(file));
    setConversionOptions(options);
    setSelectedFormat(options[0]?.value || '');
  };

  const handleClear = () => {
    setSelectedFile(null);
    setSelectedFormat('');
    setConversionOptions([]);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* =========================
     CONVERSION LOGIC
  ========================== */

  const handleConvert = async () => {
    if (!selectedFile || !selectedFormat) return;

    setConverting(true);

    try {
      const fileType = getFileType(selectedFile);

      /* IMAGE */
      if (['image/png', 'image/jpeg', 'image/webp'].includes(fileType)) {
        if (['png', 'jpg', 'webp'].includes(selectedFormat)) {
          const result = await convertImage(
            selectedFile,
            selectedFormat as 'png' | 'jpg' | 'webp'
          );
          downloadFile(result.blob, result.filename);
        }

        if (selectedFormat === 'pdf') {
          const imgResult = await convertImage(selectedFile, 'png');
          const { jsPDF } = await import('jspdf');
          const pdf = new jsPDF();

          const imgURL = URL.createObjectURL(imgResult.blob);
          const img = new Image();

          img.onload = () => {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const width = Math.min(pageWidth - 20, img.width);
            const height = (img.height * width) / img.width;

            pdf.addImage(img, 'PNG', 10, 10, width, height);
            downloadFile(
              pdf.output('blob'),
              selectedFile.name.replace(/\.[^/.]+$/, '.pdf')
            );

            URL.revokeObjectURL(imgURL);
          };

          img.src = imgURL;
        }

        if (selectedFormat === 'docx') {
          const result = await convertImageToDocx(selectedFile);
          downloadFile(result.blob, result.filename);
        }
      }

      /* PDF */
      else if (fileType === 'application/pdf') {
        if (selectedFormat === 'image') {
          const results = await convertPdfToImages(selectedFile);
          const zip = new JSZip();
          results.forEach((r) => zip.file(r.filename, r.blob));
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          downloadFile(
            zipBlob,
            selectedFile.name.replace('.pdf', '_images.zip')
          );
        }

        if (selectedFormat === 'pdf') {
          downloadFile(selectedFile, selectedFile.name);
        }

        // ✅ PDF → DOCX VIA BACKEND (CLEAN)
        if (selectedFormat === 'docx') {
          const result = await convertPdfToDocx(selectedFile);
          downloadFile(result.blob, result.filename);
        }
      }

      /* TEXT */
      else if (fileType === 'text/plain') {
        if (selectedFormat === 'pdf') {
          const result = await convertTextToPdf(selectedFile);
          downloadFile(result.blob, result.filename);
        }

        if (selectedFormat === 'docx') {
          const result = await convertTextToDocx(selectedFile);
          downloadFile(result.blob, result.filename);
        }

        if (selectedFormat === 'txt') {
          downloadFile(selectedFile, selectedFile.name);
        }
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Erreur lors de la conversion. Veuillez réessayer.');
    } finally {
      setConverting(false);
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="BantuDoc Logo"
              className="h-40 w-auto object-contain"
            />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Convertisseur de fichiers
          </h1>
          <p className="text-xl text-gray-600">
            Convertissez vos fichiers directement dans votre navigateur
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          <FileUploader
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={handleClear}
          />

          {conversionOptions.length > 0 && (
            <ConversionOptions
              options={conversionOptions}
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
            />
          )}

          {selectedFile && selectedFormat && (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {converting ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Conversion en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Convertir et télécharger</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
