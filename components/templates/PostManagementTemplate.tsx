import { PropertyFilterBar } from "@/components/organisms/PropertyFilterBar";
import { PropertyDataTable } from "@/components/organisms/PropertyDataTable";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface PostManagementTemplateProps {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (value: string) => void;
  searchValue?: string;
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PostManagementTemplate({
  properties,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onLimitChange,
  onSearch,
  searchValue,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: PostManagementTemplateProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý bài đăng</h1>
        <p className="text-slate-500">Xem, chỉnh sửa và quản lý tất cả các tin đăng bất động sản trên hệ thống.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <PropertyFilterBar onSearch={onSearch} searchValue={searchValue} onAddClick={onAdd} />
        <div className="p-6 space-y-4">
          <PropertyDataTable 
            data={properties} 
            onView={onView} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-4">
              <p className="text-[13px] font-bold text-slate-400 whitespace-nowrap">
                Hiển thị <span className="text-slate-900">{properties.length}</span> / <span className="text-slate-900">{totalCount}</span>
              </p>
              
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Số dòng:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    onLimitChange(parseInt(e.target.value));
                    onPageChange(1);
                  }}
                  className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer hover:text-primary transition-colors pr-1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className={cn(
                  "h-9 w-9 rounded-lg border-slate-200 transition-all",
                  currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 text-slate-600 shadow-sm"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 7) {
                      if (currentPage > 4 && i === 1) return <span key="dots-1" className="px-1 text-slate-300">...</span>;
                      if (currentPage < totalPages - 3 && i === 5) return <span key="dots-2" className="px-1 text-slate-300">...</span>;
                      
                      if (currentPage <= 4) {
                        if (i === 6) p = totalPages;
                        else p = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        if (i === 0) p = 1;
                        else p = totalPages - 6 + i;
                      } else {
                        if (i === 0) p = 1;
                        else if (i === 6) p = totalPages;
                        else p = currentPage - 3 + i;
                      }
                    }

                    return (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "ghost"}
                        className={cn(
                          "h-9 w-9 rounded-lg font-bold text-[13px] transition-all",
                          p === currentPage 
                            ? "bg-primary text-white shadow-sm hover:bg-primary/90" 
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                        onClick={() => onPageChange(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>
              )}

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => onPageChange(currentPage + 1)}
                className={cn(
                  "h-9 w-9 rounded-lg border-slate-200 transition-all",
                  currentPage >= totalPages || totalPages === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 text-slate-600 shadow-sm"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
