"use client";

import { useState } from "react";
import { Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { TextField } from "@/components/ui/TextField";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import { ToolFaqSection } from "@/components/ToolFaqSection";

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export default function Client() {
  const t = useTranslations("WatermarkImagePage");
  const faqItems = t.raw("faq") as { q: string; a: string }[];
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("Sample Watermark");
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(32);
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("bottom-right");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("text", text);
    formData.append("opacity", String(opacity));
    formData.append("fontSize", String(fontSize));
    formData.append("position", position);

    try {
      const res = await fetch("/api/watermark-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : "watermarked.jpg";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={Droplets}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} />

        <TextField label={t("textLabel")} value={text} onChange={setText} />

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("positionLabel")}
          </label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className={`aspect-square rounded-xl border transition-all duration-150 ${
                  position === pos
                    ? "border-green-600 bg-green-600 shadow-sm shadow-green-600/20"
                    : "border-zinc-200 bg-white hover:border-green-200 hover:bg-green-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-800 dark:hover:bg-green-500/5"
                }`}
                aria-label={pos}
              />
            ))}
          </div>
        </div>

        <SliderField
          label={t("opacityLabel")}
          valueLabel={`${opacity}%`}
          min={5}
          max={100}
          value={opacity}
          onChange={setOpacity}
        />

        <SliderField
          label={t("fontSizeLabel")}
          valueLabel={`${fontSize}px`}
          min={10}
          max={150}
          value={fontSize}
          onChange={setFontSize}
        />

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={files.length === 0 || !text.trim() || loading} onClick={handleSubmit}>
          {loading ? t("converting") : t("submit")}
        </SubmitButton>
      </div>

      <ToolFaqSection items={faqItems} />
    </ToolPageShell>
  );
}
