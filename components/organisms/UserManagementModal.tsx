"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminUser, Role } from "@/types/user";
import { userService, Department } from "@/services/userService";
import { toast } from "sonner";
import { Loader2, Save, X, ShieldAlert, UserX, RotateCcw, Building2, MapPin, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";

const userSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  role: z.string(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional().or(z.literal("")),
  departmentId: z.string().optional().nullable(),
  provinceId: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
  maxHiddenInfoViewsPerDay: z.number().optional().nullable(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserManagementModalProps {
  user: AdminUser | null;
  currentUserRole?: string;
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<AdminUser>) => Promise<void>;
  onCreate?: (data: any) => Promise<void>;
  onRevokeSessions?: (id: string) => Promise<void>;
}

const ROLES: { value: Role; label: string }[] = [
  { value: "DAU_CHU", label: "Đầu chủ" },
  { value: "DAU_KHACH", label: "Đầu khách" },
  { value: "TRUONG_PHONG", label: "Trưởng phòng" },
  { value: "GIAM_DOC_KD", label: "GĐ kinh doanh" },
  { value: "GD_KHOI", label: "GĐ khối" },
  { value: "ADMIN", label: "Quản trị viên" },
];

export function UserManagementModal({ 
  user, 
  currentUserRole,
  mode,
  isOpen, 
  onClose, 
  onSave, 
  onCreate,
  onRevokeSessions 
}: UserManagementModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "DAU_KHACH",
      password: "",
      departmentId: "",
      provinceId: 50,
      isActive: true,
      maxHiddenInfoViewsPerDay: null,
    },
  });

  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = React.useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      setIsLoadingDepts(true);
      try {
        const data = await userService.getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Fetch depts error:", error);
      } finally {
        setIsLoadingDepts(false);
      }
    };

    if (isOpen) {
      fetchDepts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === "edit" && user && isOpen) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
        departmentId: user.department?.id || "",
        // provinceId is handled by backend or not explicitly in this UI yet, matching mobile app defaults
        provinceId: 50, 
        maxHiddenInfoViewsPerDay: user.maxHiddenInfoViewsPerDay,
      });
    } else if (mode === "create" && isOpen) {
      reset({
        fullName: "",
        email: "",
        phone: "",
        role: "DAU_KHACH",
        password: "",
        departmentId: "",
        provinceId: 50,
        isActive: true,
      });
    }
  }, [user, mode, isOpen, reset]);

  const filteredRoles = React.useMemo(() => {
    let roles = ROLES.filter(r => r.value !== 'ADMIN');
    
    if (currentUserRole === 'GD_KHOI') {
      roles = roles.filter(r => r.value !== 'GD_KHOI');
    } else if (currentUserRole === 'TRUONG_PHONG') {
      roles = roles.filter(r => r.value !== 'GD_KHOI' && r.value !== 'TRUONG_PHONG');
    }
    
    return roles;
  }, [currentUserRole]);

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      if (mode === "edit" && user) {
        await onSave(user.id, values as any);
        toast.success("Cập nhật thông tin người dùng thành công!");
      } else if (mode === "create" && onCreate) {
        if (!values.password) {
          toast.error("Vui lòng nhập mật khẩu cho người dùng mới.");
          setIsSubmitting(false);
          return;
        }
        await onCreate(values);
        toast.success("Tạo người dùng mới thành công!");
      }
      onClose();
    } catch (error: any) {
      console.error("Submit error:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (!user) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận đăng xuất từ xa",
      description: "Bạn có chắc chắn muốn đăng xuất tài khoản này khỏi tất cả các thiết bị không?",
      variant: "destructive",
      onConfirm: async () => {
        setIsRevoking(true);
        try {
          await onRevokeSessions?.(user.id);
          toast.success("Đã đăng xuất tài khoản khỏi tất cả các thiết bị!");
        } catch {
          toast.error("Không thể đăng xuất từ xa.");
        } finally {
          setIsRevoking(false);
        }
      }
    });
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const action = user.isActive ? "Khoá" : "Mở khoá";
    
    setConfirmConfig({
      isOpen: true,
      title: `Xác nhận ${action.toLowerCase()} tài khoản`,
      description: `Bạn có chắc muốn ${action.toLowerCase()} tài khoản này không?`,
      variant: user.isActive ? "destructive" : "default",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await onSave(user.id, { isActive: !user.isActive } as any);
          toast.success(`Đã ${action.toLowerCase()} tài khoản thành công!`);
        } catch {
          toast.error(`Không thể ${action.toLowerCase()} tài khoản.`);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="p-8 pb-6 border-b border-slate-50 bg-slate-50/50">
          <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
            {mode === "create" ? "Thêm người dùng mới" : "Quản lý tài khoản người dùng"}
          </DialogTitle>
          <p className="text-sm text-slate-400 font-medium">
            {mode === "create" ? "Điền thông tin để tạo tài khoản thành viên" : "Cập nhật quyền hạn và trạng thái tài khoản"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-8 space-y-8">
            {/* User Profile Summary - Only in Edit mode */}
            {mode === "edit" && user && (
              <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <Avatar className="h-20 w-20 border-4 border-white shadow-md ring-1 ring-slate-100">
                  <AvatarImage src={user.avatarUrl || ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {user.fullName.split(" ").pop()?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900">{user.fullName}</h3>
                  <p className="text-sm text-slate-400 font-medium">#{user.id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={user.isActive ? "text-emerald-500 font-bold text-xs flex items-center gap-1" : "text-red-500 font-bold text-xs flex items-center gap-1"}>
                      {user.isActive ? <RotateCcw className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {user.isActive ? "Đang hoạt động" : "Bị khoá"}
                    </span>
                    <Separator orientation="vertical" className="h-3 bg-slate-300" />
                    <span className="text-slate-400 font-bold text-xs">{ROLES.find(r => r.value === user.role)?.label}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Họ và tên</Label>
                <Input className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" {...register("fullName")} />
                {errors.fullName && <p className="text-red-500 text-xs px-1">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Chức vụ / Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} items={ROLES}>
                      <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                        <SelectValue placeholder="Chọn chức vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email</Label>
                <Input 
                  className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" 
                  {...register("email")} 
                  disabled={mode === "edit"} // Email usually shouldn't be changed after creation
                />
                {errors.email && <p className="text-red-500 text-xs px-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Số điện thoại</Label>
                <Input className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs px-1">{errors.phone.message}</p>}
              </div>

              {mode === "create" && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Mật khẩu
                  </Label>
                  <Input 
                    type="password"
                    className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" 
                    {...register("password")} 
                  />
                  {errors.password && <p className="text-red-500 text-xs px-1">{errors.password.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Khu vực
                </Label>
                <Controller
                  control={control}
                  name="provinceId"
                  render={({ field }) => (
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val ?? "50"))} 
                      value={field.value?.toString() ?? "50"}
                      items={[
                        { value: "50", label: "Thành phố Hồ Chí Minh" },
                        { value: "32", label: "Thành phố Đà Nẵng" }
                      ]}
                    >
                      <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">Thành phố Hồ Chí Minh</SelectItem>
                        <SelectItem value="32">Thành phố Đà Nẵng</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Phòng ban
                </Label>
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={(field.value ?? "").toString()}
                      items={departments.map(d => ({ value: d.id, label: d.name }))}
                    >
                      <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                        <SelectValue placeholder={isLoadingDepts ? "Đang tải..." : "Chọn phòng ban"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Không có</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> GH lượt xem ẩn / ngày
                </Label>
                <Input 
                  type="number"
                  placeholder="Mặc định (theo hệ thống)"
                  className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" 
                  {...register("maxHiddenInfoViewsPerDay", { 
                    setValueAs: (v) => v === "" ? null : parseInt(v, 10) 
                  })} 
                />
                <p className="text-[10px] text-slate-400 px-1 font-medium italic">
                  * Để trống để sử dụng cấu hình chung của hệ thống.
                </p>
              </div>
            </div>

            <Separator className="bg-slate-50" />

            {/* Advanced Actions - Only in Edit mode */}
            {mode === "edit" && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Thao tác nâng cao</Label>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleToggleStatus}
                    className={user?.isActive ? "py-6 px-6 h-14 flex-1 rounded-xl font-bold border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer" : "py-6 px-6 h-14 flex-1 rounded-xl font-bold border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer"}
                  >
                    {user?.isActive ? <><UserX className="mr-2 h-5 w-5" /> Khoá tài khoản</> : <><RotateCcw className="mr-2 h-5 w-5" /> Mở khoá tài khoản</>}
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isRevoking}
                    onClick={handleRevokeSessions}
                    className="py-6 px-6 h-14 flex-1 rounded-xl font-bold border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
                  >
                    {isRevoking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldAlert className="mr-2 h-5 w-5" />} Đăng xuất từ xa
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="py-6 px-8 h-14 rounded-xl font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-100"
            >
              <X className="mr-2 h-5 w-5" /> Đóng
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="py-6 px-12 h-14 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} 
              {mode === "create" ? "Tạo người dùng" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ConfirmationDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        isLoading={isSubmitting || isRevoking}
      />
    </Dialog>
  );
}
