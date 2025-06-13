import { Entity, EntityOptions } from "typeorm";
import { BaseEntity } from "../entities/base.entity";

export function BaseEntityDecorator(options: EntityOptions = {}) {
  return function (target: typeof BaseEntity) {
    Entity(options)(target);
  };
}
