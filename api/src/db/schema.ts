import { pgTable, serial, text, jsonb, timestamp, integer, primaryKey, AnyPgColumn } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  user: integer('id').references((): AnyPgColumn => users.id).notNull(),
  name: text('name').notNull(),
  images: text('images').notNull(),
  weights: text('weights'),
  last_update: text('last_update'),
  updates: jsonb('updates'),
  type: text('type').notNull().default('dog'),
}, (t) => ({
  pk: primaryKey({columns: [jobs.user, jobs.name]})
}));

export const imageJobs = pgTable('imageJobs', {
  id: serial('id').primaryKey(),
  user: integer('user').references((): AnyPgColumn => users.id).notNull(),
  name: text('name').notNull(),
  images: jsonb('images'),
  status: text('status').notNull(),
  options: jsonb('options').notNull(),
});
