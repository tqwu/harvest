
-- Drop from innermost table to outermost
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS channel;
DROP TABLE IF EXISTS workspaceUser;
DROP TABLE IF EXISTS workspace;
DROP TABLE IF EXISTS member;

CREATE TABLE member(id UUID UNIQUE PRIMARY KEY, member jsonb);
CREATE TABLE workspace(id UUID UNIQUE PRIMARY KEY, uid UUID references member(id) ON DELETE CASCADE, data jsonb);
CREATE TABLE workspaceUser(uid UUID references member(id) ON DELETE CASCADE, wid UUID references workspace(id) ON DELETE CASCADE);
CREATE TABLE channel(id UUID UNIQUE PRIMARY KEY, wid UUID references workspace(id) ON DELETE CASCADE, data jsonb);
CREATE TABLE message(id UUID UNIQUE PRIMARY KEY, cid UUID references channel(id) ON DELETE CASCADE, data jsonb);
