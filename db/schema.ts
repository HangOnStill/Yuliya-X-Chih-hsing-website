import {sqliteTable,text,integer,real,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const photos=sqliteTable('photos',{
 id:text('id').primaryKey(),kind:text('kind').notNull(),filename:text('filename').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),objectKey:text('object_key').notNull(),digest:text('digest').notNull(),title:text('title').notNull(),note:text('note').notNull().default(''),tags:text('tags').notNull().default(''),takenAt:text('taken_at').notNull().default(''),favorite:integer('favorite').notNull().default(0),slot:integer('slot'),createdAt:text('created_at').notNull(),revision:integer('revision').notNull().default(0)
},t=>[uniqueIndex('photos_digest_unique').on(t.digest),uniqueIndex('photos_slot_unique').on(t.slot)]);
export const wishes=sqliteTable('wishes',{
 id:text('id').primaryKey(),title:text('title').notNull(),notes:text('notes').notNull(),category:text('category').notNull(),status:text('status').notNull(),priority:text('priority').notNull(),url:text('url').notNull(),budget:real('budget'),currency:text('currency').notNull(),dueDate:text('due_date').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),revision:integer('revision').notNull().default(0)
});
export const journey=sqliteTable('journey',{userId:text('user_id').primaryKey(),unlocked:integer('unlocked').notNull().default(0)});
