"use client";

import React from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, Building2 } from "lucide-react";
import { Department } from "@/services/departmentService";
import { toast } from "sonner";

const departmentSchema = z.object({
  name: z.string().min(2, "Tên phòng ban phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: DepartmentFormValues) => Promise<void>;
  onCreate: (data: DepartmentFormValues) => Promise<void>;
}

export function DepartmentModal({
  department,
  isOpen,
  onClose,
  onSave,
  onCreate,
}: DepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (department) {
        reset({
          name: department.name,
          description: department.description || "",
        });
      } else {
        reset({
          name: "",
          description: "",
        });
      }
    }
  }, [isOpen, department, reset]);

  const onSubmit = async (values: DepartmentFormValues) => {
    setIsSubmitting(true);
    try {
      if (department) {
        await onSave(department.id, values);
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await onCreate(values);
        toast.success("Tạo phòng ban mới thành công!");
      }
      onClose();
    } catch {
      toast.error(department ? "Không thể cập nhật phòng ban." : "Không thể tạo phòng ban.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {department ? "Cập nhật phòng ban" : "Thêm phòng ban mới"}
              </DialogTitle>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {department ? "Chỉnh sửa thông tin phòng ban hiện có." : "Tạo một phòng ban mới trong hệ thống."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold ml-1">Tên phòng ban</Label>
            <Input 
              {...register("name")}
              placeholder="Nhập tên phòng ban (VD: Phòng Kinh Doanh...)" 
              className="py-6 h-14 text-base font-medium rounded-xl border-slate-200 bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all shadow-sm"
            />
            {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold ml-1 text-sm">Mô tả (Tuỳ chọn)</Label>
            <Textarea 
              {...register("description")}
              placeholder="Nhập mô tả về phòng ban này..." 
              className="min-h-[120px] rounded-xl border-slate-200 bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all shadow-sm p-4 text-sm font-medium resize-none"
            />
            {errors.description && <p className="text-red-500 text-xs font-bold ml-1">{errors.description.message}</p>}
          </div>

          <DialogFooter className="pt-4 gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="py-6 px-8 h-12 rounded-xl border-slate-200 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Huỷ bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="py-6 px-10 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm text-white"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {department ? "Cập nhật" : "Tạo phòng ban"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
