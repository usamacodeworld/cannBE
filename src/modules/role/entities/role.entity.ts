import { Column, Entity, JoinTable, ManyToMany, Unique } from "typeorm";

import { BaseEntity } from "../../../common/entities/base.entity";
import { Permission } from "../../../modules/permissions/entities/permission.entity";
import { User } from "../../../modules/user/entities/user.entity";

@Entity({ name: "roles" })
@Unique(["name"])
export class Role extends BaseEntity {
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
