
-- create and use the database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS autolinks DEFAULT CHARACTER SET binary;
-- USE autolinks;

-- create the table
CREATE TABLE triples (
	username   varchar(128)  NOT NULL DEFAULT '',
	servicekey varchar(1024) NOT NULL DEFAULT '',
	subject    value varchar(1024) NOT NULL DEFAULT '',
	predicate  value varchar(1024) NOT NULL DEFAULT '',
	object     value varchar(1024) NOT NULL DEFAULT '',
	properties value varchar(1024) NOT NULL DEFAULT ''
) ENGINE=MyISAM;

