import { BaseEntity } from "@/common/entities/base.entity";
import { Role } from "@/modules/role/entities/role.entity";
import { Entity, Column, ManyToMany } from "typeorm";

@Entity({ name: "permissions" })
export class Permission extends BaseEntity {
  @Column({ unique: true, primary: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role)
  roles: Role[];
}
