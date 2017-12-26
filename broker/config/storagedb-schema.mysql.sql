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


CREATE TABLE IF NOT EXISTS resourceToTriples (
  rid int unsigned NOT NULL,
  tid int unsigned NOT NULL,
  PRIMARY KEY (rid, tid),
  KEY (rid),
  KEY (tid)
) ENGINE=MyISAM;


CREATE TABLE IF NOT EXISTS storage (
  sid        int unsigned NOT NULL AUTO_INCREMENT,
  username   varchar(32),
  storagekey varchar(512) NOT NULL,
  PRIMARY KEY (sid, username, storagekey(256))
) ENGINE=MyISAM;


CREATE TABLE IF NOT EXISTS storageToTriples (
  sid int unsigned NOT NULL AUTO_INCREMENT,
  tid int unsigned NOT NULL,
  PRIMARY KEY (sid, tid),
  KEY (sid),
  KEY (tid)
) ENGINE=MyISAM;


drop function if exists add_triple_to_storage;


drop function if exists add_child_to_resource;


drop function if exists add_to_storage;


drop function if exists add_triple_complete;


drop function if exists add_resource;


drop function if exists add_triple;


DELIMITER //


create function add_triple_to_storage (
  sid int unsigned, tid int unsigned)
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare mapping_exists tinyint default 0;
  select count(*) > 0 into mapping_exists from storageToTriples where sid = sid and tid = tid limit 1;
  if not mapping_exists then
    insert into storageToTriples set sid = sid, tid = tid;
  end if;
  return mapping_exists;
END //


create function add_child_to_resource (
  rid int unsigned, tid int unsigned)
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare mapping_exists int unsigned default 0;
  -- check for existence
  select count(*) > 0 into mapping_exists from resourceToTriples where rid = rid and tid = tid limit 1;
  if not mapping_exists then
    insert into resourceToTriples set rid = rid, tid = tid;
  end if;
  return mapping_exists;
END //


create function add_to_storage (
  username varchar(32), storagekey varchar(512))
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare sid_ int unsigned default 0;
  select sid into sid_ from storage where username = username and storagekey = storagekey limit 1;
  if sid_ = 0 then
    insert into storage set username = username, storagekey = storagekey;
    select LAST_INSERT_ID() into sid_;
  end if;
  return sid_;
END //


create function add_triple_complete (
  subject varchar(512), predicate varchar(512), object varchar(512))
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare tid_, rid_s, rid_p, rid_o int unsigned default 0;
  select add_resource(subject) into rid_s;
  select add_resource(predicate) into rid_p;
  select add_resource(object) into rid_o;
  select add_triple(rid_s, rid_p, rid_o) into tid_;
  return tid_;
END //


create function add_resource (
  surface_form varchar(512))
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  select rid into rid_ from resources where surfaceform = surface_form limit 1;
  if rid_ = 0 or surface_form is NULL then
    insert into resources set surfaceform = surface_form;
    select LAST_INSERT_ID() into rid_;
  end if;
  return rid_;
END //


create function add_triple (
  rid_s int unsigned, rid_p int unsigned, rid_o int unsigned)
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare tid_ int unsigned default 0;
  select tid into tid_ from triples where s = rid_s and p = rid_p and o = rid_o limit 1;
  if tid_ = 0 then
    insert into triples set s = rid_s, p = rid_p, o = rid_o;
    select LAST_INSERT_ID() into tid_;
  end if;
  return tid_;
END //


DELIMITER ;