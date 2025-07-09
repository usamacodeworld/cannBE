import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { BaseEntity } from "../../common/entities/base.entity";
import { USER_TYPE } from "../../constants/user";
import { Role } from "../role/entities/role.entity";
import { Address } from "../address/address.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({
    comment: "admin, seller, buyer. Roles outside of the scope has no effect",
    enum: USER_TYPE,
  })
  type: `${USER_TYPE}`;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  userName?: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    nullable: true,
    comment: "Phone number",
  })
  phone?: string;

  @Column({ default: false, nullable: true })
  emailVerified?: boolean;

  @Column({ default: false, nullable: true })
  isActive?: boolean;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "userId" },
    inverseJoinColumn: { name: "roleId" },
  })
  roles?: Role[];

  @OneToMany(() => Address, address => address.user)
  addresses?: Address[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
