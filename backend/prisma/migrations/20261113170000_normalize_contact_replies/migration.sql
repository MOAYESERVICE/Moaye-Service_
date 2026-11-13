CREATE TYPE "ContactReplySender" AS ENUM ('CUSTOMER', 'ADMIN');

CREATE TABLE "ContactReply" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "senderRole" "ContactReplySender" NOT NULL,
    "senderName" TEXT NOT NULL,
    "message" VARCHAR(5000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactReply_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContactReply_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ContactReply_contactId_createdAt_idx" ON "ContactReply"("contactId", "createdAt");
CREATE INDEX "ContactReply_authorId_idx" ON "ContactReply"("authorId");

INSERT INTO "ContactReply" ("contactId", "senderRole", "senderName", "message", "createdAt")
SELECT
    c."id",
    CASE WHEN upper(coalesce(r->>'sender', 'CUSTOMER')) = 'ADMIN' THEN 'ADMIN'::"ContactReplySender" ELSE 'CUSTOMER'::"ContactReplySender" END,
    coalesce(r->>'name', CASE WHEN upper(coalesce(r->>'sender', 'CUSTOMER')) = 'ADMIN' THEN 'Administration' ELSE c."name" END),
    left(coalesce(r->>'message', ''), 5000),
    coalesce((r->>'createdAt')::timestamp(3), c."createdAt")
FROM "Contact" AS c
CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(c."replies") = 'array' THEN c."replies" ELSE '[]'::jsonb END
) AS r
WHERE coalesce(r->>'message', '') <> '';
