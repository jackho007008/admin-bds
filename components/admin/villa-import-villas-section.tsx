"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import type { Customer, Villa } from "@/services/villaImportService";
import {
  Check,
  ChevronDown,
  Edit,
  Home,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Sheet,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
import { VillaPriceCalendarModal } from "../organisms/VillaPriceCalendarModal";

type VillasSectionProps = {
  customers: Customer[];
  villas: Villa[];
  selectedCustomerId: string;
  isLoadingCustomers: boolean;
  isLoadingVillas: boolean;
  onSelectCustomer: (customerId: string) => void;
  onOpenCreateVilla: () => void;
  onOpenEditVilla: (villa: Villa) => void;
  onDeleteVilla: (villa: Villa) => void;
  onOpenConfigSpecialMonths: (villa: Villa) => void;
  onRefreshVillas: () => void;
};

function SearchableSheetSelect({
  customers,
  selectedCustomerId,
  isLoadingCustomers,
  onSelectCustomer,
}: {
  customers: Customer[];
  selectedCustomerId: string;
  isLoadingCustomers: boolean;
  onSelectCustomer: (customerId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(keyword));
  }, [customers, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Sheet className="h-4 w-4 shrink-0 text-emerald-600" />
          <span
            className={
              selectedCustomer
                ? "truncate font-medium text-slate-900"
                : "truncate text-slate-400"
            }
          >
            {selectedCustomer?.name ||
              (isLoadingCustomers ? "Đang tải sheet..." : "Chọn sheet")}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[300px] rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sheet..."
              className="h-10 rounded-xl pl-9 pr-8 text-sm border-slate-200 focus-visible:ring-emerald-500/20"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 p-1">
            {filteredCustomers.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                Không tìm thấy sheet nào
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const isSelected = selectedCustomerId === customer.id;
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      onSelectCustomer(customer.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-emerald-50 font-medium text-emerald-700"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <span className="truncate">{customer.name}</span>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getVillaInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "V";
}

function readMetadataText(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "";
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(value?: string) {
  if (!value) {
    return "---";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}

function matchesVillaSearch(villa: Villa, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return [
    villa.name,
    villa.id,
    villa.priceZone,
    villa.sourceCellRef,
    villa.sourceSheetName,
    readMetadataText(villa.metadata, "googleMapsUrl"),
    readMetadataText(villa.metadata, "zaloLink"),
    villa.province?.name || villa.provinceName,
    villa.district?.name || villa.districtName,
    villa.ward?.name || villa.wardName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedKeyword);
}

function getDisplayPriceZone(villa: Villa) {
  if (villa.priceZone?.trim()) {
    let text = villa.priceZone.trim();
    if (villa.dateZone?.trim()) {
      text += ` (Ngày: ${villa.dateZone.trim()})`;
    }
    return text;
  }

  const sourceCellRef = villa.sourceCellRef?.trim() || "";
  if (!sourceCellRef) {
    return "---";
  }

  return sourceCellRef.includes("::")
    ? sourceCellRef.split("::")[0] || "---"
    : sourceCellRef;
}

export function VillaImportVillasSection({
  customers,
  villas,
  selectedCustomerId,
  isLoadingCustomers,
  isLoadingVillas,
  onSelectCustomer,
  onOpenCreateVilla,
  onOpenEditVilla,
  onDeleteVilla,
  onOpenConfigSpecialMonths,
  onRefreshVillas,
}: VillasSectionProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [villaToDelete, setVillaToDelete] = useState<Villa | null>(null);
  const [villaToViewRates, setVillaToViewRates] = useState<Villa | null>(null);
  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );
  const activeVillas = useMemo(
    () => villas.filter((villa) => villa.isActive !== false),
    [villas],
  );
  const filteredVillas = useMemo(
    () =>
      activeVillas.filter((villa) => matchesVillaSearch(villa, searchKeyword)),
    [activeVillas, searchKeyword],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quản lý villa</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chọn sheet, tìm kiếm và quản lý danh sách villa.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl px-5"
            onClick={onRefreshVillas}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            type="button"
            className="h-11 rounded-2xl px-5"
            disabled={!selectedCustomerId}
            onClick={onOpenCreateVilla}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo villa
          </Button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,1fr)_auto]">
          <div>
            <SearchableSheetSelect
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              isLoadingCustomers={isLoadingCustomers}
              onSelectCustomer={onSelectCustomer}
            />
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="h-12 rounded-2xl pl-11 text-sm"
              placeholder="Tìm theo tên villa, ô nguồn, sheet hoặc địa chỉ..."
            />
          </div>

          <Button type="button" className="h-12 rounded-2xl px-8">
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Villa
              </TableHead>
              <TableHead className="w-[180px] px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Giá
              </TableHead>
              <TableHead className="w-[120px] px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Liên hệ
              </TableHead>
              <TableHead className="w-[130px] px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Ngày tạo
              </TableHead>
              <TableHead className="w-[80px] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedCustomerId ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Chọn một sheet để xem danh sách villa.
                </TableCell>
              </TableRow>
            ) : isLoadingVillas ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Đang tải danh sách villa...
                </TableCell>
              </TableRow>
            ) : filteredVillas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Không tìm thấy villa nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredVillas.map((villa) => {
                const googleMapsUrl =
                  readMetadataText(villa.metadata, "googleMapsUrl") ||
                  readMetadataText(villa.metadata, "actualAddress");
                const zaloLink = readMetadataText(villa.metadata, "zaloLink");
                const location = [
                  villa.ward?.name || villa.wardName,
                  villa.district?.name || villa.districtName,
                  villa.province?.name || villa.provinceName,
                ]
                  .filter(Boolean)
                  .join(", ");
                const priceZone = getDisplayPriceZone(villa);

                return (
                  <TableRow
                    key={villa.id}
                    className="group border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell className="max-w-0 px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                          <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                            {getVillaInitial(villa.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                            {villa.name}
                          </span>
                          <span className="truncate text-[11px] font-medium text-slate-400">
                            {location || "Chưa có vị trí"}
                            {googleMapsUrl ? " • Có Google Maps" : ""}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-[13px] font-semibold text-slate-700">
                          {priceZone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {zaloLink ? (
                          <a
                            href={zaloLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-semibold text-blue-600 hover:underline"
                          >
                            Zalo
                          </a>
                        ) : null}
                        {googleMapsUrl && googleMapsUrl.startsWith("http") ? (
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-semibold text-emerald-700 hover:underline"
                          >
                            Google Maps
                          </a>
                        ) : null}
                        {!zaloLink &&
                        (!googleMapsUrl ||
                          !googleMapsUrl.startsWith("http")) ? (
                          <span className="text-[13px] font-medium text-slate-400">
                            ---
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <span className="text-[13px] font-medium text-slate-500">
                        {formatDate(villa.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-8 w-8 rounded-lg transition-all hover:text-emerald-700",
                          )}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-2xl border-slate-100 p-2 shadow-xl"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                              Quản lý villa
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => onOpenEditVilla(villa)}
                            >
                              <Edit className="h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                              onClick={() => onOpenConfigSpecialMonths(villa)}
                            >
                              <Calendar className="h-4 w-4" />
                              Cấu hình tháng đặc biệt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                              onClick={() => setVillaToViewRates(villa)}
                            >
                              <Calendar className="h-4 w-4" />
                              Xem lịch giá
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                              onClick={() => setVillaToDelete(villa)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xoá villa
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={Boolean(villaToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setVillaToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá villa này?</AlertDialogTitle>
            <AlertDialogDescription>
              Villa sẽ được ẩn khỏi danh sách quản lý. Dữ liệu cũ vẫn còn trong
              hệ thống để tránh mất lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (villaToDelete) {
                  onDeleteVilla(villaToDelete);
                }
                setVillaToDelete(null);
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VillaPriceCalendarModal
        villa={villaToViewRates}
        isOpen={Boolean(villaToViewRates)}
        onClose={() => setVillaToViewRates(null)}
      />
    </div>
  );
}
