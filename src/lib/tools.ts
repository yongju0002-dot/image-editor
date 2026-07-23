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
  icon: LucideIcon;
  available: boolean;
  category: ToolCategory;
};

export type CategoryMeta = {
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
    iconBg: "bg-green-50",
    iconBgDark: "dark:bg-green-500/10",
    iconText: "text-green-600",
    iconTextDark: "dark:text-green-400",
  },
  edit: {
    iconBg: "bg-fuchsia-50",
    iconBgDark: "dark:bg-fuchsia-500/10",
    iconText: "text-fuchsia-600",
    iconTextDark: "dark:text-fuchsia-400",
  },
  create: {
    iconBg: "bg-amber-50",
    iconBgDark: "dark:bg-amber-500/10",
    iconText: "text-amber-600",
    iconTextDark: "dark:text-amber-400",
  },
};

export const tools: Tool[] = [
  { slug: "compress_image", icon: Shrink, available: true, category: "optimize" },
  { slug: "resize_image", icon: ImagePlus, available: true, category: "optimize" },
  { slug: "crop_image", icon: Crop, available: true, category: "edit" },
  { slug: "convert_image", icon: RefreshCw, available: true, category: "optimize" },
  { slug: "rotate_image", icon: RotateCw, available: true, category: "edit" },
  { slug: "watermark_image", icon: Droplets, available: true, category: "edit" },
  { slug: "meme_generator", icon: Combine, available: true, category: "create" },
];
