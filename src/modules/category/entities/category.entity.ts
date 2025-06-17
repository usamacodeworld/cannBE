import { Entity, Column } from "typeorm";
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity("categories")
export class Category extends BaseEntity {
    @Column({ default: false, nullable: true })
    isParent: boolean;

    @Column({ type: "uuid", nullable: true })
    parent_id: string | null;

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
}
