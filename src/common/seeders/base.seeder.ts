import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseSeeder {
  protected dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  abstract run(): Promise<void>;

  protected async save<T extends ObjectLiteral>(entity: T, entityClass: EntityTarget<T>): Promise<T> {
    const repository = this.dataSource.getRepository(entityClass);
    return repository.save(entity);
  }

  protected async saveMany<T extends ObjectLiteral>(entities: T[], entityClass: EntityTarget<T>): Promise<T[]> {
    const repository = this.dataSource.getRepository(entityClass);
    return repository.save(entities);
  }
} 