import axiosInstance from "@/lib/axios";

export type VillaNameStrategy = "row_scan" | "column_scan" | "explicit_range";
export type PriceAxisDirection = "columns_are_villas" | "rows_are_villas";

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
  metadata?: any | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleAccount {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Villa {
  id: string;
  customerId: string;
  name: string;
  normalizedName: string;
  priceZone?: string | null;
  dateZone?: string;
  description?: string | null;
  floors?: number | null;
  bedrooms?: number | null;
  toilets?: number | null;
  maxGuests?: number | null;
  notes?: string | null;
  images?: string[];
  imageKeys?: string[];
  metadata?: unknown;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
  province?: { id: number; name: string } | null;
  district?: { id: number; name: string } | null;
  ward?: { id: number; name: string } | null;
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
  priceZone?: string | null;
  description?: string | null;
  name?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  floors?: number | null;
  bedrooms?: number | null;
  toilets?: number | null;
  maxGuests?: number | null;
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
  isBooked: boolean;
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
      data,
    );
    return response.data;
  },

  updateCustomer: async (
    id: string,
    data: {
      name: string;
      notes?: string;
    },
  ): Promise<Customer> => {
    const response = await axiosInstance.patch<Customer>(
      `/villa-import/customers/${id}`,
      data,
    );
    return response.data;
  },

  listCustomers: async (): Promise<Customer[]> => {
    const response = await axiosInstance.get<Customer[]>(
      "/villa-import/customers",
    );
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/villa-import/customers/${id}`);
  },

  createSale: async (data: {
    fullName: string;
    email: string;
    password?: string;
    expiresAt?: string;
  }): Promise<SaleAccount> => {
    const response = await axiosInstance.post<SaleAccount>(
      "/users/admin/sales",
      data,
    );
    return response.data;
  },

  updateSale: async (
    id: string,
    data: {
      fullName?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
      expiresAt?: string;
    },
  ): Promise<SaleAccount> => {
    const response = await axiosInstance.patch<{ data: SaleAccount }>(
      `/users/admin/${id}`,
      data,
    );
    return response.data.data;
  },

  listSales: async (): Promise<SaleAccount[]> => {
    const response = await axiosInstance.get<SaleAccount[]>(
      "/users/admin/sales",
    );
    return response.data;
  },

  listCustomerVillas: async (customerId: string): Promise<Villa[]> => {
    const response = await axiosInstance.get<Villa[]>(
      `/villa-import/customers/${customerId}/villas`,
    );
    return response.data;
  },

  getVilla: async (id: string): Promise<Villa> => {
    const response = await axiosInstance.get<Villa>(
      `/villa-import/villas/${id}`,
    );
    return response.data;
  },

  listMyVillas: async (): Promise<MyVilla[]> => {
    const response = await axiosInstance.get<MyVilla[]>(
      "/villa-import/my-villas",
    );
    return response.data;
  },

  updateVilla: async (
    id: string,
    payload: UpdateVillaPayload,
  ): Promise<Villa> => {
    const response = await axiosInstance.patch<Villa>(
      `/villa-import/villas/${id}`,
      payload,
    );
    return response.data;
  },

  updateVillaMultipart: async (
    id: string,
    formData: FormData,
  ): Promise<Villa> => {
    const response = await axiosInstance.patch<Villa>(
      `/villa-import/villas/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  createVillaForCustomerMultipart: async (
    customerId: string,
    formData: FormData,
  ): Promise<Villa> => {
    const response = await axiosInstance.post<Villa>(
      `/villa-import/customers/${customerId}/villas`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  listCustomerRates: async (customerId: string): Promise<VillaDailyRate[]> => {
    const response = await axiosInstance.get<VillaDailyRate[]>(
      `/villa-import/customers/${customerId}/rates`,
    );
    return response.data;
  },

  listVillaRates: async (villaId: string): Promise<VillaDailyRate[]> => {
    const response = await axiosInstance.get<VillaDailyRate[]>(
      `/villa-import/villas/${villaId}/rates`,
    );
    return response.data;
  },

  listSources: async (): Promise<VillaImportSource[]> => {
    const response = await axiosInstance.get<VillaImportSource[]>(
      "/villa-import/sources",
    );
    return response.data;
  },

  listTemplates: async (sourceId?: string): Promise<VillaImportTemplate[]> => {
    const response = await axiosInstance.get<VillaImportTemplate[]>(
      "/villa-import/templates",
      {
        params: sourceId ? { sourceId } : undefined,
      },
    );
    return response.data;
  },

  createSource: async (
    data: UpsertVillaImportSourcePayload,
  ): Promise<VillaImportSource> => {
    const response = await axiosInstance.post<VillaImportSource>(
      "/villa-import/sources",
      data,
    );
    return response.data;
  },

  updateSource: async (
    id: string,
    data: Partial<UpsertVillaImportSourcePayload>,
  ): Promise<VillaImportSource> => {
    const response = await axiosInstance.patch<VillaImportSource>(
      `/villa-import/sources/${id}`,
      data,
    );
    return response.data;
  },

  createTemplate: async (
    data: UpsertVillaImportTemplatePayload,
  ): Promise<VillaImportTemplate> => {
    const response = await axiosInstance.post<VillaImportTemplate>(
      "/villa-import/templates",
      data,
    );
    return response.data;
  },

  updateTemplate: async (
    id: string,
    data: Partial<UpsertVillaImportTemplatePayload>,
  ): Promise<VillaImportTemplate> => {
    const response = await axiosInstance.patch<VillaImportTemplate>(
      `/villa-import/templates/${id}`,
      data,
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
      data,
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
      data,
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
      data,
    );
    return response.data;
  },

  fetchGoogleSheetColors: async (data: {
    spreadsheetId: string;
    gid: string;
    range?: string;
  }): Promise<{
    spreadsheetId: string;
    gid: string;
    sheetName: string;
    range: string;
    colors: Array<{ hex: string; count: number; kinds: string[] }>;
  }> => {
    const response = await axiosInstance.post(
      "/villa-import/google-sheet/colors",
      data,
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
      data,
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
      data,
    );
    return response.data;
  },

  importAllConfiguredMonths: async (data: {
    customerId: string;
    villaId?: string;
  }): Promise<{ status: string; message: string }> => {
    const response = await axiosInstance.post(
      "/villa-import/google-sheet/import-all-configured-months",
      data,
    );
    return response.data;
  },
};
