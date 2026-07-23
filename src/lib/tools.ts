import {
  Combine,
  Crop,
  Droplets,
  ImagePlus,
  RefreshCw,
  RotateCw,
  Shrink,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "optimize" | "edit" | "create";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  category: ToolCategory;
};

export type CategoryMeta = {
  label: string;
  iconBg: string;
  iconBgDark: string;
  iconText: string;
  iconTextDark: string;
};

// Tailwind scans source files for literal class names, so these are written
// out in full (not built with template strings) even though they're really
// just "accent color per category".
export const categoryMeta: Record<ToolCategory, CategoryMeta> = {
  optimize: {
    label: "최적화",
    iconBg: "bg-green-50",
    iconBgDark: "dark:bg-green-500/10",
    iconText: "text-green-600",
    iconTextDark: "dark:text-green-400",
  },
  edit: {
    label: "편집",
    iconBg: "bg-fuchsia-50",
    iconBgDark: "dark:bg-fuchsia-500/10",
    iconText: "text-fuchsia-600",
    iconTextDark: "dark:text-fuchsia-400",
  },
  create: {
    label: "생성",
    iconBg: "bg-amber-50",
    iconBgDark: "dark:bg-amber-500/10",
    iconText: "text-amber-600",
    iconTextDark: "dark:text-amber-400",
  },
};

export const tools: Tool[] = [
  {
    slug: "compress_image",
    name: "이미지 압축",
    description: "화질은 유지하면서 JPG, PNG, WEBP 이미지 용량을 줄여보세요.",
    icon: Shrink,
    available: true,
    category: "optimize",
  },
  {
    slug: "resize_image",
    name: "이미지 크기 조절",
    description: "픽셀 또는 퍼센트로 이미지 크기를 원하는 대로 조절하세요.",
    icon: ImagePlus,
    available: true,
    category: "optimize",
  },
  {
    slug: "crop_image",
    name: "이미지 자르기",
    description: "픽셀 좌표를 지정해 이미지의 원하는 영역만 잘라내세요.",
    icon: Crop,
    available: true,
    category: "edit",
  },
  {
    slug: "convert_image",
    name: "이미지 형식 변환",
    description: "JPG, PNG, WEBP, GIF, BMP, TIFF 간에 자유롭게 변환하세요.",
    icon: RefreshCw,
    available: true,
    category: "optimize",
  },
  {
    slug: "rotate_image",
    name: "이미지 회전",
    description: "이미지를 원하는 각도로 회전하거나 좌우/상하로 반전하세요.",
    icon: RotateCw,
    available: true,
    category: "edit",
  },
  {
    slug: "watermark_image",
    name: "워터마크 추가",
    description: "텍스트 워터마크로 이미지에 투명도와 위치를 조절해 삽입하세요.",
    icon: Droplets,
    available: true,
    category: "edit",
  },
  {
    slug: "meme_generator",
    name: "밈 만들기",
    description: "상단/하단 텍스트를 넣어 간단하게 밈 이미지를 만들어보세요.",
    icon: Combine,
    available: true,
    category: "create",
  },
];
