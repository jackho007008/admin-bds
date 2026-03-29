import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface PropertyActionGroupProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PropertyActionGroup({ onView, onEdit, onDelete }: PropertyActionGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onView} title="Xem chi tiết">
        <Eye className="w-4 h-4 text-slate-500" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onEdit} title="Chỉnh sửa">
        <Edit className="w-4 h-4 text-slate-500" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} title="Xóa">
        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
      </Button>
    </div>
  );
}
