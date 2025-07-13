import { Repository, DataSource, Like, In } from 'typeorm';
import { Seller, SELLER_STATUS, SELLER_VERIFICATION_STATUS } from './entities/seller.entity';
import { User } from '../user/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { GetSellersQueryDto } from './dto/get-sellers-query.dto';
import { SellerResponseDto } from './dto/seller-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { getResponseAPI } from '../../common/getResponseAPI';

export class SellerService {
  constructor(
    private sellerRepository: Repository<Seller>,
    private userRepository: Repository<User>,
    private productRepository: Repository<Product>,
    private dataSource: DataSource
  ) {}

  async createSeller(data: CreateSellerDto): Promise<SellerResponseDto> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a seller
    const existingSeller = await this.sellerRepository.findOne({
      where: { userId: data.userId }
    });

    if (existingSeller) {
      throw new Error('User is already a seller');
    }

    // Create seller
    const seller = this.sellerRepository.create({
      ...data,
      status: data.status || SELLER_STATUS.PENDING,
      verificationStatus: data.verificationStatus || SELLER_VERIFICATION_STATUS.UNVERIFIED
    });

    const savedSeller = await this.sellerRepository.save(seller);

    // Update user type to seller
    user.type = 'seller';
    await this.userRepository.save(user);

    return this.mapToResponseDto(savedSeller);
  }

  async getSellers(query: GetSellersQueryDto): Promise<PaginatedResponseDto<SellerResponseDto>> {
    const { page = 1, limit = 10, search, status, verificationStatus, businessCity, businessState, businessCountry, includeUser, includeProducts } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (verificationStatus) {
      whereConditions.verificationStatus = verificationStatus;
    }

    if (businessCity) {
      whereConditions.businessCity = Like(`%${businessCity}%`);
    }

    if (businessState) {
      whereConditions.businessState = Like(`%${businessState}%`);
    }

    if (businessCountry) {
      whereConditions.businessCountry = Like(`%${businessCountry}%`);
    }

    // Build query
    const queryBuilder = this.sellerRepository.createQueryBuilder('seller');

    if (includeUser) {
      queryBuilder.leftJoinAndSelect('seller.user', 'user');
    }

    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('seller.products', 'products');
    }

    // Add search conditions
    if (search) {
      queryBuilder.andWhere(
        '(seller.businessName ILIKE :search OR seller.businessDescription ILIKE :search OR seller.businessEmail ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add where conditions
    Object.keys(whereConditions).forEach(key => {
      if (whereConditions[key] instanceof Like) {
        queryBuilder.andWhere(`seller.${key} LIKE :${key}`, { [key]: (whereConditions[key] as any).value });
      } else {
        queryBuilder.andWhere(`seller.${key} = :${key}`, { [key]: whereConditions[key] });
      }
    });

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const sellers = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('seller.createdAt', 'DESC')
      .getMany();

    const data = sellers.map(seller => this.mapToResponseDto(seller));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSellerById(id: string, includeUser = false, includeProducts = false): Promise<SellerResponseDto> {
    const queryBuilder = this.sellerRepository.createQueryBuilder('seller');

    if (includeUser) {
      queryBuilder.leftJoinAndSelect('seller.user', 'user');
    }

    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('seller.products', 'products');
    }

    const seller = await queryBuilder
      .where('seller.id = :id', { id })
      .getOne();

    if (!seller) {
      throw new Error('Seller not found');
    }

    return this.mapToResponseDto(seller);
  }

  async getSellerByUserId(userId: string): Promise<SellerResponseDto> {
    const seller = await this.sellerRepository.findOne({
      where: { userId },
      relations: ['user']
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    return this.mapToResponseDto(seller);
  }

  async updateSeller(id: string, data: UpdateSellerDto): Promise<SellerResponseDto> {
    const seller = await this.sellerRepository.findOne({
      where: { id }
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    // Update seller
    Object.assign(seller, data);
    const updatedSeller = await this.sellerRepository.save(seller);

    return this.mapToResponseDto(updatedSeller);
  }

  async approveSeller(id: string, approvedBy: string): Promise<SellerResponseDto> {
    const seller = await this.sellerRepository.findOne({
      where: { id }
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    seller.status = SELLER_STATUS.APPROVED;
    seller.verificationStatus = SELLER_VERIFICATION_STATUS.VERIFIED;
    seller.approvedAt = new Date();
    seller.approvedBy = approvedBy;

    const updatedSeller = await this.sellerRepository.save(seller);

    return this.mapToResponseDto(updatedSeller);
  }

  async rejectSeller(id: string, rejectionReason: string, rejectedBy: string): Promise<SellerResponseDto> {
    const seller = await this.sellerRepository.findOne({
      where: { id }
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    seller.status = SELLER_STATUS.REJECTED;
    seller.verificationStatus = SELLER_VERIFICATION_STATUS.REJECTED;
    seller.rejectionReason = rejectionReason;
    seller.approvedBy = rejectedBy;

    const updatedSeller = await this.sellerRepository.save(seller);

    return this.mapToResponseDto(updatedSeller);
  }

  async suspendSeller(id: string, reason: string): Promise<SellerResponseDto> {
    const seller = await this.sellerRepository.findOne({
      where: { id }
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    seller.status = SELLER_STATUS.SUSPENDED;
    seller.notes = reason;

    const updatedSeller = await this.sellerRepository.save(seller);

    return this.mapToResponseDto(updatedSeller);
  }

  async deleteSeller(id: string): Promise<void> {
    const seller = await this.sellerRepository.findOne({
      where: { id }
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    // Check if seller has products
    const productCount = await this.productRepository.count({
      where: { sellerId: id }
    });

    if (productCount > 0) {
      throw new Error('Cannot delete seller with existing products');
    }

    await this.sellerRepository.remove(seller);

    // Update user type back to buyer
    const user = await this.userRepository.findOne({
      where: { id: seller.userId }
    });

    if (user) {
      user.type = 'buyer';
      await this.userRepository.save(user);
    }
  }

  async getSellerStats(id: string): Promise<any> {
    const seller = await this.sellerRepository.findOne({
      where: { id }
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    // Get product count
    const productCount = await this.productRepository.count({
      where: { sellerId: id }
    });

    // Get published product count
    const publishedProductCount = await this.productRepository.count({
      where: { sellerId: id, published: true }
    });

    // Get approved product count
    const approvedProductCount = await this.productRepository.count({
      where: { sellerId: id, approved: true }
    });

    // Update seller stats
    seller.totalProducts = productCount;
    await this.sellerRepository.save(seller);

    return {
      totalProducts: productCount,
      publishedProducts: publishedProductCount,
      approvedProducts: approvedProductCount,
      totalSales: seller.totalSales,
      totalOrders: seller.totalOrders,
      totalRevenue: seller.totalRevenue,
      rating: seller.rating,
      reviewCount: seller.reviewCount
    };
  }

  private mapToResponseDto(seller: Seller): SellerResponseDto {
    return {
      id: seller.id,
      userId: seller.userId,
      businessName: seller.businessName,
      businessDescription: seller.businessDescription,
      businessPhone: seller.businessPhone,
      businessEmail: seller.businessEmail,
      businessWebsite: seller.businessWebsite,
      businessAddress: seller.businessAddress,
      businessCity: seller.businessCity,
      businessState: seller.businessState,
      businessPostalCode: seller.businessPostalCode,
      businessCountry: seller.businessCountry,
      taxId: seller.taxId,
      licenseNumber: seller.licenseNumber,
      licenseExpiryDate: seller.licenseExpiryDate,
      status: seller.status,
      verificationStatus: seller.verificationStatus,
      verificationDocuments: seller.verificationDocuments,
      profileImage: seller.profileImage,
      bannerImage: seller.bannerImage,
      totalProducts: seller.totalProducts,
      totalSales: seller.totalSales,
      totalOrders: seller.totalOrders,
      totalRevenue: seller.totalRevenue,
      rating: seller.rating,
      reviewCount: seller.reviewCount,
      commissionRate: seller.commissionRate,
      payoutMethod: seller.payoutMethod,
      payoutDetails: seller.payoutDetails,
      approvedAt: seller.approvedAt,
      approvedBy: seller.approvedBy,
      rejectionReason: seller.rejectionReason,
      notes: seller.notes,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      user: seller.user ? {
        id: seller.user.id,
        firstName: seller.user.firstName,
        lastName: seller.user.lastName,
        email: seller.user.email,
        phone: seller.user.phone,
        isActive: seller.user.isActive
      } : undefined
    };
  }
} 