"use client";

import { useState } from "react";
import { Shrink } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import { ToolFaqSection } from "@/components/ToolFaqSection";

export default function Client() {
  const t = useTranslations("CompressImagePage");
  const faqItems = t.raw("faq") as { q: string; a: string }[];
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("quality", String(quality));

    try {
      const res = await fetch("/api/compress-image", {
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
      const filename = match ? decodeURIComponent(match[1]) : "compressed.zip";

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
        icon={Shrink}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <SliderField
          label={t("qualityLabel")}
          valueLabel={`${quality}%`}
          min={10}
          max={95}
          value={quality}
          onChange={setQuality}
          hint={t("qualityHint")}
        />

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
