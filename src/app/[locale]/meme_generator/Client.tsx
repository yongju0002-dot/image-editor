"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Combine, ImagePlus, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import { ToolFaqSection } from "@/components/ToolFaqSection";
import { baseName } from "@/lib/imageFormats";
import { MemeCanvas } from "./MemeCanvas";
import { composeMeme, type Layer, type TextLayer } from "./composeMeme";

function createId() {
  return crypto.randomUUID();
}

function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to read image"));
    img.src = src;
  });
}

export default function Client() {
  const t = useTranslations("MemeGeneratorPage");
  const faqItems = t.raw("faq") as { q: string; a: string }[];

  const [files, setFiles] = useState<File[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [textStyle, setTextStyle] = useState<"internal" | "external">("internal");
  const [armedForPlacement, setArmedForPlacement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);

  const baseFile = files[0] ?? null;
  const imageUrl = useMemo(
    () => (baseFile ? URL.createObjectURL(baseFile) : null),
    [baseFile],
  );

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  function handleFilesChange(newFiles: File[]) {
    setFiles(newFiles);
    setLayers([]);
    setSelectedId(null);
    setEditingId(null);
    setArmedForPlacement(false);
  }

  function handleAddTextClick() {
    setArmedForPlacement((prev) => !prev);
  }

  function handlePlaceText(xPct: number, yPct: number) {
    const layer: TextLayer = {
      id: createId(),
      kind: "text",
      content: "",
      xPct,
      yPct,
      widthPct: 0.6,
      fontSizePct: 0.08,
      rotationDeg: 0,
      style: textStyle,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
    setEditingId(layer.id);
    setArmedForPlacement(false);
  }

  async function handleAddImageFile(file: File) {
    const src = URL.createObjectURL(file);
    try {
      const [{ width: baseWidth, height: baseHeight }, added] = await Promise.all([
        imgRef.current
          ? Promise.resolve({
              width: imgRef.current.naturalWidth,
              height: imgRef.current.naturalHeight,
            })
          : loadImageDimensions(imageUrl ?? ""),
        loadImageDimensions(src),
      ]);

      const widthPct = 0.3;
      const displayedWidthPx = widthPct * baseWidth;
      const displayedHeightPx = displayedWidthPx * (added.height / added.width);
      const heightPct = displayedHeightPx / baseHeight;

      setLayers((prev) => [
        ...prev,
        {
          id: createId(),
          kind: "image",
          src,
          xPct: 0.5,
          yPct: 0.5,
          widthPct,
          heightPct,
          rotationDeg: 0,
        },
      ]);
    } catch {
      setError(t("error"));
    }
  }

  function handleChangeLayer(id: string, patch: Partial<Layer>) {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as Layer) : layer)),
    );
  }

  function handleDeleteLayer(id: string) {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
    setEditingId((prev) => (prev === id ? null : prev));
  }

  async function handleSubmit() {
    if (!baseFile || !imgRef.current) return;
    setLoading(true);
    setError(null);

    try {
      const outputType = baseFile.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await composeMeme(imgRef.current, layers, outputType);
      const ext = outputType === "image/png" ? "png" : "jpg";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName(baseFile.name)}_meme.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader icon={Combine} title={t("title")} description={t("description")} />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={handleFilesChange} />

        {imageUrl && (
          <>
            <MemeCanvas
              imageUrl={imageUrl}
              imgRef={imgRef}
              layers={layers}
              selectedId={selectedId}
              editingId={editingId}
              armedForPlacement={armedForPlacement}
              onSelectLayer={setSelectedId}
              onStartEdit={setEditingId}
              onStopEdit={() => setEditingId(null)}
              onChangeLayer={handleChangeLayer}
              onDeleteLayer={handleDeleteLayer}
              onPlaceText={handlePlaceText}
              deleteLabel={t("deleteLayerLabel")}
            />

            {armedForPlacement && (
              <p className="text-center text-xs text-green-600 dark:text-green-400">
                {t("placeTextHint")}
              </p>
            )}

            <ToggleGroup
              options={[
                { value: "internal", label: t("internalTextLabel") },
                { value: "external", label: t("externalTextLabel") },
              ]}
              value={textStyle}
              onChange={setTextStyle}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addImageInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-green-300 hover:bg-green-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-green-800 dark:hover:bg-green-500/5"
              >
                <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
                {t("addImageLabel")}
              </button>
              <input
                ref={addImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAddImageFile(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={handleAddTextClick}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  armedForPlacement
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-green-300 hover:bg-green-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-green-800 dark:hover:bg-green-500/5"
                }`}
              >
                <Type className="h-4 w-4" strokeWidth={1.75} />
                {t("addTextLabel")}
              </button>
            </div>
          </>
        )}

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={!baseFile || loading} onClick={handleSubmit}>
          {loading ? t("converting") : t("submit")}
        </SubmitButton>
      </div>

      <ToolFaqSection items={faqItems} />
    </ToolPageShell>
  );
}
