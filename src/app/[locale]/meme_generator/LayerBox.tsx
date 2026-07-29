"use client";

import { useRef } from "react";
import { RotateCw, X } from "lucide-react";
import type { Layer } from "./composeMeme";

type Patch = Partial<Pick<Layer, "xPct" | "yPct" | "widthPct" | "rotationDeg">> &
  Partial<{ heightPct: number; fontSizePct: number; content: string }>;

type Props = {
  layer: Layer;
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerWidthPx: number;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChange: (patch: Patch) => void;
  onDelete: () => void;
  deleteLabel: string;
};

function getPoint(e: PointerEvent, container: HTMLDivElement) {
  const rect = container.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top, rect };
}

export function LayerBox({
  layer,
  containerRef,
  containerWidthPx,
  selected,
  editing,
  onSelect,
  onStartEdit,
  onStopEdit,
  onChange,
  onDelete,
  deleteLabel,
}: Props) {
  const textRef = useRef<HTMLDivElement>(null);

  function handleDragPointerDown(e: React.PointerEvent) {
    if (editing) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const container = containerRef.current;
    if (!container) return;

    const start = getPoint(e.nativeEvent, container);
    const startXPct = layer.xPct;
    const startYPct = layer.yPct;

    function handleMove(ev: PointerEvent) {
      if (!container) return;
      const now = getPoint(ev, container);
      const dxPct = (now.x - start.x) / now.rect.width;
      const dyPct = (now.y - start.y) / now.rect.height;
      onChange({
        xPct: Math.min(1, Math.max(0, startXPct + dxPct)),
        yPct: Math.min(1, Math.max(0, startYPct + dyPct)),
      });
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleResizePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const start = getPoint(e.nativeEvent, container);
    const centerX = layer.xPct * start.rect.width;
    const centerY = layer.yPct * start.rect.height;
    const startDist = Math.max(5, Math.hypot(start.x - centerX, start.y - centerY));
    const startWidthPct = layer.widthPct;
    const startHeightPct = layer.kind === "image" ? layer.heightPct : undefined;
    const startFontSizePct = layer.kind === "text" ? layer.fontSizePct : undefined;

    function handleMove(ev: PointerEvent) {
      if (!container) return;
      const now = getPoint(ev, container);
      const dist = Math.hypot(now.x - centerX, now.y - centerY);
      const scale = Math.min(6, Math.max(0.1, dist / startDist));
      const patch: Patch = {
        widthPct: Math.min(1.5, Math.max(0.03, startWidthPct * scale)),
      };
      if (startHeightPct !== undefined) {
        patch.heightPct = Math.min(1.5, Math.max(0.03, startHeightPct * scale));
      }
      if (startFontSizePct !== undefined) {
        patch.fontSizePct = Math.min(0.5, Math.max(0.015, startFontSizePct * scale));
      }
      onChange(patch);
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleRotatePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const start = getPoint(e.nativeEvent, container);
    const centerX = layer.xPct * start.rect.width;
    const centerY = layer.yPct * start.rect.height;
    const startAngle = Math.atan2(start.y - centerY, start.x - centerX);
    const startRotation = layer.rotationDeg;

    function handleMove(ev: PointerEvent) {
      if (!container) return;
      const now = getPoint(ev, container);
      const currentAngle = Math.atan2(now.y - centerY, now.x - centerX);
      const deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;
      onChange({ rotationDeg: startRotation + deltaDeg });
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div
      onPointerDown={handleDragPointerDown}
      onDoubleClick={(e) => {
        if (layer.kind !== "text") return;
        e.stopPropagation();
        onStartEdit();
        requestAnimationFrame(() => textRef.current?.focus());
      }}
      className="absolute"
      style={{
        left: `${layer.xPct * 100}%`,
        top: `${layer.yPct * 100}%`,
        width: `${layer.widthPct * 100}%`,
        transform: `translate(-50%, -50%) rotate(${layer.rotationDeg}deg)`,
        cursor: editing ? "text" : "move",
        touchAction: "none",
      }}
    >
      {layer.kind === "text" ? (
        <div
          ref={textRef}
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={(e) => {
            onChange({ content: e.currentTarget.textContent ?? "" });
            onStopEdit();
          }}
          className={
            layer.style === "internal"
              ? "select-none whitespace-pre-wrap break-words text-center font-black uppercase leading-tight text-white outline-none"
              : "select-none whitespace-pre-wrap break-words rounded-md bg-white px-2 py-1 text-center font-black leading-tight text-black outline-none"
          }
          style={{
            fontSize: `${Math.max(8, layer.fontSizePct * containerWidthPx)}px`,
            WebkitTextStroke: layer.style === "internal" ? "0.05em black" : undefined,
          }}
        >
          {layer.content}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={layer.src}
          alt=""
          draggable={false}
          className="pointer-events-none block w-full select-none"
          style={{ aspectRatio: layer.widthPct / layer.heightPct }}
        />
      )}

      {selected && (
        <>
          <button
            type="button"
            aria-label={deleteLabel}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
          <div
            onPointerDown={handleResizePointerDown}
            className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-green-600 bg-white shadow-sm"
          />
          <div
            onPointerDown={handleRotatePointerDown}
            className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-6 cursor-grab rounded-full border-2 border-green-600 bg-white shadow-sm"
          >
            <RotateCw className="h-full w-full scale-75 text-green-600" strokeWidth={2.5} />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded border-2 border-dashed border-green-500/70" />
        </>
      )}
    </div>
  );
}
