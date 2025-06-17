import { Column, Entity, JoinTable, ManyToMany, Unique } from "typeorm";

import { BaseEntity } from "@/common/entities/base.entity";
import { Permission } from "@/modules/permissions/entities/permission.entity";

@Entity({ name: "roles" })
@Unique(["scope", "name"])
export class Role extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "roleId" },
    inverseJoinColumn: { name: "permissionName" },
  })
  permissions: Permission[];
}
