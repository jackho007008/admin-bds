import axiosInstance from "@/lib/axios";

export type VillaNameStrategy = "row_scan" | "column_scan" | "explicit_range";
export type PriceAxisDirection =
  | "columns_are_villas"
  | "rows_are_villas";

export interface VillaImportSource {
  id: string;
  customerId?: string | null;
  sourceName: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  sheetGid?: string | null;
  monthCell?: string | null;
  monthFallback?: string | null;
  isActive: boolean;
  rawSnapshot?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  notes?: string | null;
  accountUserId?: string | null;
  accountUser?: CustomerAccount | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAccount {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  updatedAt: string;
}

export interface SaleAccount {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAccountStatus {
  customerId: string;
  hasAccount: boolean;
  account: {
    userId: string;
    email: string;
    fullName: string;
    isActive: boolean;
    updatedAt: string;
  } | null;
}

export interface Villa {
  id: string;
  customerId: string;
  name: string;
  normalizedName: string;
  priceZone?: string | null;
  floors?: number | null;
  bedrooms?: number | null;
  toilets?: number | null;
  notes?: string | null;
  images?: string[];
  metadata?: unknown;
  sourceSpreadsheetId?: string | null;
  sourceSheetName?: string | null;
  sourceSheetGid?: string | null;
  sourceCellRef?: string | null;
  sourceLabel?: string | null;
  lastImportedAt?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyVilla extends Villa {
  latestRate?: {
    id: string;
    monthValue?: string | null;
    stayDate?: string | null;
    dayLabel: string;
    rawValue: string;
    price?: number | null;
    guestName?: string | null;
    note?: string | null;
    sourceSheetName: string;
    sourceCellRef: string;
  } | null;
}

export interface UpdateVillaPayload {
  name?: string | null;
  floors?: number | null;
  bedrooms?: number | null;
  toilets?: number | null;
  notes?: string | null;
  images?: string[] | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
}

export interface VillaDailyRate {
  id: string;
  customerId: string;
  villaId: string;
  monthValue?: string | null;
  stayDate?: string | null;
  dayLabel: string;
  weekdayLabel?: string | null;
  rawValue: string;
  price?: number | null;
  guestName?: string | null;
  note?: string | null;
  parseStatus: string;
  sourceSheetName: string;
  sourceCellRef: string;
  villa: Villa;
}

export interface VillaImportTemplate {
  id: string;
  sourceId: string;
  templateName: string;
  villaNameStrategy: "ROW_SCAN" | "COLUMN_SCAN" | "EXPLICIT_RANGE";
  villaNameRow?: string | null;
  villaNameColumn?: string | null;
  villaNameRange?: string | null;
  villaNameStartCell?: string | null;
  villaNameEndCell?: string | null;
  priceAxisDirection: "COLUMNS_ARE_VILLAS" | "ROWS_ARE_VILLAS";
  villaAxisRange: string;
  dayAxisRange: string;
  weekdayAxisRange?: string | null;
  priceGridRange: string;
  notes?: string | null;
  config?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VillaImportPreviewResponse {
  run: {
    id: string;
    sourceId: string;
    templateId?: string | null;
    status: string;
    preview?: unknown;
    summary?: unknown;
    createdAt: string;
  };
  preview: {
    source: {
      sheetName: string | null;
      monthValue: string | null;
    };
    mapping: {
      villaAxisRange: string;
      dayAxisRange: string;
      weekdayAxisRange?: string | null;
      priceGridRange: string;
      priceAxisDirection: string;
    };
    summary: {
      detectedVillaCount: number;
      detectedDayCount: number;
      extractedRecordCount: number;
      sampleVillaNames: string[];
    };
    inferredVillaZones: Array<{
      villaName: string;
      priceZone: string;
    }>;
    sampleRecords: Array<Record<string, unknown>>;
  };
}

export interface UpsertVillaImportSourcePayload {
  customerId?: string;
  sourceName: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  sheetGid?: string;
  monthCell?: string;
  monthFallback?: string;
  isActive?: boolean;
  rawSnapshot?: unknown;
}

export interface UpsertVillaImportTemplatePayload {
  sourceId: string;
  templateName: string;
  villaNameStrategy: VillaNameStrategy;
  villaNameRow?: string;
  villaNameColumn?: string;
  villaNameRange?: string;
  villaNameStartCell?: string;
  villaNameEndCell?: string;
  priceAxisDirection: PriceAxisDirection;
  villaAxisRange: string;
  dayAxisRange: string;
  weekdayAxisRange?: string;
  priceGridRange: string;
  notes?: string;
  config?: unknown;
  isActive?: boolean;
}

export const villaImportService = {
  createCustomer: async (data: {
    name: string;
    notes?: string;
  }): Promise<Customer> => {
    const response = await axiosInstance.post<Customer>(
      "/villa-import/customers",
      data
    );
    return response.data;
  },

  listCustomers: async (): Promise<Customer[]> => {
    const response = await axiosInstance.get<Customer[]>("/villa-import/customers");
    return response.data;
  },

  createSale: async (data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<SaleAccount> => {
    const response = await axiosInstance.post<SaleAccount>(
      "/villa-import/sales",
      data
    );
    return response.data;
  },

  listSales: async (): Promise<SaleAccount[]> => {
    const response = await axiosInstance.get<SaleAccount[]>("/villa-import/sales");
    return response.data;
  },

  listCustomerVillas: async (customerId: string): Promise<Villa[]> => {
    const response = await axiosInstance.get<Villa[]>(
      `/villa-import/customers/${customerId}/villas`
    );
    return response.data;
  },

  listMyVillas: async (): Promise<MyVilla[]> => {
    const response = await axiosInstance.get<MyVilla[]>("/villa-import/my-villas");
    return response.data;
  },

  updateVilla: async (id: string, payload: UpdateVillaPayload): Promise<Villa> => {
    const response = await axiosInstance.patch<Villa>(
      `/villa-import/villas/${id}`,
      payload
    );
    return response.data;
  },

  listCustomerRates: async (customerId: string): Promise<VillaDailyRate[]> => {
    const response = await axiosInstance.get<VillaDailyRate[]>(
      `/villa-import/customers/${customerId}/rates`
    );
    return response.data;
  },

  listSources: async (): Promise<VillaImportSource[]> => {
    const response = await axiosInstance.get<VillaImportSource[]>(
      "/villa-import/sources"
    );
    return response.data;
  },

  listTemplates: async (sourceId?: string): Promise<VillaImportTemplate[]> => {
    const response = await axiosInstance.get<VillaImportTemplate[]>(
      "/villa-import/templates",
      {
        params: sourceId ? { sourceId } : undefined,
      }
    );
    return response.data;
  },

  createSource: async (
    data: UpsertVillaImportSourcePayload
  ): Promise<VillaImportSource> => {
    const response = await axiosInstance.post<VillaImportSource>(
      "/villa-import/sources",
      data
    );
    return response.data;
  },

  updateSource: async (
    id: string,
    data: Partial<UpsertVillaImportSourcePayload>
  ): Promise<VillaImportSource> => {
    const response = await axiosInstance.patch<VillaImportSource>(
      `/villa-import/sources/${id}`,
      data
    );
    return response.data;
  },

  createTemplate: async (
    data: UpsertVillaImportTemplatePayload
  ): Promise<VillaImportTemplate> => {
    const response = await axiosInstance.post<VillaImportTemplate>(
      "/villa-import/templates",
      data
    );
    return response.data;
  },

  updateTemplate: async (
    id: string,
    data: Partial<UpsertVillaImportTemplatePayload>
  ): Promise<VillaImportTemplate> => {
    const response = await axiosInstance.patch<VillaImportTemplate>(
      `/villa-import/templates/${id}`,
      data
    );
    return response.data;
  },

  previewImport: async (data: {
    sourceId: string;
    templateId: string;
    rawSheetValues: unknown[];
    monthOverride?: string;
  }): Promise<VillaImportPreviewResponse> => {
    const response = await axiosInstance.post<VillaImportPreviewResponse>(
      "/villa-import/preview",
      data
    );
    return response.data;
  },

  previewConfiguredSheet: async (data: {
    sourceId: string;
    templateId: string;
    monthOverride?: string;
  }): Promise<VillaImportPreviewResponse> => {
    const response = await axiosInstance.post<VillaImportPreviewResponse>(
      "/villa-import/google-sheet/preview-configured-sheet",
      data
    );
    return response.data;
  },

  fetchGoogleSheetRow: async (data: {
    spreadsheetId: string;
    gid: string;
    rowNumber: number;
  }): Promise<{
    spreadsheetId: string;
    gid: string;
    sheetName: string;
    rowNumber: number;
    range: string;
    values: string[];
    nonEmptyValues: Array<{ column: string; value: string }>;
  }> => {
    const response = await axiosInstance.post(
      "/villa-import/google-sheet/row",
      data
    );
    return response.data;
  },

  importVillaNames: async (data: {
    customerId: string;
    spreadsheetId: string;
    gid: string;
    mode: "row_scan" | "column_scan" | "explicit_range";
    rowNumber?: string;
    columnLabel?: string;
    range?: string;
  }): Promise<{
    customerId: string;
    sheetName: string;
    importedCount: number;
    items: Villa[];
  }> => {
    const response = await axiosInstance.post(
      "/villa-import/google-sheet/import-villa-names",
      data
    );
    return response.data;
  },

  importConfiguredSheet: async (data: {
    customerId: string;
    sourceId: string;
    templateId: string;
    monthOverride?: string;
  }): Promise<{
    customerId: string;
    sourceId: string;
    templateId: string;
    runId: string;
    importedVillaCount: number;
    importedRateCount: number;
    monthValue?: string | null;
    sampleRecords: Array<Record<string, unknown>>;
  }> => {
    const response = await axiosInstance.post(
      "/villa-import/google-sheet/import-configured-sheet",
      data
    );
    return response.data;
  },

  getCustomerAccount: async (
    customerId: string
  ): Promise<CustomerAccountStatus> => {
    const response = await axiosInstance.get<CustomerAccountStatus>(
      `/villa-import/customers/${customerId}/account`
    );
    return response.data;
  },

  createCustomerAccount: async (
    customerId: string,
    data: {
      email: string;
      password: string;
      fullName?: string;
    }
  ): Promise<CustomerAccountStatus> => {
    const response = await axiosInstance.post<CustomerAccountStatus>(
      `/villa-import/customers/${customerId}/account`,
      data
    );
    return response.data;
  },

  resetCustomerAccountPassword: async (
    customerId: string,
    data: {
      password: string;
    }
  ): Promise<CustomerAccountStatus> => {
    const response = await axiosInstance.post<CustomerAccountStatus>(
      `/villa-import/customers/${customerId}/account/reset-password`,
      data
    );
    return response.data;
  },
};
