import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "../../products/entities/product.entity";

@Entity("carts")
export class Cart extends BaseEntity {
  @Column({ nullable: true })
  guestId: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  productId: string;

  @Column("int", { default: 1 })
  quantity: number;

  @Column("decimal", { nullable: true })
  price: number;

  @Column("simple-json", { nullable: true })
  variants: Array<{
    attributeId: string;
    attributeValueId: string;
    attributeName: string;
    attributeValue: string;
    price: string;
  }>;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "productId" })
  product?: Product;
}
