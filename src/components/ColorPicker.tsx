import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Orange", value: "#f97316" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          title={preset.label}
          className={cn(
            "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
            value === preset.value ? "border-foreground scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-transparent"
          )}
          style={{ backgroundColor: preset.value }}
          onClick={() => onChange(preset.value)}
        />
      ))}
      <label className="relative h-8 w-8 cursor-pointer rounded-full border-2 border-dashed border-muted-foreground overflow-hidden hover:border-foreground transition-colors">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">+</span>
      </label>
    </div>
  );
}
