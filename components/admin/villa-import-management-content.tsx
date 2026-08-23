"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { VillaSheetImportModal } from "@/components/organisms/VillaSheetImportModal";
import { CustomerAccountModal } from "@/components/organisms/CustomerAccountModal";
import { villaImportService } from "@/services/villaImportService";
import {
  CalendarRange,
  ChevronDown,
  DatabaseZap,
  Grid2X2,
  KeyRound,
  Loader2,
  Mail,
  Sheet,
  ShieldCheck,
  Users,
} from "lucide-react";

const highlights = [
  {
    title: "Tạo chủ villa trước",
    description:
      "Mỗi file sheet sẽ đi theo một chủ villa riêng để quản lý danh sách villa rõ ràng.",
    icon: Users,
  },
  {
    title: "Chọn row hoặc column",
    description:
      "Bạn chọn đúng hàng hoặc cột tên villa, backend sẽ đọc Google Sheet và upsert theo ô nguồn.",
    icon: Grid2X2,
  },
  {
    title: "Lưu source cell",
    description:
      "Mỗi villa được gắn với ô như E6 hoặc A12 để tránh upsert sai theo tên.",
    icon: DatabaseZap,
  },
];

export function VillaImportManagementContent({
  mode,
}: {
  mode: "owners" | "sales";
}) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [expandedVillaId, setExpandedVillaId] = useState<string | null>(null);
  const [saleFullName, setSaleFullName] = useState("");
  const [saleEmail, setSaleEmail] = useState("");
  const [salePassword, setSalePassword] = useState("");

  const isOwnersMode = mode === "owners";
  const isSalesMode = mode === "sales";

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["villaImportCustomers"],
    queryFn: villaImportService.listCustomers,
    enabled: isOwnersMode,
  });

  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["villaImportSales"],
    queryFn: villaImportService.listSales,
    enabled: isSalesMode,
  });

  const { data: villas = [], isLoading: isLoadingVillas } = useQuery({
    queryKey: ["customerVillas", selectedCustomerId],
    queryFn: () => villaImportService.listCustomerVillas(selectedCustomerId),
    enabled: isOwnersMode && !!selectedCustomerId,
  });

  const { data: rates = [], isLoading: isLoadingRates } = useQuery({
    queryKey: ["customerRates", selectedCustomerId],
    queryFn: () => villaImportService.listCustomerRates(selectedCustomerId),
    enabled: isOwnersMode && !!selectedCustomerId,
  });

  const { data: customerAccountStatus } = useQuery({
    queryKey: ["customerAccount", selectedCustomerId],
    queryFn: () => villaImportService.getCustomerAccount(selectedCustomerId),
    enabled: isOwnersMode && !!selectedCustomerId,
  });

  const createCustomerMutation = useMutation({
    mutationFn: villaImportService.createCustomer,
    onSuccess: (customer) => {
      toast.success("Đã tạo chủ villa");
      setCustomerName("");
      setCustomerNotes("");
      setSelectedCustomerId(customer.id);
      void queryClient.invalidateQueries({
        queryKey: ["villaImportCustomers"],
      });
    },
    onError: () => {
      toast.error("Tạo chủ villa thất bại");
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: villaImportService.createSale,
    onSuccess: () => {
      toast.success("Đã tạo sale");
      setSaleFullName("");
      setSaleEmail("");
      setSalePassword("");
      void queryClient.invalidateQueries({
        queryKey: ["villaImportSales"],
      });
    },
    onError: () => {
      toast.error("Tạo sale thất bại");
    },
  });

  const selectedCustomer = customers.find(
    (item) => item.id === selectedCustomerId,
  );

  const groupedRates = useMemo(() => {
    const grouped = new Map<
      string,
      {
        villaId: string;
        villaName: string;
        monthValue: string | null;
        sheetName: string;
        rates: typeof rates;
      }
    >();

    for (const rate of rates) {
      const villaId = rate.villaId;
      const current = grouped.get(villaId);

      if (!current) {
        grouped.set(villaId, {
          villaId,
          villaName: rate.villa?.name || "Villa",
          monthValue: rate.monthValue || null,
          sheetName: rate.sourceSheetName,
          rates: [rate],
        });
        continue;
      }

      current.rates.push(rate);
      if (!current.monthValue && rate.monthValue) {
        current.monthValue = rate.monthValue;
      }
    }

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        rates: [...group.rates].sort((a, b) => {
          if (a.stayDate && b.stayDate) {
            return a.stayDate.localeCompare(b.stayDate);
          }

          return Number(a.dayLabel) - Number(b.dayLabel);
        }),
      }))
      .sort((a, b) => a.villaName.localeCompare(b.villaName, "vi"));
  }, [rates]);

  const handleCreateCustomer = () => {
    if (!customerName.trim()) {
      toast.error("Nhập tên chủ villa trước");
      return;
    }

    createCustomerMutation.mutate({
      name: customerName.trim(),
      notes: customerNotes.trim() || undefined,
    });
  };

  const handleCreateSale = () => {
    if (!saleFullName.trim()) {
      toast.error("Nhập tên sale trước");
      return;
    }

    if (!saleEmail.trim()) {
      toast.error("Nhập email sale");
      return;
    }

    if (!salePassword.trim()) {
      toast.error("Nhập mật khẩu sale");
      return;
    }

    createSaleMutation.mutate({
      fullName: saleFullName.trim(),
      email: saleEmail.trim(),
      password: salePassword,
    });
  };

  return (
    <div className="space-y-8">
      {isOwnersMode ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="grid gap-6">
        <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          {isOwnersMode ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  1. Tạo chủ villa
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Mỗi chủ villa sẽ có một danh sách villa riêng.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Tên chủ villa</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Tracy Trips"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerNotes">Ghi chú</Label>
                  <Textarea
                    id="customerNotes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Nguồn sheet, nhóm sales, ghi chú thêm..."
                  />
                </div>
                <Button
                  onClick={handleCreateCustomer}
                  disabled={createCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Tạo chủ villa
                </Button>
              </div>

              <Separator />

              <div>
                {selectedCustomer ? (
                  <div className="mb-5 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-medium text-emerald-700">
                          Chủ villa đang chọn
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          {selectedCustomer.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {customerAccountStatus?.hasAccount
                            ? `Tài khoản: ${customerAccountStatus.account?.email}`
                            : "Chưa có tài khoản đăng nhập cho chủ villa này"}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="rounded-2xl"
                        >
                          <Sheet className="mr-2 h-4 w-4" />
                          Mở modal cài đặt
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAccountModalOpen(true)}
                          className="rounded-2xl"
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          {customerAccountStatus?.hasAccount
                            ? "Reset mật khẩu"
                            : "Thiết lập tài khoản"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <h3 className="text-base font-semibold text-slate-900">
                  Chủ villa hiện có
                </h3>
                <div className="mt-4 space-y-3">
                  {isLoadingCustomers ? (
                    <div className="text-sm text-slate-500">
                      Đang tải chủ villa...
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Chưa có chủ villa nào.
                    </div>
                  ) : (
                    customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                          selectedCustomerId === customer.id
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-semibold text-slate-900">
                          {customer.name}
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant="secondary"
                            className={
                              customer.accountUser
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }
                          >
                            {customer.accountUser
                              ? customer.accountUser.email
                              : "Chưa có tài khoản"}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {customer.notes || "Không có ghi chú"}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Villa đã lưu cho chủ villa
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {!selectedCustomerId ? (
                    <div className="text-sm text-slate-500">
                      Chọn chủ villa để xem danh sách villa.
                    </div>
                  ) : isLoadingVillas ? (
                    <div className="text-sm text-slate-500">
                      Đang tải danh sách villa...
                    </div>
                  ) : villas.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Chủ villa này chưa có villa nào.
                    </div>
                  ) : (
                    villas.map((villa) => (
                      <div
                        key={villa.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="font-semibold text-slate-900">
                          {villa.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Ô nguồn: {villa.sourceCellRef || "N/A"} • Sheet:{" "}
                          {villa.sourceSheetName || "N/A"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Dữ liệu giá đã lưu
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {!selectedCustomerId ? (
                    <div className="text-sm text-slate-500">
                      Chọn chủ villa để xem dữ liệu giá theo ngày.
                    </div>
                  ) : isLoadingRates ? (
                    <div className="text-sm text-slate-500">
                      Đang tải dữ liệu giá...
                    </div>
                  ) : rates.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Chủ villa này chưa có dữ liệu giá nào.
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        Đã lưu {rates.length} dòng giá cho{" "}
                        {groupedRates.length} villa.
                      </div>
                      {groupedRates.map((group) => {
                        const isExpanded = expandedVillaId === group.villaId;
                        const latestRate = group.rates[0];

                        return (
                          <div
                            key={group.villaId}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedVillaId((current) =>
                                  current === group.villaId
                                    ? null
                                    : group.villaId,
                                )
                              }
                              className="flex w-full items-start justify-between gap-4 p-5 text-left"
                            >
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {group.villaName}
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                  {group.monthValue
                                    ? `Tháng ${group.monthValue}`
                                    : "Chưa rõ tháng"}{" "}
                                  • {group.rates.length} ngày có dữ liệu
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  Sheet: {group.sheetName} • Giá gần nhất:{" "}
                                  {latestRate?.price
                                    ? latestRate.price.toLocaleString("vi-VN")
                                    : "Không có giá"}
                                </div>
                              </div>
                              <ChevronDown
                                className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isExpanded ? (
                              <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                  {group.rates.map((rate) => (
                                    <div
                                      key={rate.id}
                                      className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                                    >
                                      <div className="font-semibold text-slate-900">
                                        {rate.stayDate ||
                                          `${rate.monthValue || "N/A"} / ${rate.dayLabel}`}
                                      </div>
                                      <div className="mt-2 text-sm text-slate-600">
                                        Giá:{" "}
                                        {rate.price
                                          ? rate.price.toLocaleString("vi-VN")
                                          : "Không có giá"}
                                      </div>
                                      <div className="mt-1 text-sm text-slate-600">
                                        Raw: {rate.rawValue}
                                      </div>
                                      {rate.note ? (
                                        <div className="mt-1 text-xs text-slate-500">
                                          Ghi chú: {rate.note}
                                        </div>
                                      ) : null}
                                      <div className="mt-2 text-xs text-slate-500">
                                        Ô nguồn: {rate.sourceCellRef}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {isSalesMode ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Quản lý sales
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Sale được tạo ở đây sẽ dùng role{" "}
                  <span className="font-semibold">TRUONG_PHONG</span>.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="saleFullName">Tên sale</Label>
                  <Input
                    id="saleFullName"
                    value={saleFullName}
                    onChange={(e) => setSaleFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleEmail">Email đăng nhập</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="saleEmail"
                      value={saleEmail}
                      onChange={(e) => setSaleEmail(e.target.value)}
                      placeholder="sale@villabooking.vn"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePassword">Mật khẩu</Label>
                  <Input
                    id="salePassword"
                    type="password"
                    value={salePassword}
                    onChange={(e) => setSalePassword(e.target.value)}
                    placeholder="Nhập mật khẩu ban đầu"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateSale}
                disabled={createSaleMutation.isPending}
              >
                {createSaleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Tạo sale
              </Button>

              <Separator />

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Sale hiện có
                </h3>
                <div className="mt-4 space-y-3">
                  {isLoadingSales ? (
                    <div className="text-sm text-slate-500">
                      Đang tải sale...
                    </div>
                  ) : sales.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Chưa có sale nào.
                    </div>
                  ) : (
                    sales.map((sale) => (
                      <div
                        key={sale.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {sale.fullName}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {sale.email}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {isOwnersMode ? (
        <>
          <VillaSheetImportModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            customerId={selectedCustomerId || undefined}
            customerName={selectedCustomer?.name}
            onImported={() => {
              void queryClient.invalidateQueries({
                queryKey: ["customerVillas", selectedCustomerId],
              });
              void queryClient.invalidateQueries({
                queryKey: ["customerRates", selectedCustomerId],
              });
            }}
          />
          <CustomerAccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            customerId={selectedCustomerId || undefined}
            customerName={selectedCustomer?.name}
            accountStatus={customerAccountStatus}
          />
        </>
      ) : null}
    </div>
  );
}
