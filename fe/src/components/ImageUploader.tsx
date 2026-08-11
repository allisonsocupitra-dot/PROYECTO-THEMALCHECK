import React, { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/uploader.css';

interface ImageUploaderProps {
  onArchivosSeleccionados: (archivos: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onArchivosSeleccionados }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const { t } = useLanguage();

  const procesarArchivos = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;

    const validos = Array.from(archivos).filter((archivo) => archivo.type.startsWith('image/'));
    if (validos.length === 0) return;

    onArchivosSeleccionados(validos);

    // Permite volver a seleccionar el mismo archivo si el usuario lo retira y lo vuelve a subir
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    procesarArchivos(e.dataTransfer.files);
  };

  return (
    <div
      className={`zona-carga ${arrastrando ? 'zona-carga-activa' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
    >
      <i className="fa-solid fa-cloud-arrow-up icono-carga"></i>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => procesarArchivos(e.target.files)}
      />
    </div>
  );
};

export default ImageUploader;