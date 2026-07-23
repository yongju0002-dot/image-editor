type Props = {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
};

export function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  min,
  max,
}: Props) {
  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-green-400 focus:ring-4 focus:ring-green-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-green-500 dark:focus:ring-green-500/10 ${label ? "mt-1.5" : ""}`}
      />
      {hint && (
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}
