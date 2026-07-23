import Link from "next/link";
import Image from "next/image";
import { NavMenu } from "@/components/NavMenu";

const quickLinks = [
  { href: "/compress_image", label: "이미지 압축" },
  { href: "/resize_image", label: "이미지 크기 조절" },
  { href: "/convert_image", label: "이미지 형식 변환" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-1">
          <Link href="/" className="mr-2 flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="mylifeimg"
              width={466}
              height={220}
              priority
              className="h-12 w-auto"
            />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavMenu />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 sm:inline-flex dark:bg-green-500/10 dark:text-green-400">
            가입 없이 무료로 사용
          </span>
        </div>
      </div>
    </header>
  );
}
