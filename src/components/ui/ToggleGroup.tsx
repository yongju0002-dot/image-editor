type Option<T extends string> = { value: T; label: string };

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
            value === option.value
              ? "border-green-600 bg-green-600 text-white shadow-sm shadow-green-600/20"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-green-200 hover:bg-green-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-green-800 dark:hover:bg-green-500/5"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
