-- AlterTable
CREATE SEQUENCE follow_id_seq;
ALTER TABLE "Follow" ALTER COLUMN "id" SET DEFAULT nextval('follow_id_seq');
ALTER SEQUENCE follow_id_seq OWNED BY "Follow"."id";
