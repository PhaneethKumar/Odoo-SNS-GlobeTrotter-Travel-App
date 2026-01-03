import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('shared_links', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('itinerary_id').notNullable();
    table.string('share_token', 255).notNullable().unique();
    table.enum('access_level', ['public', 'private']).defaultTo('private');
    table.datetime('expires_at').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('itinerary_id')
      .references('id')
      .inTable('itineraries')
      .onDelete('CASCADE');

    // Indexes
    table.index(['itinerary_id']);
    table.index(['share_token']);
    table.index(['is_active']);
    table.index(['expires_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('shared_links');
}
