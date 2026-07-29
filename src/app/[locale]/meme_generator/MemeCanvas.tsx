"use client";

import { useEffect, useRef, useState } from "react";
import { LayerBox } from "./LayerBox";
import type { Layer } from "./composeMeme";

type Props = {
  imageUrl: string;
  imgRef: React.RefObject<HTMLImageElement | null>;
  layers: Layer[];
  selectedId: string | null;
  editingId: string | null;
  armedForPlacement: boolean;
  onSelectLayer: (id: string | null) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onChangeLayer: (id: string, patch: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onPlaceText: (xPct: number, yPct: number) => void;
  deleteLabel: string;
};

export function MemeCanvas({
  imageUrl,
  imgRef,
  layers,
  selectedId,
  editingId,
  armedForPlacement,
  onSelectLayer,
  onStartEdit,
  onStopEdit,
  onChangeLayer,
  onDeleteLayer,
  onPlaceText,
  deleteLabel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidthPx, setContainerWidthPx] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidthPx(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleBackgroundPointerDown(e: React.PointerEvent) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    if (armedForPlacement) {
      onPlaceText(Math.min(1, Math.max(0, xPct)), Math.min(1, Math.max(0, yPct)));
    } else {
      onSelectLayer(null);
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handleBackgroundPointerDown}
      className={`relative w-full select-none overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${
        armedForPlacement ? "cursor-crosshair" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt=""
        draggable={false}
        className="block w-full select-none"
      />

      {layers.map((layer) => (
        <LayerBox
          key={layer.id}
          layer={layer}
          containerRef={containerRef}
          containerWidthPx={containerWidthPx}
          selected={selectedId === layer.id}
          editing={editingId === layer.id}
          onSelect={() => onSelectLayer(layer.id)}
          onStartEdit={() => onStartEdit(layer.id)}
          onStopEdit={onStopEdit}
          onChange={(patch) => onChangeLayer(layer.id, patch)}
          onDelete={() => onDeleteLayer(layer.id)}
          deleteLabel={deleteLabel}
        />
      ))}
    </div>
  );
}
