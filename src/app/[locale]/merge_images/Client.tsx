"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import { ToolFaqSection } from "@/components/ToolFaqSection";

type Layout = "horizontal" | "vertical" | "grid";

export default function Client() {
  const t = useTranslations("MergeImagesPage");
  const faqItems = t.raw("faq") as { q: string; a: string }[];
  const [files, setFiles] = useState<File[]>([]);
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [gap, setGap] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length < 2) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("layout", layout);
    formData.append("gap", String(gap));

    try {
      const res = await fetch("/api/merge-images", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_image.png";
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
        icon={Images}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("layoutLabel")}
          </label>
          <div className="mt-1.5">
            <ToggleGroup
              options={[
                { value: "horizontal", label: t("layoutHorizontal") },
                { value: "vertical", label: t("layoutVertical") },
                { value: "grid", label: t("layoutGrid") },
              ]}
              value={layout}
              onChange={setLayout}
            />
          </div>
        </div>

        <SliderField
          label={t("gapLabel")}
          valueLabel={`${gap}px`}
          min={0}
          max={40}
          value={gap}
          onChange={setGap}
        />

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={files.length < 2 || loading} onClick={handleSubmit}>
          {loading ? t("converting") : t("submit")}
        </SubmitButton>
      </div>

      <ToolFaqSection items={faqItems} />
    </ToolPageShell>
  );
}
