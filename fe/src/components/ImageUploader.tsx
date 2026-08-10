import React, { useRef, useState } from 'react';
import '../styles/uploader.css';

export interface ImagenCargada {
  id: string;
  archivo: File;
  urlPrevia: string;
  fecha: string;
}

interface ImageUploaderProps {
  onImagenesCargadas: (imagenes: ImagenCargada[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagenesCargadas }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const procesarArchivos = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;

    const validos = Array.from(archivos).filter((archivo) => archivo.type.startsWith('image/'));
    if (validos.length === 0) return;

    const nuevasImagenes: ImagenCargada[] = validos.map((archivo) => ({
      id: `${archivo.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      archivo,
      urlPrevia: URL.createObjectURL(archivo),
      fecha: new Date().toISOString(),
    }));

    onImagenesCargadas(nuevasImagenes);

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
      <p>Arrastra tus imágenes termográficas aquí</p>
      <p className="texto-suave">o haz clic para seleccionar archivos (JPG, PNG, TIFF)</p>

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