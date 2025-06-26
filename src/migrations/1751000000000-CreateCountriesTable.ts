import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCountriesTable1751000000000 implements MigrationInterface {
    name = 'CreateCountriesTable1751000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "countries",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "2",
                        default: "''",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                        default: "''",
                    },
                    {
                        name: "status",
                        type: "int",
                        default: "1",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("countries");
    }
} 