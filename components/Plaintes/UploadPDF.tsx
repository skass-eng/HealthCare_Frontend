import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { ChangeEvent } from 'react';

interface UploadPDFProps {
  pdfFile: File | null;
  pdfLoading: boolean;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePdfSubmit: () => void;
}

export default function UploadPDF({ pdfFile, pdfLoading, handleFileChange, handlePdfSubmit }: UploadPDFProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <DocumentArrowUpIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Upload du PDF</h3>
          <p className="text-gray-600 text-sm">Sélectionnez un fichier PDF</p>
        </div>
      </div>
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentArrowUpIcon className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {pdfFile ? pdfFile.name : 'Cliquez pour sélectionner un PDF'}
          </p>
          <p className="text-sm text-gray-500">
            {pdfFile ? 'Fichier sélectionné' : 'Glissez-déposez ou cliquez pour sélectionner un fichier PDF'}
          </p>
        </label>
      </div>
      {/* BOUTON SUPPRIMÉ : il est maintenant uniquement dans le footer du modal */}
    </div>
  );
} 