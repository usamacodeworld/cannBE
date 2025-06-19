import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AttributeValue } from './attribute-value.entity';

@Entity('attributes')
export class Attribute extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => AttributeValue, value => value.attribute)
  values: AttributeValue[];
} 