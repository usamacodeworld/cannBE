import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { MediaFile } from "../media/media-file.entity";

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

  @Column({ default: false, nullable: true })
  isActive?: boolean;

  @Column({ nullable: true })
  thumbnailImageId?: string;

  @ManyToOne(() => MediaFile, { nullable: true, cascade: true })
  @JoinColumn({ name: "thumbnailImageId" })
  thumbnailImage?: MediaFile;

  @Column({ nullable: true })
  coverImageId?: string;

  @ManyToOne(() => MediaFile, { nullable: true, cascade: true })
  @JoinColumn({ name: "coverImageId" })
  coverImage?: MediaFile;

  @Column({ default: false, nullable: true })
  isFeatured?: boolean;

  @Column({ default: false, nullable: true })
  isPopular?: boolean;


}
