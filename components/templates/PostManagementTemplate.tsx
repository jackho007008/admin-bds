import { PropertyFilterBar } from "@/components/organisms/PropertyFilterBar";
import { PropertyDataTable } from "@/components/organisms/PropertyDataTable";
import { Property } from "@/types/property";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";

interface PostManagementTemplateProps {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch: (value: string) => void;
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
  onSearch,
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
        <PropertyFilterBar onSearch={onSearch} onAddClick={onAdd} />
        <div className="p-6 space-y-4">
          <PropertyDataTable 
            data={properties} 
            onView={onView} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-medium text-slate-900">{properties.length}</span> trong số <span className="font-medium text-slate-900">{totalCount}</span> bài đăng
            </p>
            
            {totalPages > 1 && (
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) onPageChange(currentPage - 1);
                      }} 
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) onPageChange(currentPage + 1);
                      }} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
