import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('budget_items', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('budget_id').notNullable();
    table.uuid('activity_id').nullable();
    table.string('category', 100).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('description', 255).nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('budget_id')
      .references('id')
      .inTable('budgets')
      .onDelete('CASCADE');
    table
      .foreign('activity_id')
      .references('id')
      .inTable('activities')
      .onDelete('CASCADE');

    // Indexes
    table.index(['budget_id']);
    table.index(['activity_id']);
    table.index(['category']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('budget_items');
}
