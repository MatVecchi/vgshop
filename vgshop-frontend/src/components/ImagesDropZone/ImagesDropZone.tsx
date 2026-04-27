"use client";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";

interface MultiImageUploadProps {
  files: { file: File; preview: string }[];
  onFilesChange: (newFiles: { file: File; preview: string }[]) => void;
}

export function ImagesDropZone({
  files,
  onFilesChange,
}: MultiImageUploadProps) {
  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onFilesChange([...files, ...newFiles]);
  };

  const removeImage = (index: number) => {
    const updated = [...files];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    onFilesChange(updated);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 cursor-pointer"
      >
        <input {...getInputProps()} />
        <p className="text-center">Trascina le immagini qui</p>
      </div>
      <Label htmlFor="title">Immagini Caricate</Label>
      <div className="grid grid-cols-3 gap-2 justify-items-center">
        {files.map((item, i) => (
          <div
            key={i}
            className="relative h-24 w-24 overflow-hidden rounded-lg border"
          >
            <Image
              src={item.preview}
              alt="anteprima"
              fill
              className="object-cover"
            />
            <Button
              onClick={() => removeImage(i)}
              className="absolute z-10  h-6 w-6"
              variant="destructive"
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
