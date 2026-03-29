"use client";

import { useRouter } from "next/navigation";
import { LoginTemplate } from "@/components/templates/LoginTemplate";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: ({ email, pass }: { email: string; pass: string }) => 
      authService.login(email, pass),
    onSuccess: (data) => {
      const { user, access_token } = data;
      
      if (user.role !== 'ADMIN') {
        toast.error("Chỉ tài khoản Admin mới được phép đăng nhập trang quản trị.");
        return;
      }

      setAuth(user, access_token);
      
      toast.success("Đăng nhập thành công!");
      router.replace("/admin");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message[0] : (message || "Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.");
      toast.error(errorMsg);
    }
  });

  const handleLogin = async (email: string, pass: string) => {
    if (!email || !pass) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    loginMutation.mutate({ email, pass });
  };


  return (
    <LoginTemplate 
      onLogin={handleLogin} 
      isLoading={loginMutation.isPending} 
    />
  );
}
