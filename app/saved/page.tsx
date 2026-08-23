"use client";

import { Heart } from "lucide-react";
import { CustomerShell } from "@/components/customer/CustomerShell";

export default function SavedPage() {
  return (
    <CustomerShell>
      <section className="mx-auto flex min-h-[calc(100vh-148px)] max-w-6xl items-center justify-center px-6 py-10">
        <div className="max-w-5xl text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-rose-50 p-6 text-rose-500 shadow-sm">
              <Heart className="h-14 w-14 fill-current" strokeWidth={1.8} />
            </div>
          </div>

          <h2 className="mt-8 text-5xl font-medium tracking-[-0.03em] text-slate-500">
            Chưa có villa yêu thích
          </h2>

          <p className="mx-auto mt-6 max-w-5xl text-[26px] leading-[1.55] text-slate-500">
            Ở kết quả tìm kiếm, bấm nút ... của villa rồi chọn{" "}
            <span className="font-semibold text-slate-700">
              &#34;Thêm vào yêu thích&#34;
            </span>{" "}
            — villa sẽ hiện ở đây trên mọi thiết bị bạn đang đăng nhập.
          </p>
        </div>
      </section>
    </CustomerShell>
  );
}
