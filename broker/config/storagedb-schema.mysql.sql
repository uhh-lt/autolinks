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
  islist      boolean DEFAULT false,
  istriple    boolean DEFAULT NULL,
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


CREATE TABLE IF NOT EXISTS storageToResource (
  sid int unsigned NOT NULL AUTO_INCREMENT,
  rid int unsigned NOT NULL,
  PRIMARY KEY (sid, rid),
  KEY (sid),
  KEY (rid)
) ENGINE=MyISAM;


drop function if exists add_resource_to_triple_mapping;


drop function if exists add_child_to_resource;


drop function if exists add_to_storage;


drop function if exists add_triple_complete;


drop function if exists add_resource;


drop function if exists add_triple;


drop function if exists add_storage_to_resource_mapping;


DELIMITER //


create function add_to_storage (
  username_ varchar(32), storagekey_ varchar(512))
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare sid_ int unsigned default 0;
  select sid into sid_ from storage where username = username_ and storagekey = storagekey_ limit 1;
  if sid_ = 0 then
    insert into storage set username = username_, storagekey = storagekey_;
    select LAST_INSERT_ID() into sid_;
  end if;
  return sid_;
END //


create function add_resource (
  surfaceform_ varchar(512), islist_ boolean, istriple_ boolean)
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  if surfaceform_ is NULL and not islist_ and not istriple_ then
    return rid_;
  end if;
  select rid into rid_ from resources where surfaceform = surfaceform_ and islist = islist_ and istriple = istriple_ limit 1;
  if rid_ = 0 then
    insert into resources set surfaceform = surfaceform_, islist = islist_, istriple = istriple_;
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


create function add_resource_to_triple_mapping (
  rid_ int unsigned, tid_ int unsigned)
RETURNS tinyint DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare mapping_exists tinyint default 0;
  -- check for existence
  select count(*) > 0 into mapping_exists from resourceToTriples where rid = rid_ and tid = tid_ limit 1;
  if not mapping_exists then
    insert into resourceToTriples set rid = rid_, tid = tid_;
  end if;
  return mapping_exists;
END //


create function add_storage_to_resource_mapping (
  sid_ int unsigned, rid_ int unsigned)
RETURNS tinyint DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare mapping_exists tinyint default 0;
  select count(*) > 0 into mapping_exists from storageToResource where sid = sid_ and rid = rid_ limit 1;
  if not mapping_exists then
    insert into storageToResource set sid = sid_, rid = rid_;
  end if;
  return mapping_exists;
END //


DELIMITER ;