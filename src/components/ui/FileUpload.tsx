import { useRef, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { api } from '../../lib/api';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  accept?: string;
  label?: string;
  preview?: boolean;
}

export default function FileUpload({ value, onChange, folder, accept, label, preview = true }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    try {
      const { url } = await api.upload(file, folder);
      onChange(url);
    } catch {
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const isImage = value && /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(value);

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {value && preview && isImage && (
        <div className="relative mb-2 rounded-xl overflow-hidden border border-gray-200">
          <img src={value} alt="" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white shadow transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {value && !isImage && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-600 truncate flex-1">{fileName || value.split('/').pop()}</span>
          <button type="button" onClick={() => onChange('')} className="p-0.5 hover:bg-gray-200 rounded transition-colors">
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#61a5fa] hover:text-[#61a5fa] hover:bg-blue-50/30 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            {isImage || accept?.includes('image') ? <Image className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {value ? 'Cambiar archivo' : 'Examinar archivo'}
          </>
        )}
      </button>

      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
    </div>
  );
}
