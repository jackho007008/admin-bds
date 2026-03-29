import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PropertySearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function PropertySearch({ value, onChange, placeholder = "Tìm kiếm bài đăng..." }: PropertySearchProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
