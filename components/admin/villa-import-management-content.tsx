"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VillaCreateModal } from "@/components/organisms/VillaCreateModal";
import {
  CreateOwnerModalProps,
  CreateSaleModalProps,
  DetailsTab,
  GroupedVillaRate,
  OwnerDetailsModalProps,
  OwnersSectionProps,
  SalesSectionProps,
  PricePatternConfig,
} from "./villa-import-management.types";
import { VillaImportCreateOwnerModal } from "@/components/admin/villa-import-create-owner-modal";
import { VillaImportOwnersSection } from "@/components/admin/villa-import-owners-section";
import { VillaImportSalesSection } from "@/components/admin/villa-import-sales-section";
import { VillaImportVillasSection } from "@/components/admin/villa-import-villas-section";
import { VillaImportCreateSaleModal } from "@/components/admin/villa-import-create-sale-modal";
import { villaImportService } from "@/services/villaImportService";
import type {
  Customer,
  SaleAccount,
  Villa,
} from "@/services/villaImportService";

export function VillaImportManagementContent({
  mode,
}: {
  mode: "owners" | "sales" | "villas";
}) {
  const queryClient = useQueryClient();
  const [isSheetConfigModalOpen, setIsSheetConfigModalOpen] = useState(false);
  const [isCreateOwnerModalOpen, setIsCreateOwnerModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [zaloLink, setZaloLink] = useState("");
  const [tabMonthPatterns, setTabMonthPatterns] = useState<string[]>([
    "tháng {month}/{year}",
  ]);
  const [pricePatterns, setPricePatterns] = useState<PricePatternConfig[]>([]);
  const [bookedDetectionModes, setBookedDetectionModes] = useState<string[]>([
    "cell_color",
    "price_note",
  ]);
  const [bookedCellColors, setBookedCellColors] = useState<string[]>([
    "#00a651",
  ]);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isCreateVillaModalOpen, setIsCreateVillaModalOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isCreateSaleModalOpen, setIsCreateSaleModalOpen] = useState(false);
  const [saleFullName, setSaleFullName] = useState("");
  const [saleEmail, setSaleEmail] = useState("");
  const [salePassword, setSalePassword] = useState("");

  const isOwnersMode = mode === "owners";
  const isSalesMode = mode === "sales";
  const isVillasMode = mode === "villas";
  const isCustomerMode = isOwnersMode || isVillasMode;
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["villaImportCustomers"],
    queryFn: villaImportService.listCustomers,
    enabled: isCustomerMode,
  });

  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["villaImportSales"],
    queryFn: villaImportService.listSales,
    enabled: isSalesMode,
  });

  const effectiveSelectedCustomerId =
    selectedCustomerId || (isVillasMode ? customers[0]?.id || "" : "");

  const { data: villas = [], isLoading: isLoadingVillas } = useQuery({
    queryKey: ["customerVillas", effectiveSelectedCustomerId],
    queryFn: () =>
      villaImportService.listCustomerVillas(effectiveSelectedCustomerId),
    enabled: isVillasMode && !!effectiveSelectedCustomerId,
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
  const createCustomerMutation = useMutation({
    mutationFn: (data: { name: string; notes?: string; metadata?: any }) =>
      isEditingCustomer && selectedCustomerId
        ? villaImportService.updateCustomer(selectedCustomerId, data)
        : villaImportService.createCustomer(data),
    onSuccess: () => {
      toast.success(
        isEditingCustomer ? "Đã cập nhật chủ nhà" : "Đã tạo chủ nhà mới",
      );
      setIsCreateOwnerModalOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ["villaImportCustomers"],
      });
      setCustomerName("");
      setCustomerNotes("");
      setSpreadsheetUrl("");
      setZaloLink("");
      setTabMonthPatterns(["tháng {month}/{year}"]);
      setBookedDetectionModes(["cell_color", "price_note"]);
      setBookedCellColors(["#00a651"]);
    },
    onError: (error) => {
      toast.error(
        isEditingCustomer ? "Lỗi khi cập nhật chủ nhà" : "Lỗi khi tạo chủ nhà",
      );
      console.error(error);
    },
  });

  const handleCreateCustomer = () => {
    if (!customerName.trim()) {
      toast.error("Vui lòng nhập tên chủ nhà");
      return;
    }
    createCustomerMutation.mutate({
      name: customerName.trim(),
      notes: customerNotes.trim(),
      metadata: {
        spreadsheetUrl: spreadsheetUrl.trim(),
        zaloLink: zaloLink.trim(),
        tabMonthPatterns: tabMonthPatterns.map((p) => p.trim()).filter(Boolean),
        pricePatterns: pricePatterns.filter((p) => p.pattern.trim()),
        bookedDetectionModes,
        bookedCellColors,
      },
    });
  };

  const deleteVillaMutation = useMutation({
    mutationFn: (villaId: string) =>
      villaImportService.updateVilla(villaId, { isActive: false }),
    onSuccess: () => {
      toast.success("Đã xoá villa");
      void queryClient.invalidateQueries({
        queryKey: ["customerVillas", effectiveSelectedCustomerId],
      });
    },
    onError: () => {
      toast.error("Xoá villa thất bại");
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: villaImportService.deleteCustomer,
    onSuccess: () => {
      toast.success("Đã xoá sheet thành công");
      if (selectedCustomerId === deleteCustomerMutation.variables) {
        setSelectedCustomerId("");
      }
      void queryClient.invalidateQueries({
        queryKey: ["villaImportCustomers"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["villaImportSources"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["villaImportTemplates"],
      });
    },
    onError: () => {
      toast.error("Xoá sheet thất bại");
    },
  });

  const getVillaDetailMutation = useMutation({
    mutationFn: villaImportService.getVilla,
    onSuccess: (villa) => {
      setEditingVilla(villa);
      setIsCreateVillaModalOpen(true);
    },
    onError: () => {
      toast.error("Không tải được chi tiết villa");
    },
  });

  const selectedCustomer = customers.find(
    (item) => item.id === effectiveSelectedCustomerId,
  );

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

  const openCreateOwnerModal = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomerId(customer.id);
      setCustomerName(customer.name);
      setCustomerNotes(customer.notes || "");
      setIsEditingCustomer(true);

      const metadata: any = customer.metadata || {};
      setSpreadsheetUrl(metadata.spreadsheetUrl || "");
      setZaloLink(metadata.zaloLink || "");
      setTabMonthPatterns(
        metadata.tabMonthPatterns || ["tháng {month}/{year}"],
      );
      setPricePatterns(metadata.pricePatterns || []);
      setBookedDetectionModes(
        metadata.bookedDetectionModes || ["cell_color", "price_note"],
      );
      setBookedCellColors(metadata.bookedCellColors || ["#00a651"]);
    } else {
      setSelectedCustomerId("");
      setCustomerName("");
      setCustomerNotes("");
      setSpreadsheetUrl("");
      setZaloLink("");
      setTabMonthPatterns(["tháng {month}/{year}"]);
      setPricePatterns([]);
      setBookedDetectionModes(["cell_color", "price_note"]);
      setBookedCellColors(["#00a651"]);
      setIsEditingCustomer(false);
    }
    setIsCreateOwnerModalOpen(true);
  };

  const handleSheetSaved = () => {
    void queryClient.invalidateQueries({
      queryKey: ["villaImportCustomers"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["villaImportSources"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["villaImportTemplates"],
    });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6">
        <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          {isOwnersMode ? (
            <VillaImportOwnersSection
              customers={customers}
              isLoadingCustomers={isLoadingCustomers}
              selectedCustomerId={selectedCustomerId}
              onOpenCreateOwnerModal={() => openCreateOwnerModal()}
              onSelectCustomer={(id) => {
                const customer = customers.find((c) => c.id === id);
                if (customer) openCreateOwnerModal(customer);
              }}
              onDeleteCustomer={(id) => deleteCustomerMutation.mutate(id)}
            />
          ) : null}

          {isVillasMode ? (
            <VillaImportVillasSection
              customers={customers}
              villas={villas}
              selectedCustomerId={effectiveSelectedCustomerId}
              isLoadingCustomers={isLoadingCustomers}
              isLoadingVillas={isLoadingVillas}
              onSelectCustomer={setSelectedCustomerId}
              onOpenCreateVilla={() => {
                setEditingVilla(null);
                setIsCreateVillaModalOpen(true);
              }}
              onOpenEditVilla={(villa) => {
                getVillaDetailMutation.mutate(villa.id);
              }}
              onDeleteVilla={(villa) => deleteVillaMutation.mutate(villa.id)}
              onRefreshVillas={() => {
                void queryClient.invalidateQueries({
                  queryKey: ["villaImportCustomers"],
                });
                if (effectiveSelectedCustomerId) {
                  void queryClient.invalidateQueries({
                    queryKey: ["customerVillas", effectiveSelectedCustomerId],
                  });
                }
              }}
            />
          ) : null}

          {isSalesMode ? (
            <VillaImportSalesSection
              sales={sales}
              isLoadingSales={isLoadingSales}
              onOpenCreateSaleModal={() => setIsCreateSaleModalOpen(true)}
              onRefreshSales={() => {
                void queryClient.invalidateQueries({
                  queryKey: ["villaImportSales"],
                });
              }}
            />
          ) : null}
        </div>
      </section>

      {isOwnersMode ? (
        <>
          <VillaImportCreateOwnerModal
            isOpen={isCreateOwnerModalOpen}
            onOpenChange={setIsCreateOwnerModalOpen}
            customerName={customerName}
            customerNotes={customerNotes}
            spreadsheetUrl={spreadsheetUrl}
            zaloLink={zaloLink}
            tabMonthPatterns={tabMonthPatterns}
            pricePatterns={pricePatterns}
            bookedDetectionModes={bookedDetectionModes}
            bookedCellColors={bookedCellColors}
            isEditing={isEditingCustomer}
            isSubmitting={createCustomerMutation.isPending}
            onCustomerNameChange={setCustomerName}
            onCustomerNotesChange={setCustomerNotes}
            onSpreadsheetUrlChange={setSpreadsheetUrl}
            onZaloLinkChange={setZaloLink}
            onTabMonthPatternsChange={setTabMonthPatterns}
            onPricePatternsChange={setPricePatterns}
            onBookedDetectionModesChange={setBookedDetectionModes}
            onBookedCellColorsChange={setBookedCellColors}
            onSubmit={handleCreateCustomer}
            onClose={() => setIsCreateOwnerModalOpen(false)}
          />
        </>
      ) : null}

      {isVillasMode && isCreateVillaModalOpen ? (
        <VillaCreateModal
          key={`${effectiveSelectedCustomerId || "new-villa"}-${editingVilla?.id || "create"}`}
          isOpen={isCreateVillaModalOpen}
          onClose={() => {
            setIsCreateVillaModalOpen(false);
            setEditingVilla(null);
          }}
          customerId={effectiveSelectedCustomerId || undefined}
          customerName={selectedCustomer?.name}
          villa={editingVilla}
        />
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
