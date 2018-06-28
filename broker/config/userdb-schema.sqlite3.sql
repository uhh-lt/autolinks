
-- working with sqlite3 commandline:
--   start: sqlite3 <file>
--   quit: .q
--   show tables: .tables
--   show schema: .schema

-- Note: rowid is implicitly accessible, e.g. "select rowid,* from users"

-- user
create table if not exists users (
  name text primary key not null,
  password text,
  active boolean default true,
  registeredsince integer not null default -1,
  lastseenactive integer not null default -1
);

-- create admin user
insert into users(name, password) select 'root','toor' where not exists (select 1 from users where name = 'root');

-- create default user
insert into users(name, password) select 'john','doe' where not exists (select 1 from users where name = 'john');

-- create a user
-- insert or replace into users(name, password) values ('john','doe');