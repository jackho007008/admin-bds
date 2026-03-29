export type PropertyType =
  | 'MAT_PHO'
  | 'BIET_THU'
  | 'CHUNG_CU'
  | 'CHUNG_CU_MINI'
  | 'DAT_NEN'
  | 'NHA_RIENG'
  | 'VAN_PHONG'
  | 'KHACH_SAN'
  | 'KHAC';

export type PropertyStatus = 'DANG_BAN' | 'DUNG_BAN' | 'CHU_BAN' | 'CONG_TY_BAN';

export type LegalStatus = 'SO_HONG' | 'SO_DO' | 'GIAY_TAY' | 'DANG_CHO_SO' | 'CHUA_XAC_DINH';
export type InteriorStatus = 'DAY_DU' | 'CO_BAN' | 'NHA_THO' | 'CHUA_XAC_DINH';

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  addressRaw: string;
  addressOnPaper?: string;
  otherAddress?: string;
  province?: string;
  district?: string;
  ward?: string;
  actualArea?: number;
  paperArea?: number;
  frontageWidth?: number;
  roadWidth?: number;
  floors?: number;
  bedrooms?: number;
  toilets?: number;
  legalStatus?: LegalStatus;
  legalNote?: string;
  interiorStatus?: InteriorStatus;
  interiorNote?: string;
  tags?: string[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    fullName: string;
    role: string;
  };
  interactions?: {
    views: number;
    likes: number;
    comments: number;
  };
}
