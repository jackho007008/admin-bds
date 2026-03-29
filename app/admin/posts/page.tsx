"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostManagementTemplate } from "@/components/templates/PostManagementTemplate";
import { PropertyDetailModal } from "@/components/organisms/PropertyDetailModal";
import { PropertyEditModal } from "@/components/organisms/PropertyEditModal";
import { propertyService } from "@/services/propertyService";
import { Property } from "@/types/property";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function PostManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDeleteId, setPropertyToDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", page, search, limit],
    queryFn: () => propertyService.getProperties(page, limit),
    retry: 0,
  });

  // Fetch detail for selected property
  const { data: selectedProperty, isLoading: isDetailLoading } = useQuery({
    queryKey: ["property", selectedPropertyId],
    queryFn: () => propertyService.getPropertyById(selectedPropertyId!),
    enabled: !!selectedPropertyId && (isDetailModalOpen || isEditModalOpen),
  });

  const properties = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Xóa bài đăng thành công!");
    },
    onError: () => {
      toast.error("Xóa bài đăng thất bại.");
    }
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> | FormData }) => 
      propertyService.updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", selectedPropertyId] });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Đang tải dữ liệu bài đăng...</p>
      </div>
    );
  }

  // Client-side filtering as a fallback, though server-side is preferred
  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.addressRaw.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleAdd = () => {
    toast.info("Tính năng Đăng tin mới đang phát triển");
  };

  const handleView = (id: string) => {
    setSelectedPropertyId(id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedPropertyId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPropertyToDeleteId(id);
    setIsDeleteModalOpen(true);
  };
 
  const confirmDelete = () => {
    if (propertyToDeleteId) {
      deleteMutation.mutate(propertyToDeleteId);
      setIsDeleteModalOpen(false);
      setPropertyToDeleteId(null);
    }
  };

  const handleSaveProperty = async (id: string, data: Partial<Property> | FormData): Promise<Property> => {
    return await saveMutation.mutateAsync({ id, data });
  };

  return (
    <>
      <PostManagementTemplate
        properties={filteredProperties}
        totalCount={totalCount}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PropertyDetailModal 
        property={selectedProperty || null}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isLoading={isDetailLoading}
      />

      <PropertyEditModal
        property={selectedProperty || null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProperty}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-slate-900">
              Xác nhận xóa bài đăng?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Hành động này không thể hoàn tác. Bài đăng sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="flex-1 bg-slate-100 hover:bg-slate-200 border-none text-slate-600 font-medium">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm transition-colors"
            >
              Xóa bài đăng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
