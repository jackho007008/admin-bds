import { PropertySearch } from "@/components/molecules/PropertySearch";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Filter
} from "lucide-react";

interface PropertyFilterBarProps {
  onSearch?: (value: string) => void;
  searchValue?: string;
  onFilterClick?: () => void;
  onAddClick?: () => void;
}

export function PropertyFilterBar({ onSearch, searchValue, onFilterClick, onAddClick }: PropertyFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <PropertySearch value={searchValue} onChange={onSearch} />
        <Button variant="outline" size="icon" onClick={onFilterClick} title="Lọc chi tiết">
          <Filter className="w-4 h-4 text-slate-500" />
        </Button>
      </div>
      
      <Button className="w-full sm:w-auto flex items-center gap-2 bg-primary hover:bg-primary/90" onClick={onAddClick}>
        <PlusCircle className="w-4 h-4" />
        Đăng tin mới
      </Button>
    </div>
  );
}
