import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('stops', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('itinerary_id').notNullable();
    table.string('destination_name', 255).notNullable();
    table.string('destination_code', 10).nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.date('arrival_date').notNullable();
    table.date('departure_date').notNullable();
    table.integer('order_index').notNullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('itinerary_id')
      .references('id')
      .inTable('itineraries')
      .onDelete('CASCADE');

    // Indexes
    table.index(['itinerary_id']);
    table.index(['arrival_date']);
    table.index(['order_index']);

    // Check constraint for date logic
    table.check('departure_date >= arrival_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('stops');
}
