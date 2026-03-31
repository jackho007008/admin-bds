import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PropertySearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function PropertySearch({ value = "", onChange, placeholder = "Tìm kiếm bài đăng..." }: PropertySearchProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the local value to trigger onChange
  useEffect(() => {
    // Only trigger if local value differs from external value (meaning the user typed this)
    if (localValue === value) return;

    const handler = setTimeout(() => {
      onChange?.(localValue);
    }, 800);

    return () => clearTimeout(handler);
  }, [localValue, value, onChange]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
        }}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
