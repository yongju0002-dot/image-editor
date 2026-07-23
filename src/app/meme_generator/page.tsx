"use client";

import { useState } from "react";
import { Combine } from "lucide-react";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";

export default function MemeGeneratorPage() {
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
        throw new Error(data?.error ?? "밈 생성 중 오류가 발생했습니다.");
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
      setError(e instanceof Error ? e.message : "밈 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={Combine}
        title="밈 만들기"
        description="상단/하단 텍스트를 넣어 간단하게 밈 이미지를 만들어보세요."
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} />

        <TextField
          label="상단 텍스트"
          value={topText}
          onChange={setTopText}
          placeholder="예: WHEN THE CODE"
        />
        <TextField
          label="하단 텍스트"
          value={bottomText}
          onChange={setBottomText}
          placeholder="예: FINALLY WORKS"
        />

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton
          disabled={files.length === 0 || (!topText.trim() && !bottomText.trim()) || loading}
          onClick={handleSubmit}
        >
          {loading ? "밈 만드는 중..." : "밈 만들기"}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
