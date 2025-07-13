import { SELLER_STATUS, SELLER_VERIFICATION_STATUS } from '../entities/seller.entity';

export class SellerResponseDto {
  id: string;
  userId: string;
  businessName?: string;
  businessDescription?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  taxId?: string;
  licenseNumber?: string;
  licenseExpiryDate?: Date;
  status: SELLER_STATUS;
  verificationStatus: SELLER_VERIFICATION_STATUS;
  verificationDocuments?: string;
  profileImage?: string;
  bannerImage?: string;
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  commissionRate?: number;
  payoutMethod?: string;
  payoutDetails?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // User information
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive?: boolean;
  };
} 