import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('activities', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('stop_id').notNullable();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('category', 100).notNullable();
    table.datetime('start_time').nullable();
    table.datetime('end_time').nullable();
    table.decimal('estimated_cost', 10, 2).nullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('booking_url', 500).nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('stop_id')
      .references('id')
      .inTable('stops')
      .onDelete('CASCADE');

    // Indexes
    table.index(['stop_id']);
    table.index(['category']);
    table.index(['start_time']);

    // Check constraint for time logic
    table.check('end_time IS NULL OR end_time >= start_time');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('activities');
}
