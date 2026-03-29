"use client";

import { useState } from "react";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      <FormField
        label="Email"
        type="email"
        placeholder="admin@example.com"
        value={email}
        onChange={setEmail}
        required
      />
      <FormField
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        required
      />
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-lg shadow-sm transition-all active:scale-95"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          "Đăng nhập"
        )}
      </Button>
    </form>
  );
}
