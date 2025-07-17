import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { GetOrdersQueryDto } from "./dto/get-orders-query.dto";
import { ORDER_STATUS } from "../checkout/entities/order.enums";

export function orderController(orderService: OrderService) {
  return {
    getAllOrders: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetOrdersQueryDto;
        const result = await orderService.getAllOrders(query);
        res.json({ success: true, data: result });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: (error as Error).message });
      }
    },
    getOrderById: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);
        if (!order) {
          res.status(404).json({ success: false, message: "Order not found" });
          return;
        }
        // Parse paymentGatewayResponse if it's a JSON string
        let parsedGatewayResponse = order.paymentGatewayResponse;
        if (typeof parsedGatewayResponse === "string") {
          try {
            parsedGatewayResponse = JSON.parse(parsedGatewayResponse);
          } catch {}
        }
        res.json({
          success: true,
          data: {
            data: {
              ...order,
              paymentDetails: {
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                paymentTransactionId: order.paymentTransactionId,
                paymentGatewayResponse: parsedGatewayResponse,
                subtotal: order.subtotal,
                taxAmount: order.taxAmount,
                shippingAmount: order.shippingAmount,
                discountAmount: order.discountAmount,
                totalAmount: order.totalAmount,
              },
            },
          },
        });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: (error as Error).message });
      }
    },
    updateOrderStatus: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { status, notes } = req.body;
        if (!status || !Object.values(ORDER_STATUS).includes(status)) {
          res.status(400).json({ success: false, message: "Invalid status" });
          return;
        }
        const order = await orderService.updateOrderStatus(
          id,
          status,
          notes,
          (req as any).user?.id // assuming user id is available
        );
        res.json({ success: true, data: { data: order } });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: (error as Error).message });
      }
    },
    getStats: async (req: Request, res: Response) => {
      try {
        const stats = await orderService.getOrderStats();
        res.json({ success: true, data: { data: stats } });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: (error as Error).message });
      }
    },
  };
}
