-- Existing refresh tokens are plaintext. Revoke them and remove their values;
-- users will sign in again after this migration is deployed.
DELETE FROM "RefreshToken";

DROP INDEX IF EXISTS "RefreshToken_token_key";

ALTER TABLE "RefreshToken" RENAME COLUMN "token" TO "tokenHash";

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
