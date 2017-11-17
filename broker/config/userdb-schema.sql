
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
  lastlogin integer,
  registeredsince integer
);
