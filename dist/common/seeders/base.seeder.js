"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSeeder = void 0;
class BaseSeeder {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async save(entity, entityClass) {
        const repository = this.dataSource.getRepository(entityClass);
        return repository.save(entity);
    }
    async saveMany(entities, entityClass) {
        const repository = this.dataSource.getRepository(entityClass);
        return repository.save(entities);
    }
}
exports.BaseSeeder = BaseSeeder;
