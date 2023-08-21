
DELETE FROM member;
INSERT INTO member(id, member) VALUES ('b603abdf-6e15-4e49-a457-c9394867c7cf', '{"email":"molly@books.com","name":"Molly Member","roles":["member"],"password":"$2b$10$Y00XOZD/f5gBSpDusPUgU.iJufk6Nxx6gAoHRG8t2eHyGgoP2bK4y"}');
INSERT INTO member(id, member) VALUES ('4ae66869-e58a-4f36-8a77-e30b3ea1bd35', '{"email":"anna@books.com","name": "Anna Admin","roles":["member","admin"],"password":"$2b$10$Y00XOZD/f5gBSpDusPUgU.G1ohpR3oQbbBHK4KzX7dU219Pv/lzze"}');
INSERT INTO member(id, member) VALUES ('3a4a411a-727a-44fd-a2d1-b54afe61f504', '{"email":"nobby@books.com","name":"Nobby Nobody","roles":[],"password": "$2a$12$ZnrvkMk9jn56NlyJGOyTE.biz5xvJUr1iKIFsWyFWPFF/x3j5fUhm"}');
INSERT INTO member(id, member) VALUES ('e97a6f46-9f1a-4df4-89e8-eb9b4041af60', '{"email":"miles@books.com","name":"Miles Member","roles":["member"],"password": "$2a$04$u0OEwkeVWgdsOznC7/JH6eYe8nv0WcWzfiL5xY7oHHb8iDIfKChEy"}');

DELETE FROM workspace;
-- Molly's workspace(s)
INSERT INTO workspace(id, uid, data) VALUES ('f484042b-6dd1-4fb3-bf44-1331ab15432f', 'b603abdf-6e15-4e49-a457-c9394867c7cf', '{"name":"Molly Personal Workspace"}');
INSERT INTO workspace(id, uid, data) VALUES ('76f8ba91-4b83-4fb3-ac30-736519abb8fa', 'b603abdf-6e15-4e49-a457-c9394867c7cf', '{"name":"Molly Professional Workspace"}');
-- Anna's workspace(s)
INSERT INTO workspace(id, uid, data) VALUES ('fe7de6c9-2599-479f-97fe-2339d4098d61', '4ae66869-e58a-4f36-8a77-e30b3ea1bd35', '{"name":"Anna Personal Workspace"}');
INSERT INTO workspace(id, uid, data) VALUES ('dd35c6b9-f7fd-43e4-9fe3-0da93832e286', '4ae66869-e58a-4f36-8a77-e30b3ea1bd35', '{"name":"Anna Professional Workspace"}');

DELETE FROM workspaceUser;
-- Giving Molly access to Anna's Personal Workspace
INSERT INTO workspaceUser(uid, wid) VALUES ('b603abdf-6e15-4e49-a457-c9394867c7cf', 'fe7de6c9-2599-479f-97fe-2339d4098d61');
-- Givin Anna access to Molly's Personal Workspace
INSERT INTO workspaceUser(uid, wid) VALUES ('4ae66869-e58a-4f36-8a77-e30b3ea1bd35', 'f484042b-6dd1-4fb3-bf44-1331ab15432f');

DELETE FROM channel;
-- Molly's channel(s)
INSERT INTO channel(id, wid, data) VALUES ('5bbc4774-4a9f-4647-bf86-bc65842e1cbb', 'f484042b-6dd1-4fb3-bf44-1331ab15432f', '{"name":"Molly Personal Channel"}');
INSERT INTO channel(id, wid, data) VALUES ('6f99af3a-795e-48a0-aae3-85ad799ed6e9', 'f484042b-6dd1-4fb3-bf44-1331ab15432f', '{"name":"Molly Personal Channel Two"}');
-- Anna's channel(s)
INSERT INTO channel(id, wid, data) VALUES ('0f9cb35b-35f5-4dbd-9a78-c319cba84461', 'fe7de6c9-2599-479f-97fe-2339d4098d61', '{"name":"Anna Personal Channel"}');
INSERT INTO channel(id, wid, data) VALUES ('8e4f3607-5db5-45c4-acf4-5ebbffc2b4f4', 'fe7de6c9-2599-479f-97fe-2339d4098d61', '{"name":"Anna Personal Channel Two"}');

DELETE FROM message;
-- Molly's Personal Channel message(s)
INSERT INTO message(id, cid, data) VALUES ('f8fae3a3-2050-41fc-ab20-85114cb70bc2', '5bbc4774-4a9f-4647-bf86-bc65842e1cbb', '{"sender":"b603abdf-6e15-4e49-a457-c9394867c7cf","message":"Hi everyone!"}');
INSERT INTO message(id, cid, data) VALUES ('79f2e35a-adb8-4e0c-9107-f313771ab343', '5bbc4774-4a9f-4647-bf86-bc65842e1cbb', '{"sender":"4ae66869-e58a-4f36-8a77-e30b3ea1bd35","message":"How are you?"}');
-- Anna's Personal Channel message(s)
INSERT INTO message(id, cid, data) VALUES ('773e7346-e4fb-46ac-843f-22d2107e83aa', '0f9cb35b-35f5-4dbd-9a78-c319cba84461', '{"sender":"4ae66869-e58a-4f36-8a77-e30b3ea1bd35","message":"Bonjour!"}');
INSERT INTO message(id, cid, data) VALUES ('63ff55b5-b7bf-446a-ace9-5c429fd32324', '0f9cb35b-35f5-4dbd-9a78-c319cba84461', '{"sender":"b603abdf-6e15-4e49-a457-c9394867c7cf","message":"Ca va?"}');
