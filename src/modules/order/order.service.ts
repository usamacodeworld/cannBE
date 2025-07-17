import { Repository, Like } from "typeorm";
import { Order } from "../checkout/entities/order.entity";
import { GetOrdersQueryDto } from "./dto/get-orders-query.dto";
import { ORDER_STATUS } from "../checkout/entities/order.enums";

export class OrderService {
  constructor(private orderRepository: Repository<Order>) {}

  async getAllOrders(query: GetOrdersQueryDto) {
    const { page = 1, limit = 20, status, search } = query;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      // Search by order number or customer email (expand as needed)
      where.orderNumber = Like(`%${search}%`);
      // To search by email as well, use: where.customerEmail = Like(`%${search}%`);
    }
    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
      relations: ["items", "statusHistory"],
    });
    return { data: orders, total, page, limit };
  }

  async getOrderById(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ["items", "statusHistory"],
    });
  }

  async updateOrderStatus(
    id: string,
    status: ORDER_STATUS,
    notes?: string,
    changedBy?: string
  ) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["statusHistory"],
    });
    if (!order) throw new Error("Order not found");
    const previousStatus = order.status;
    order.status = status;
    // Add to status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      orderId: order.id,
      status,
      previousStatus,
      notes,
      changedBy,
      notificationSent: false,
      // timestamp will be set by BaseEntity
    } as any);
    await this.orderRepository.save(order);
    return order;
  }

  async getOrderStats() {
    // Get all orders (could be optimized with raw SQL if needed)
    const orders = await this.orderRepository.find();
    const stats = {
      totalOrders: 0,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
    };
    for (const order of orders) {
      stats.totalOrders++;
      if (order.status === ORDER_STATUS.PENDING) stats.pending++;
      if (order.status === ORDER_STATUS.CONFIRMED) stats.confirmed++;
      if (order.status === ORDER_STATUS.SHIPPED) stats.shipped++;
      if (order.status === ORDER_STATUS.DELIVERED) stats.delivered++;
      if (order.status === ORDER_STATUS.CANCELLED) stats.cancelled++;
      if (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.CONFIRMED ||
        order.status === ORDER_STATUS.SHIPPED
      ) {
        stats.totalRevenue += Number(order.totalAmount);
      }
    }
    // Format totalRevenue as a number with 2 decimals
    stats.totalRevenue = Number(stats.totalRevenue.toFixed(2));
    return stats;
  }
}
