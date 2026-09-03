import type {
  Customer,
  SaleAccount,
  Villa,
  VillaDailyRate,
} from "@/services/villaImportService";

export type DetailsTab = "villas" | "rates";

export interface SpecialMonth {
  monthYear: string; // format: MM/YYYY
  priceZone: string;
  dateZone?: string;
  startDay: number;
}

export type GroupedVillaRate = {
  villaId: string;
  villaName: string;
  monthValue: string | null;
  sheetName: string;
  rates: VillaDailyRate[];
};

export type PricePatternConfig = {
  pattern: string;
  multiplier: number;
};

export type OwnersSectionProps = {
  customers: Customer[];
  isLoadingCustomers: boolean;
  selectedCustomerId: string;
  onOpenCreateOwnerModal: () => void;
  onSelectCustomer: (customerId: string) => void;
  onDeleteCustomer: (customerId: string) => void;
};

export type SalesSectionProps = {
  sales: SaleAccount[];
  isLoadingSales: boolean;
  onOpenCreateSaleModal: () => void;
  onOpenEditSaleModal: (sale: SaleAccount) => void;
  onRefreshSales: () => void;
};

export type CreateOwnerModalProps = {
  isOpen: boolean;
  customerName: string;
  customerNotes: string;
  spreadsheetUrl: string;
  tabMonthPatterns: string[];
  pricePatterns: PricePatternConfig[];
  bookedDetectionModes: string[];
  bookedCellColors: string[];
  isEditing?: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerNameChange: (value: string) => void;
  onCustomerNotesChange: (value: string) => void;
  onSpreadsheetUrlChange: (value: string) => void;
  onTabMonthPatternsChange: (values: string[]) => void;
  onPricePatternsChange: (values: PricePatternConfig[]) => void;
  onBookedDetectionModesChange: (values: string[]) => void;
  onBookedCellColorsChange: (values: string[]) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export type CreateSaleModalProps = {
  isOpen: boolean;
  saleFullName: string;
  saleEmail: string;
  salePassword?: string;
  saleIsActive?: boolean;
  saleExpiresAt?: string;
  isEditing?: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleFullNameChange: (value: string) => void;
  onSaleEmailChange: (value: string) => void;
  onSalePasswordChange: (value: string) => void;
  onSaleIsActiveChange?: (value: boolean) => void;
  onSaleExpiresAtChange?: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export type OwnerDetailsModalProps = {
  isOpen: boolean;
  selectedCustomerName?: string;
  selectedCustomerId: string;
  detailsTab: DetailsTab;
  isLoadingVillas: boolean;
  villas: Villa[];
  isLoadingRates: boolean;
  rates: VillaDailyRate[];
  groupedRates: GroupedVillaRate[];
  expandedVillaId: string | null;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tab: DetailsTab) => void;
  onExpandedVillaChange: (villaId: string) => void;
  onOpenCreateVilla: () => void;
};
