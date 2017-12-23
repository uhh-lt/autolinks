
-- create and use the database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS autolinks DEFAULT CHARACTER SET binary;
-- USE autolinks;

-- create the tables

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
  rid         int unsigned NOT NULL AUTO_INCREMENT,
  surfaceform varchar(512) DEFAULT NULL,
  PRIMARY KEY (rid),
  UNIQUE (surfaceform(333))
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS t2r (
  tid int unsigned NOT NULL,
  parent_rid int unsigned NOT NULL,
  PRIMARY KEY (tid, parent_rid),
  KEY (tid),
  KEY (parent_rid)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS storage (
  sid        int unsigned NOT NULL AUTO_INCREMENT,
  username   varchar(32),
  storagekey varchar(512) NOT NULL,
  PRIMARY KEY (sid, username, storagekey(256))
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS s2t (
  sid int unsigned NOT NULL AUTO_INCREMENT,
  tid int unsigned NOT NULL,
  PRIMARY KEY (sid, tid),
  KEY (sid),
  KEY (tid)
) ENGINE=MyISAM;
