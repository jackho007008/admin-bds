"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Tag } from "@/services/tagService";

const tagSchema = z.object({
  name: z.string().min(1, "Tên tag không được để trống"),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
  onCreate: (name: string) => Promise<void>;
  onSave: (id: string, name: string) => Promise<void>;
}

export function TagModal({ isOpen, onClose, tag, onCreate, onSave }: TagModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!tag;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ name: tag?.name || "" });
    }
  }, [isOpen, tag, reset]);

  const onSubmit = async (values: TagFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && tag) {
        await onSave(tag.id, values.name);
        toast.success("Cập nhật tag thành công!");
      } else {
        await onCreate(values.name);
        toast.success("Tạo tag mới thành công!");
      }
      onClose();
    } catch {
      toast.error(isEditMode ? "Cập nhật tag thất bại." : "Tạo tag thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {isEditMode ? "Chỉnh sửa tag" : "Tạo tag mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                Tên tag
              </Label>
              <Input
                placeholder="Nhập tên tag..."
                className="h-12 text-base font-medium rounded-xl border-slate-200 focus:border-emerald-500"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-slate-100 bg-slate-50/50">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold"
            >
              Huỷ bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditMode ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
