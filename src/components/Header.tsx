import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="mylifeimg"
            width={466}
            height={220}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link
            href="/compress_image"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-500/10 dark:hover:text-green-400"
          >
            압축
          </Link>
          <Link
            href="/resize_image"
            className="hidden rounded-lg px-3 py-2 transition-colors hover:bg-green-50 hover:text-green-700 sm:inline-block dark:hover:bg-green-500/10 dark:hover:text-green-400"
          >
            크기 조절
          </Link>
          <Link
            href="/convert_image"
            className="hidden rounded-lg px-3 py-2 transition-colors hover:bg-green-50 hover:text-green-700 sm:inline-block dark:hover:bg-green-500/10 dark:hover:text-green-400"
          >
            형식 변환
          </Link>
        </nav>
      </div>
    </header>
  );
}
