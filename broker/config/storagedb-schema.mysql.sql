-- create and use the database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS autolinks DEFAULT CHARACTER SET binary;
-- USE autolinks;

-- create the tables
CREATE TABLE IF NOT EXISTS resources (
  rid         int unsigned NOT NULL AUTO_INCREMENT,
  isstring    boolean DEFAULT NULL,
  istriple    boolean DEFAULT NULL,
  islist      boolean DEFAULT NULL,
  PRIMARY KEY (rid)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resourceMetadata (
  uid          int unsigned NOT NULL,
  rid          int unsigned NOT NULL,
  mkey         varchar(64) NOT NULL,
  mvalue       varchar(512) NOT NULL,
  PRIMARY KEY (uid, rid, mkey)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS stringResources (
  rid         int unsigned NOT NULL,
  surfaceform varchar(512) NOT NULL,
  PRIMARY KEY (rid),
  UNIQUE (surfaceform(333))
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS tripleResources (
  rid  int unsigned NOT NULL,
  subj int unsigned NOT NULL,
  pred int unsigned NOT NULL,
  obj  int unsigned NOT NULL,
  PRIMARY KEY (rid),
  KEY (subj),
  KEY (pred),
  KEY (obj),
  UNIQUE spo (subj, pred, obj)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS listResources (
  rid            int unsigned NOT NULL,
  listdescriptor varchar(256) NOT NULL,
  PRIMARY KEY (rid, listdescriptor),
  KEY (rid),
  KEY (listdescriptor)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS listResourceItems (
  rid     int unsigned NOT NULL,
  itemrid int unsigned NOT NULL,
  PRIMARY KEY (rid, itemrid),
  KEY (rid),
  KEY (itemrid)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS resourcePermission (
  rid         int unsigned NOT NULL,
  uid         int unsigned NOT NULL,
  r           boolean DEFAULT TRUE,
  w           boolean DEFAULT NULL,
  PRIMARY KEY (rid,uid),
  KEY (uid),
  KEY (rid)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS storageItems (
  sid        int unsigned NOT NULL AUTO_INCREMENT,
  uid        int unsigned NOT NULL,
  storagekey varchar(512) NOT NULL,
  PRIMARY KEY (sid, uid, storagekey(256))
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS storageItemToResource (
  sid int unsigned NOT NULL AUTO_INCREMENT,
  rid int unsigned NOT NULL,
  PRIMARY KEY (sid, rid),
  KEY (sid),
  KEY (rid)
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS users (
  uid         int unsigned NOT NULL AUTO_INCREMENT,
  name        varchar(32),
  isgroup     boolean DEFAULT NULL,
  PRIMARY KEY (uid),
  UNIQUE (name)
) ENGINE=MyISAM;

-- DEFINE SOME HELPER FUNCTIONS

drop procedure if exists reset_database;

drop function if exists add_resource;

drop function if exists get_or_add_stringResource;

drop function if exists get_or_add_tripleResource;

drop function if exists get_or_add_listResource;

drop function if exists add_listResourceItem;

drop function if exists get_or_add_storageItem;

drop function if exists create_storageItemToResourceMapping;

drop function if exists get_uid;

drop function if exists get_or_add_user;

drop procedure if exists full_delete_resource;

drop procedure if exists remove_stringResourceFromContainer;

drop procedure if exists remove_tripleResourceFromContainer;

drop procedure if exists remove_listResourceFromContainer;

drop procedure if exists edit_resourceContainer;

DELIMITER //

create procedure reset_database( )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    truncate stringResources;
    truncate tripleResources;
    truncate listResources;
    truncate listResourceItems;
    truncate resourceMetadata;
    truncate resources;
    truncate users;
    truncate resourcePermission;
    truncate storageItemToResource;
    truncate storageItems;
  COMMIT ;
END //

create function add_resource ( isstring_ boolean, istriple_ boolean, islist_ boolean )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  -- TODO: check if multiple values are set
  if NOT ( isstring_ AND istriple_ AND islist_) then
    return rid_;
  end if;
  insert into resources set isstring = isstring_, istriple = istriple_, islist = islist_;
  select LAST_INSERT_ID() into rid_;
  return rid_;
END //

create function get_or_add_stringResource ( surfaceform_ varchar(512) )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  if surfaceform_ is NULL then
    return rid_;
  end if;
  select rid into rid_ from stringResources where surfaceform = surfaceform_ limit 1;
  if rid_ = 0 then
    select add_resource(TRUE, NULL, NULL) into rid_;
    insert into stringResources set rid = rid_, surfaceform = surfaceform_;
  end if;
  return rid_;
END //

create procedure full_delete_resource( IN rid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the resource from every possible entry there might be
    delete from resources where rid = rid_;
    delete from listResourceItems where itemrid = rid_;
    delete from tripleResources where subj = rid_;
    delete from tripleResources where pred = rid_;
    delete from tripleResources where obj = rid_;
    -- only for stringResources
    delete from stringResources where rid = rid_;
    -- only for tripleResources
    delete from tripleResources where rid = rid_;
    -- only for listResources
    delete from listResources where rid = rid_;
    delete from storageItemToResource where rid = rid_;
  COMMIT ;
END //

create function get_or_add_tripleResource ( subj_ int unsigned, pred_ int unsigned, obj_ int unsigned )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  select rid into rid_ from tripleResources where subj = subj_ and pred = pred_ and obj = obj_ limit 1;
  if rid_ = 0 then
    select add_resource(NULL, TRUE, NULL) into rid_;
    insert into tripleResources set rid = rid_, subj = subj_, pred = pred_, obj = obj_;
  end if;
  return rid_;
END //

create function get_or_add_listResource ( listdescriptor_ varchar(512) )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare rid_ int unsigned default 0;
  if listdescriptor_ is NULL then
    return rid_;
  end if;
  select rid into rid_ from listResources where listdescriptor = listdescriptor_ limit 1;
  if rid_ = 0 then
    select add_resource(NULL, NULL, TRUE) into rid_;
    insert into listResources set rid = rid_, listdescriptor = listdescriptor_;
  end if;
  return rid_;
END //

create function add_listResourceItem ( rid_ int unsigned, itemrid_ int unsigned )
RETURNS boolean DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare list_item_existed boolean default false;
  select count(*) > 0 into list_item_existed from listResourceItems where rid = rid_ and itemrid = itemrid_ limit 1;
  if not list_item_existed then
    insert into listResourceItems set rid = rid_, itemrid = itemrid_;
  end if;
  return list_item_existed;
END //

create function get_or_add_storageItem ( uid_ int unsigned, storagekey_ varchar(512) )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare sid_ int unsigned default 0;
  -- get the sid
  select sid into sid_ from storageItems where uid = uid_ and storagekey = storagekey_ limit 1;
  if sid_ = 0 then
    insert into storageItems set uid = uid_, storagekey = storagekey_;
    select LAST_INSERT_ID() into sid_;
  end if;
  return sid_;
END //

create function create_storageItemToResourceMapping ( sid_ int unsigned, rid_ int unsigned )
RETURNS boolean DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare mapping_existed boolean default false;
  select count(*) > 0 into mapping_existed from storageItemToResource where sid = sid_ and rid = rid_ limit 1;
  if not mapping_existed then
    insert into storageItemToResource set sid = sid_, rid = rid_;
  end if;
  return mapping_existed;
END //

create function get_uid ( name_ varchar(32) )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare uid_ int unsigned default 0;
  if name_ is NULL then
    return uid_;
  end if;
  select uid into uid_ from users where name = name_ limit 1;
  return uid_;
END //

create function get_or_add_user ( name_ varchar(32), isgroup_ boolean )
RETURNS int unsigned DETERMINISTIC MODIFIES SQL DATA
BEGIN
  declare uid_ int unsigned default 0;
  if name_ is NULL then
    return uid_;
  end if;
  select get_uid( name_ ) into uid_;
  if uid_ = 0 then
    insert into users set name = name_, isgroup = isgroup_;
  end if;
  return uid_;
END //

create procedure remove_stringResourceFromContainer( IN rid_ int unsigned, IN cid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  DECLARE rid__ int unsigned;
  DECLARE done BOOLEAN DEFAULT FALSE;
  --
  DECLARE triplecur CURSOR FOR SELECT rid FROM tripleResources WHERE subj = rid_ OR pred = rid_ OR obj = rid_;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;
  --
  START TRANSACTION ;
    -- find triples associated with rid_ and delete them from container with rid = cid_
    OPEN triplecur;
      tripleloop: LOOP
        FETCH triplecur INTO rid__;
        IF done THEN
          LEAVE tripleloop;
        END IF;
        call remove_tripleResourceFromContainer(rid__, cid_);
      END LOOP tripleloop;
    CLOSE triplecur;
    -- delete the resource rid_ from the current view / container with rid = cid_
    delete from listResourceItems where rid = cid_ and itemrid = rid_;
  COMMIT ;
END //

create procedure remove_tripleResourceFromContainer( IN rid_ int unsigned, IN cid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the resource rid_ from the current view / container with rid = cid_
    delete from listResourceItems where rid = cid_ and itemrid = rid_;
    -- get subj and obj and make an entry for them in the list if it doesn't exist yet
    select add_listResourceItem(cid_, subj), add_listResourceItem(cid_, obj) from tripleResources where rid = rid_;
  COMMIT ;
END //

create procedure remove_listResourceFromContainer( IN rid_ int unsigned, IN cid_ int unsigned )
MODIFIES SQL DATA
BEGIN
  -- since a hypernode is also a node, we treat it the same way
  -- NOTE: this also removes the childs from the current view!
  call remove_stringResourceFromContainer(rid_, cid_);
END //

create procedure edit_resourceContainer( IN rid_ int unsigned, IN cid_old int unsigned, IN cid_new int unsigned)
MODIFIES SQL DATA
BEGIN
  START TRANSACTION ;
    -- delete the resource rid_ from the current view / container with rid = cid_old
    delete from listResourceItems where rid = cid_old and itemrid = rid_;
    -- make an entry for the rid_ in the list of the new container with rid = cid_new
    select add_listResourceItem(cid_new, rid_);
    -- TODO: think what should happen with tripleResources, and triple resources connected to rid_!
  COMMIT ;
END //


DELIMITER ;
