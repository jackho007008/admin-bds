import { Badge } from "@/components/ui/badge";
import { PropertyStatus } from "@/types/property";

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
}

const statusConfig: Record<PropertyStatus, { label: string; className: string }> = {
  DANG_BAN: { label: "Đang bán", className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" },
  DUNG_BAN: { label: "Dừng bán", className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200" },
  CHU_BAN: { label: "Chủ bán", className: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200" },
  CONG_TY_BAN: { label: "Công ty bán", className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" },
};

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "" };
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
