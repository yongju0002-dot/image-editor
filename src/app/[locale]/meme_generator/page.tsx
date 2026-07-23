"use client";

import { useState } from "react";
import { Combine } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";

export default function MemeGeneratorPage() {
  const t = useTranslations("MemeGeneratorPage");
  const [files, setFiles] = useState<File[]>([]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("topText", topText);
    formData.append("bottomText", bottomText);

    try {
      const res = await fetch("/api/meme-generator", {
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
      const filename = match ? decodeURIComponent(match[1]) : "meme.jpg";

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
        icon={Combine}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} />

        <TextField
          label={t("topTextLabel")}
          value={topText}
          onChange={setTopText}
          placeholder={t("topTextPlaceholder")}
        />
        <TextField
          label={t("bottomTextLabel")}
          value={bottomText}
          onChange={setBottomText}
          placeholder={t("bottomTextPlaceholder")}
        />

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton
          disabled={files.length === 0 || (!topText.trim() && !bottomText.trim()) || loading}
          onClick={handleSubmit}
        >
          {loading ? t("converting") : t("submit")}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
