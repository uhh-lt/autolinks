
-- working with sqlite3 commandline:
--   start: sqlite3 <file>
--   quit: .q
--   show tables: .tables
--   show schema: .schema

-- Note: rowid is implicitly accessible, e.g. "select rowid,* from services"

-- services and their endpoints
create table if not exists services (
  name text primary key not null,
  location text not null,
  description text,
  registeredsince integer not null,
  active boolean default false,
  lastseenactive integer not null default -1
);
create table if not exists endpoints (
  service text not null,
  name text not null,
  description text,
  requireslogin boolean default false,
  lastcalled integer not null default -1,
  primary key(service, name)
);
