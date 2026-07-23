"use client";

import { ImageIcon, UploadCloud, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { isImageFile } from "@/lib/imageFormats";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  placeholder?: string;
};

export function ImageDropzone({
  files,
  onChange,
  multiple = false,
  placeholder,
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const images = accepted.filter(isImageFile);
      if (multiple) {
        onChange([...files, ...images]);
      } else {
        onChange(images.slice(0, 1));
      }
    },
    [files, multiple, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"],
    },
  });

  const resolvedPlaceholder =
    placeholder ??
    (multiple
      ? "이미지를 여러 장 드래그하거나 클릭해서 선택하세요"
      : "이미지를 드래그하거나 클릭해서 선택하세요");

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-150 ${
          isDragActive
            ? "border-green-400 bg-green-50/70 dark:border-green-500 dark:bg-green-500/10"
            : "border-zinc-200 bg-white hover:border-green-300 hover:bg-green-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-600 dark:hover:bg-green-500/5"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-green-100 dark:bg-zinc-800 dark:group-hover:bg-green-500/20">
          {files.length > 0 ? (
            <ImageIcon
              className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
              strokeWidth={1.75}
            />
          ) : (
            <UploadCloud
              className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
              strokeWidth={1.75}
            />
          )}
        </div>
        {files.length > 0 ? (
          <>
            <p className="max-w-full truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {files.length === 1
                ? files[0].name
                : `이미지 ${files.length}개 선택됨`}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {multiple ? "클릭하거나 드래그해서 추가" : "클릭해서 다른 파일로 변경"}
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {resolvedPlaceholder}
          </p>
        )}
      </div>

      {multiple && files.length > 0 && (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 text-sm dark:bg-zinc-900"
            >
              <span className="truncate text-zinc-600 dark:text-zinc-300">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="파일 제거"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
