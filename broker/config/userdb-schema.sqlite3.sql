
-- working with sqlite3 commandline:
--   start: sqlite3 <file>
--   quit: .q
--   show tables: .tables
--   show schema: .schema

-- Note: rowid is implicitly accessible, e.g. "select rowid,* from users"

-- user
-- insert or replace into users(name, password) values ('john','doe');
create table if not exists users (
  name text primary key not null,
  password text,
  active boolean default true,
  registeredsince integer not null default -1,
  lastseenactive integer not null default -1
);

insert or replace into users(name, password) values ('john','doe');
