import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMediaTables1751000000001 implements MigrationInterface {
    name = 'CreateMediaTables1751000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create media_files table
        await queryRunner.createTable(
            new Table({
                name: "media_files",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "scope",
                        type: "varchar",
                        default: "'marketplace'",
                        comment: "Resource scope e.g. marketplace, seller, buyer",
                    },
                    {
                        name: "uri",
                        type: "varchar",
                        isUnique: true,
                        isNullable: true,
                        comment: "File path in S3 bucket for internal files",
                    },
                    {
                        name: "url",
                        type: "text",
                        isNullable: true,
                        comment: "File URL for public media files",
                    },
                    {
                        name: "fileName",
                        type: "varchar",
                    },
                    {
                        name: "mimetype",
                        type: "varchar",
                    },
                    {
                        name: "size",
                        type: "int",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create media_connect table
        await queryRunner.createTable(
            new Table({
                name: "media_connect",
                columns: [
                    {
                        name: "entityType",
                        type: "varchar",
                        isPrimary: true,
                    },
                    {
                        name: "entityId",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "mediaFileId",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "sortOrder",
                        type: "int",
                        default: "0",
                    },
                ],
            }),
            true
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
            "media_connect",
            new TableForeignKey({
                columnNames: ["mediaFileId"],
                referencedColumnNames: ["id"],
                referencedTableName: "media_files",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("media_connect");
        await queryRunner.dropTable("media_files");
    }
} 