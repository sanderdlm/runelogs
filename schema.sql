CREATE TABLE `clan` (
	`cl_id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`cl_name` TEXT
);
CREATE TABLE `user` (
	`us_id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`us_cl_id` INTEGER REFERENCES `clan`,
	`us_name` TEXT,
	`us_last_visited` INTEGER
);
CREATE TABLE `skill` (
	`sk_id` INTEGER PRIMARY KEY AUTOINCREMENT,
	`sk_name` TEXT
);
CREATE TABLE `log` (
	`lg_id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`lg_us_id` INTEGER REFERENCES `user`,
    `lg_sk_id` INTEGER REFERENCES `skill`,
	`lg_day` INTEGER,
	`lg_value` INTEGER,
	`lg_level` INTEGER
);
CREATE TABLE `event` (
	`ev_id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`ev_us_id` INTEGER REFERENCES `user`,
	`ev_title` TEXT,
	`ev_details` TEXT,
	`ev_ts` INTEGER
);
CREATE INDEX `event_index` ON event(`ev_us_id`);
CREATE INDEX `log_index` ON log(`lg_us_id`, `lg_day`, `lg_sk_id`);

INSERT INTO skill (sk_name) VALUES('attack');
INSERT INTO skill (sk_name) VALUES('defence');
INSERT INTO skill (sk_name) VALUES('strength');
INSERT INTO skill (sk_name) VALUES('hitpoints');
INSERT INTO skill (sk_name) VALUES('ranged');
INSERT INTO skill (sk_name) VALUES('prayer');
INSERT INTO skill (sk_name) VALUES('magic');
INSERT INTO skill (sk_name) VALUES('cooking');
INSERT INTO skill (sk_name) VALUES('woodcutting');
INSERT INTO skill (sk_name) VALUES('fletching');
INSERT INTO skill (sk_name) VALUES('fishing');
INSERT INTO skill (sk_name) VALUES('firemaking');
INSERT INTO skill (sk_name) VALUES('crafting');
INSERT INTO skill (sk_name) VALUES('smithing');
INSERT INTO skill (sk_name) VALUES('mining');
INSERT INTO skill (sk_name) VALUES('herblore');
INSERT INTO skill (sk_name) VALUES('agility');
INSERT INTO skill (sk_name) VALUES('thieving');
INSERT INTO skill (sk_name) VALUES('slayer');
INSERT INTO skill (sk_name) VALUES('farming');
INSERT INTO skill (sk_name) VALUES('runecrafting');
INSERT INTO skill (sk_name) VALUES('hunter');
INSERT INTO skill (sk_name) VALUES('construction');
INSERT INTO skill (sk_name) VALUES('summoning');
INSERT INTO skill (sk_name) VALUES('dungeoneering');
INSERT INTO skill (sk_name) VALUES('divination');
INSERT INTO skill (sk_name) VALUES('invention');