
-- create and use the database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS autolinks DEFAULT CHARACTER SET binary;
-- USE autolinks;

-- create the table
CREATE TABLE IF NOT EXISTS triples (
  tid  int unsigned NOT NULL AUTO_INCREMENT,
  s    int unsigned NOT NULL,
  p    int unsigned NOT NULL,
  o    int unsigned NOT NULL,
  PRIMARY KEY (tid),
  KEY (s),
  KEY (p),
  KEY (o),
  UNIQUE spo (s, p, o)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resources (
  rid  int unsigned NOT NULL AUTO_INCREMENT,
  s    varchar(512) DEFAULT NULL,
  PRIMARY KEY (rid),
  UNIQUE (s(333))
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS t2r (
  tid int unsigned NOT NULL,
  parent_rid int unsigned NOT NULL,
  PRIMARY KEY (tid, parent_rid),
  KEY (tid),
  KEY (parent_rid)
) ENGINE=MyISAM;
