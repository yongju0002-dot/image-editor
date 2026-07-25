"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import { ToolFaqSection } from "@/components/ToolFaqSection";

type Mode = "pixel" | "percent";

export default function Client() {
  const t = useTranslations("ResizeImagePage");
  const faqItems = t.raw("faq") as { q: string; a: string }[];
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("pixel");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [keepAspect, setKeepAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("mode", mode);
    formData.append("width", width);
    formData.append("height", height);
    formData.append("percent", percent);
    formData.append("keepAspect", String(keepAspect));

    try {
      const res = await fetch("/api/resize-image", {
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
      const filename = match ? decodeURIComponent(match[1]) : "resized.zip";

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
        icon={ImagePlus}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <ToggleGroup
          options={[
            { value: "pixel", label: t("modePixel") },
            { value: "percent", label: t("modePercent") },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === "pixel" ? (
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label={t("widthLabel")}
              type="number"
              value={width}
              onChange={setWidth}
              placeholder={t("widthPlaceholder")}
            />
            <TextField
              label={t("heightLabel")}
              type="number"
              value={height}
              onChange={setHeight}
              placeholder={t("heightPlaceholder")}
            />
          </div>
        ) : (
          <TextField
            label={t("percentLabel")}
            type="number"
            value={percent}
            onChange={setPercent}
            placeholder={t("percentPlaceholder")}
            hint={t("percentHint")}
          />
        )}

        {mode === "pixel" && (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-green-600 dark:border-zinc-700"
            />
            {t("keepAspectLabel")}
          </label>
        )}

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton
          disabled={files.length === 0 || loading}
          onClick={handleSubmit}
        >
          {loading ? t("converting") : t("submit")}
        </SubmitButton>
      </div>

      <ToolFaqSection items={faqItems} />
    </ToolPageShell>
  );
}
