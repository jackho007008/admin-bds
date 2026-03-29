import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PropertyStatusBadge } from "@/components/molecules/PropertyStatusBadge";
import { PropertyActionGroup } from "@/components/molecules/PropertyActionGroup";
import { Property } from "@/types/property";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface PropertyDataTableProps {
  data: Property[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PropertyDataTable({ data, onView, onEdit, onDelete }: PropertyDataTableProps) {
  const formatPrice = (price: number) => {
    if (!price || price === 0) return "Thỏa thuận";
    
    // Billion
    if (price >= 1_000_000_000) {
      const billions = price / 1_000_000_000;
      return `${billions.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
    }
    
    // Million
    if (price >= 1_000_000) {
      const millions = price / 1_000_000;
      return `${millions.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} triệu`;
    }
    
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-900">Tiêu đề</TableHead>
            <TableHead className="font-semibold text-slate-900">Giá</TableHead>
            <TableHead className="font-semibold text-slate-900">Địa chỉ</TableHead>
            <TableHead className="font-semibold text-slate-900">Ngày đăng</TableHead>
            <TableHead className="font-semibold text-slate-900">Trạng thái</TableHead>
            <TableHead className="font-semibold text-slate-900 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-slate-500 italic">
                Không tìm thấy bài đăng nào.
              </TableCell>
            </TableRow>
          ) : (
            data.map((property) => (
              <TableRow key={property.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="max-w-[300px]">
                  <p className="font-medium text-slate-900 line-clamp-1" title={property.title}>
                    {property.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">ID: {property.id}</p>
                </TableCell>
                <TableCell className="font-bold text-primary">
                  {formatPrice(property.price)}
                </TableCell>
                <TableCell className="text-slate-600 truncate max-w-[200px]" title={property.addressRaw}>
                  {property.addressRaw}
                </TableCell>
                <TableCell className="text-slate-500">
                  {format(new Date(property.createdAt), "dd/MM/yyyy", { locale: vi })}
                </TableCell>
                <TableCell>
                  <PropertyStatusBadge status={property.status} />
                </TableCell>
                <TableCell className="text-right">
                  <PropertyActionGroup
                    onView={() => onView?.(property.id)}
                    onEdit={() => onEdit?.(property.id)}
                    onDelete={() => onDelete?.(property.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
