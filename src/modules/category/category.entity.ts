import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany, ManyToMany } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Product } from "../products/entities/product.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Column({ default: false, nullable: true })
  isParent: boolean;

  @Index()
  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "parentId" })
  parent?: Category;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: false, nullable: true })
  isActive?: boolean;

  @Column({ default: false, nullable: true })
  isDeleted?: boolean;

  @Column({ default: false, nullable: true })
  isFeatured?: boolean;

  @Column({ default: false, nullable: true })
  isPopular?: boolean;

  @ManyToMany(() => Product, product => product.categories)
  products: Product[];
}
