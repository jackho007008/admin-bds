import type {
  Customer,
  SaleAccount,
  Villa,
  VillaDailyRate,
} from "@/services/villaImportService";

export type DetailsTab = "villas" | "rates";

export type GroupedVillaRate = {
  villaId: string;
  villaName: string;
  monthValue: string | null;
  sheetName: string;
  rates: VillaDailyRate[];
};

export type OwnersSectionProps = {
  customers: Customer[];
  isLoadingCustomers: boolean;
  selectedCustomerId: string;
  onOpenCreateOwnerModal: () => void;
  onSelectCustomer: (customerId: string) => void;
  onOpenSheetConfig: (customerId: string) => void;
  onOpenAccount: (customerId: string) => void;
  onOpenDetails: (customerId: string, tab: DetailsTab) => void;
};

export type SalesSectionProps = {
  sales: SaleAccount[];
  isLoadingSales: boolean;
  onOpenCreateSaleModal: () => void;
};

export type CreateOwnerModalProps = {
  isOpen: boolean;
  customerName: string;
  customerNotes: string;
  customerAccountEmail: string;
  customerAccountPassword: string;
  customerAccountFullName: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerNameChange: (value: string) => void;
  onCustomerNotesChange: (value: string) => void;
  onCustomerAccountEmailChange: (value: string) => void;
  onCustomerAccountPasswordChange: (value: string) => void;
  onCustomerAccountFullNameChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export type CreateSaleModalProps = {
  isOpen: boolean;
  saleFullName: string;
  saleEmail: string;
  salePassword: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleFullNameChange: (value: string) => void;
  onSaleEmailChange: (value: string) => void;
  onSalePasswordChange: (value: string) => void;
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
};
