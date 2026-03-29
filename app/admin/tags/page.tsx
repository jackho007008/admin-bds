"use client";

import React, { useState, useEffect, useCallback } from "react";
import { tagService, Tag } from "@/services/tagService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tags,
  Plus,
  Search,
  RefreshCcw,
  Edit2,
  Trash2,
  MoreVertical,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";
import { TagModal } from "@/components/organisms/TagModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    tagId: string;
    tagName: string;
  }>({
    isOpen: false,
    tagId: "",
    tagName: "",
  });

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tagService.getTags();
      setTags(data);
    } catch {
      toast.error("Không thể tải danh sách tag.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreate = async (name: string) => {
    await tagService.createTag(name);
    fetchTags();
  };

  const handleUpdate = async (id: string, name: string) => {
    await tagService.updateTag(id, name);
    fetchTags();
  };

  const handleDelete = async () => {
    try {
      await tagService.deleteTag(confirmConfig.tagId);
      toast.success(`Đã xoá tag "${confirmConfig.tagName}"`);
      fetchTags();
    } catch {
      toast.error("Không thể xoá tag này.");
    }
  };

  const filteredTags = tags
    .filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Tags className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý tag</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">
            Quản lý các thẻ phân loại và đặc điểm cho bất động sản.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchTags()}
            className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-sm"
          >
            <RefreshCcw className={isLoading ? "w-3.5 h-3.5 mr-2 animate-spin" : "w-3.5 h-3.5 mr-2"} />
            Làm mới
          </Button>
          <Button
            onClick={() => {
              setSelectedTag(null);
              setIsModalOpen(true);
            }}
            className="h-10 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 text-sm text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm tag
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Tìm theo tên tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 text-sm font-medium rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      {/* Tags Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-8 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Tag</th>
                <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Ngày tạo</th>
                <th className="py-4 px-8 text-right font-bold text-slate-500 uppercase tracking-widest text-[9px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-8"><Skeleton className="h-6 w-40 rounded-lg" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28 rounded-lg" /></td>
                    <td className="py-4 px-8 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="h-40 text-center text-slate-400 font-medium text-sm">
                    {search ? "Không tìm thấy tag nào khớp với tìm kiếm." : "Chưa có tag nào được tạo."}
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                          <Hash className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-[15px]">{tag.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-500">
                        {tag.createdAt
                          ? format(new Date(tag.createdAt), "dd/MM/yyyy", { locale: vi })
                          : "---"}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center">
                            <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1 border-slate-100 shadow-xl">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTag(tag);
                              setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 p-3 text-sm font-bold text-slate-600 rounded-xl cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Sửa tag
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setConfirmConfig({
                                isOpen: true,
                                tagId: tag.id,
                                tagName: tag.name,
                              })
                            }
                            className="flex items-center gap-2 p-3 text-sm font-bold text-red-500 rounded-xl cursor-pointer hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Xoá tag
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TagModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTag(null);
        }}
        tag={selectedTag}
        onCreate={handleCreate}
        onSave={handleUpdate}
      />

      <ConfirmationDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="Xác nhận xoá tag"
        description={`Bạn có chắc chắn muốn xoá tag "${confirmConfig.tagName}"? Các bất động sản đang sử dụng tag này có thể bị ảnh hưởng.`}
        variant="destructive"
        confirmText="Xoá tag"
        isLoading={isLoading}
      />
    </div>
  );
}
