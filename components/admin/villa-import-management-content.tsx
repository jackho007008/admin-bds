"use client";

import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { VillaSheetImportModal } from "@/components/organisms/VillaSheetImportModal";
import { CustomerAccountModal } from "@/components/organisms/CustomerAccountModal";
import { VillaImportOwnersSection } from "@/components/admin/villa-import-owners-section";
import { VillaImportSalesSection } from "@/components/admin/villa-import-sales-section";
import { VillaImportCreateOwnerModal } from "@/components/admin/villa-import-create-owner-modal";
import { VillaImportCreateSaleModal } from "@/components/admin/villa-import-create-sale-modal";
import { VillaImportOwnerDetailsModal } from "@/components/admin/villa-import-owner-details-modal";
import type {
  DetailsTab,
  GroupedVillaRate,
} from "@/components/admin/villa-import-management.types";
import { villaImportService } from "@/services/villaImportService";

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const message = axiosError.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] || fallback;
  }

  return message || fallback;
}

export function VillaImportManagementContent({
  mode,
}: {
  mode: "owners" | "sales";
}) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isCreateOwnerModalOpen, setIsCreateOwnerModalOpen] = useState(false);
  const [isSheetConfigModalOpen, setIsSheetConfigModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [customerAccountEmail, setCustomerAccountEmail] = useState("");
  const [customerAccountPassword, setCustomerAccountPassword] = useState("");
  const [customerAccountFullName, setCustomerAccountFullName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [expandedVillaId, setExpandedVillaId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState<DetailsTab>("villas");
  const [isCreateSaleModalOpen, setIsCreateSaleModalOpen] = useState(false);
  const [saleFullName, setSaleFullName] = useState("");
  const [saleEmail, setSaleEmail] = useState("");
  const [salePassword, setSalePassword] = useState("");

  const isOwnersMode = mode === "owners";
  const isSalesMode = mode === "sales";
  const isOwnerAccount = user?.role === "DAU_CHU";

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["villaImportCustomers"],
    queryFn: villaImportService.listCustomers,
    enabled: isOwnersMode && !isOwnerAccount,
  });

  const { data: myVillas = [], isLoading: isLoadingMyVillas } = useQuery({
    queryKey: ["myVillaImportVillas"],
    queryFn: villaImportService.listMyVillas,
    enabled: isOwnersMode && isOwnerAccount,
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

  const resetCreateOwnerForm = () => {
    setCustomerName("");
    setCustomerNotes("");
    setCustomerAccountEmail("");
    setCustomerAccountPassword("");
    setCustomerAccountFullName("");
  };

  const createCustomerMutation = useMutation({
    mutationFn: villaImportService.createCustomer,
    onSuccess: (customer) => {
      toast.success("Đã tạo chủ villa");
      resetCreateOwnerForm();
      setSelectedCustomerId(customer.id);
      setIsCreateOwnerModalOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ["villaImportCustomers"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Tạo chủ villa thất bại"));
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

  const selectedCustomer = customers.find((item) => item.id === selectedCustomerId);

  const groupedRates = useMemo(() => {
    const grouped = new Map<string, GroupedVillaRate>();

    for (const rate of rates) {
      const current = grouped.get(rate.villaId);

      if (!current) {
        grouped.set(rate.villaId, {
          villaId: rate.villaId,
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

    const email = customerAccountEmail.trim();
    const password = customerAccountPassword.trim();

    if ((email && !password) || (!email && password)) {
      toast.error("Nhập đủ tài khoản và mật khẩu nếu muốn tạo luôn tài khoản");
      return;
    }

    if (email && !customerAccountFullName.trim()) {
      setCustomerAccountFullName(customerName.trim());
    }

    createCustomerMutation.mutate(
      {
        name: customerName.trim(),
        notes: customerNotes.trim() || undefined,
      },
      {
        onSuccess: async (customer) => {
          if (email && password) {
            try {
              await villaImportService.createCustomerAccount(customer.id, {
                email,
                password,
                fullName: customerAccountFullName.trim() || customerName.trim(),
              });
              toast.success("Đã tạo chủ villa và tài khoản đăng nhập");
            } catch (error) {
              toast.error(
                getErrorMessage(
                  error,
                  "Đã tạo chủ villa nhưng chưa tạo được tài khoản",
                ),
              );
            }
          }
        },
      },
    );
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

    createSaleMutation.mutate(
      {
        fullName: saleFullName.trim(),
        email: saleEmail.trim(),
        password: salePassword,
      },
      {
        onSuccess: () => {
          setIsCreateSaleModalOpen(false);
        },
      },
    );
  };

  const openDetailsModal = (customerId: string, tab: DetailsTab) => {
    setSelectedCustomerId(customerId);
    setDetailsTab(tab);
    setExpandedVillaId(null);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6">
        <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          {isOwnersMode ? (
            isOwnerAccount ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Danh sách villa
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Đây là các villa đang thuộc quyền quản lý của bạn.
                  </p>
                </div>

                <div className="space-y-3">
                  {isLoadingMyVillas ? (
                    <div className="text-sm text-slate-500">
                      Đang tải danh sách villa...
                    </div>
                  ) : myVillas.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                      Bạn chưa có villa nào được import.
                    </div>
                  ) : (
                    myVillas.map((villa) => (
                      <div
                        key={villa.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="font-semibold text-slate-900">
                          {villa.name}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          Sheet: {villa.sourceSheetName || "N/A"} • Ô nguồn:{" "}
                          {villa.sourceCellRef || "N/A"}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Giá gần nhất:{" "}
                          {villa.latestRate?.price
                            ? villa.latestRate.price.toLocaleString("vi-VN")
                            : "Chưa có giá"}
                        </div>
                        {villa.latestRate?.stayDate ? (
                          <div className="mt-1 text-xs text-slate-500">
                            Ngày áp dụng gần nhất: {villa.latestRate.stayDate}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <VillaImportOwnersSection
                customers={customers}
                isLoadingCustomers={isLoadingCustomers}
                selectedCustomerId={selectedCustomerId}
                onOpenCreateOwnerModal={() => setIsCreateOwnerModalOpen(true)}
                onSelectCustomer={setSelectedCustomerId}
                onOpenSheetConfig={(customerId) => {
                  setSelectedCustomerId(customerId);
                  setIsSheetConfigModalOpen(true);
                }}
                onOpenAccount={(customerId) => {
                  setSelectedCustomerId(customerId);
                  setIsAccountModalOpen(true);
                }}
                onOpenDetails={openDetailsModal}
              />
            )
          ) : null}

          {isSalesMode ? (
            <VillaImportSalesSection
              sales={sales}
              isLoadingSales={isLoadingSales}
              onOpenCreateSaleModal={() => setIsCreateSaleModalOpen(true)}
            />
          ) : null}
        </div>
      </section>

      {isOwnersMode && !isOwnerAccount ? (
        <>
          <VillaImportCreateOwnerModal
            isOpen={isCreateOwnerModalOpen}
            customerName={customerName}
            customerNotes={customerNotes}
            customerAccountEmail={customerAccountEmail}
            customerAccountPassword={customerAccountPassword}
            customerAccountFullName={customerAccountFullName}
            isSubmitting={createCustomerMutation.isPending}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateOwnerModalOpen(false);
                resetCreateOwnerForm();
                return;
              }
              setIsCreateOwnerModalOpen(true);
            }}
            onCustomerNameChange={setCustomerName}
            onCustomerNotesChange={setCustomerNotes}
            onCustomerAccountEmailChange={setCustomerAccountEmail}
            onCustomerAccountPasswordChange={setCustomerAccountPassword}
            onCustomerAccountFullNameChange={setCustomerAccountFullName}
            onSubmit={handleCreateCustomer}
            onClose={() => {
              setIsCreateOwnerModalOpen(false);
              resetCreateOwnerForm();
            }}
          />

          <VillaImportOwnerDetailsModal
            isOpen={isDetailsModalOpen}
            selectedCustomerName={selectedCustomer?.name}
            selectedCustomerId={selectedCustomerId}
            detailsTab={detailsTab}
            isLoadingVillas={isLoadingVillas}
            villas={villas}
            isLoadingRates={isLoadingRates}
            rates={rates}
            groupedRates={groupedRates}
            expandedVillaId={expandedVillaId}
            onOpenChange={setIsDetailsModalOpen}
            onTabChange={setDetailsTab}
            onExpandedVillaChange={(villaId) =>
              setExpandedVillaId((current) =>
                current === villaId ? null : villaId,
              )
            }
          />

          <VillaSheetImportModal
            isOpen={isSheetConfigModalOpen}
            onClose={() => setIsSheetConfigModalOpen(false)}
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

      {isSalesMode ? (
        <VillaImportCreateSaleModal
          isOpen={isCreateSaleModalOpen}
          saleFullName={saleFullName}
          saleEmail={saleEmail}
          salePassword={salePassword}
          isSubmitting={createSaleMutation.isPending}
          onOpenChange={setIsCreateSaleModalOpen}
          onSaleFullNameChange={setSaleFullName}
          onSaleEmailChange={setSaleEmail}
          onSalePasswordChange={setSalePassword}
          onSubmit={handleCreateSale}
          onClose={() => setIsCreateSaleModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
