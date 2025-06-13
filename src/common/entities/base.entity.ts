import { CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity as TypeOrmBaseEntity } from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 