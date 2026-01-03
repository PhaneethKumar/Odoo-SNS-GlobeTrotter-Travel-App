import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('budgets', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('itinerary_id').notNullable();
    table.decimal('total_budget', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.json('category_budgets').nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('itinerary_id')
      .references('id')
      .inTable('itineraries')
      .onDelete('CASCADE');

    // Indexes
    table.index(['itinerary_id']);

    // Unique constraint - one budget per itinerary
    table.unique(['itinerary_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('budgets');
}
