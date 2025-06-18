import { Column, Entity, JoinTable, ManyToMany, Unique } from "typeorm";

import { BaseEntity } from "../../../common/entities/base.entity";
import { Permission } from "../../permissions/entities/permission.entity";
import { User } from "../../user/user.entity";

export const ADMIN_ROLE = 'ADMIN';

@Entity({ name: "roles" })
@Unique(["name"])
export class Role extends BaseEntity {
  static readonly ADMIN = ADMIN_ROLE;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "roleId" },
    inverseJoinColumn: { name: "permissionName", referencedColumnName: "name" },
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
