"use client";

import type { ComponentProps } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AppModalContent({
  className,
  ...props
}: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0 shadow-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function AppModalHeader({
  className,
  ...props
}: ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      className={cn(
        "border-b border-slate-100 bg-slate-50/70 px-8 py-7 text-left",
        className,
      )}
      {...props}
    />
  );
}

export function AppModalTitle({
  className,
  ...props
}: ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("text-2xl font-bold text-slate-900", className)}
      {...props}
    />
  );
}

export function AppModalDescription({
  className,
  ...props
}: ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("text-base leading-7 text-slate-500", className)}
      {...props}
    />
  );
}

export function AppModalBody({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("space-y-5 px-8 py-7", className)} {...props} />;
}

export function AppModalFooter({
  className,
  ...props
}: ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "border-t border-slate-100 bg-slate-50/70 px-8 py-6 sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}
