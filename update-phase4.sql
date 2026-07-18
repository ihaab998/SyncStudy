ALTER TABLE scheduled_sessions RENAME COLUMN scheduled_time TO start_time;
ALTER TABLE scheduled_sessions ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
