"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostManagementTemplate } from "@/components/templates/PostManagementTemplate";
import { PropertyDetailModal } from "@/components/organisms/PropertyDetailModal";
import { propertyService } from "@/services/propertyService";

import { toast } from "sonner";

export default function PostManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Selected property for modal
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", page, search],
    queryFn: () => propertyService.getProperties(page, pageSize),
    retry: 0,
  });

  // Fetch detail for selected property
  const { data: selectedProperty, isLoading: isDetailLoading } = useQuery({
    queryKey: ["property", selectedPropertyId],
    queryFn: () => propertyService.getPropertyById(selectedPropertyId!),
    enabled: !!selectedPropertyId && isModalOpen,
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
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    toast(`Chỉnh sửa bài đăng: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally keep selectedId to avoid flicker when closing, 
    // but clear it eventually
  };

  return (
    <>
      <PostManagementTemplate
        properties={filteredProperties}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PropertyDetailModal 
        property={selectedProperty || null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoading={isDetailLoading}
      />
    </>
  );
}
