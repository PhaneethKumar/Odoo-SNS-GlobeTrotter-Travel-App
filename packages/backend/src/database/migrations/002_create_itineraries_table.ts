import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('itineraries', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('user_id').notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table
      .enum('status', ['draft', 'active', 'completed', 'cancelled'])
      .defaultTo('draft');
    table.json('metadata').nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes
    table.index(['user_id']);
    table.index(['start_date']);
    table.index(['status']);
    table.index(['created_at']);

    // Check constraint for date logic
    table.check('end_date >= start_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('itineraries');
}
