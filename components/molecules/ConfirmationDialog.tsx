"use client";

import React from "react";
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
import { Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[2rem] p-6">
        <AlertDialogHeader className="sm:text-center">
          <AlertDialogTitle className="text-xl font-bold text-slate-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 flex gap-3 sm:justify-center">
          <AlertDialogCancel onClick={onClose} className="py-6 px-6 h-12 rounded-xl border-slate-200">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isLoading}
            className={`py-6 px-8 h-12 rounded-xl font-bold shadow-lg transition-all ${
              variant === "destructive" 
                ? "bg-red-500 hover:bg-red-600 shadow-red-200" 
                : "bg-primary hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
