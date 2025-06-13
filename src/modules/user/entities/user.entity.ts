import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from "bcryptjs";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column()
  accountType: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column()
  userName: string

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
