export function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 dark:border-zinc-900 dark:text-zinc-500">
      <p>모든 이미지는 처리 후 서버에서 자동으로 삭제됩니다.</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} mylifeimg.com</p>
    </footer>
  );
}
