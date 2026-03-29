import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2.5 w-full text-start group">
      <Label className="text-[13px] font-bold text-slate-700 ml-0.5 transition-colors group-focus-within:text-primary uppercase tracking-wide">
        {label} {required && <span className="text-red-500/80">*</span>}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "h-12 px-4 bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300 rounded-xl",
          error ? "border-red-500 focus-visible:ring-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : "focus-visible:ring-primary/20 focus:border-primary shadow-sm"
        )}
      />
      {error && (
        <p className="text-[11px] font-semibold text-red-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
          {error}
        </p>
      )}
    </div>
  );
}

