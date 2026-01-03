import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('itinerary_collaborators', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('itinerary_id').notNullable();
    table.uuid('user_id').notNullable();
    table
      .enum('permission_level', ['read', 'write', 'admin'])
      .defaultTo('read');
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('itinerary_id')
      .references('id')
      .inTable('itineraries')
      .onDelete('CASCADE');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes
    table.index(['itinerary_id']);
    table.index(['user_id']);

    // Unique constraint - one permission per user per itinerary
    table.unique(['itinerary_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('itinerary_collaborators');
}
