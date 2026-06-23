-- Step 1: Add the 4 new columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS booked_at TIMESTAMP;

-- Step 2: Add new enum values first (so we can migrate data to them)
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'GENERATED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'SENT';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'REPLIED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'BOOKED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- Step 3: Remap existing data to new enum values
UPDATE leads SET status = 'PENDING'  WHERE status = 'NEW';
UPDATE leads SET status = 'SENT'     WHERE status = 'CONTACTED';
UPDATE leads SET status = 'REPLIED'  WHERE status = 'REPLIED';
UPDATE leads SET status = 'REJECTED' WHERE status = 'NOT_INTERESTED';
UPDATE leads SET status = 'REJECTED' WHERE status = 'BOUNCED';
UPDATE leads SET status = 'REJECTED' WHERE status = 'UNSUBSCRIBED';
UPDATE leads SET status = 'REJECTED' WHERE status = 'INTERESTED';

-- Step 4: Drop old enum values (PostgreSQL 12+ supports this)
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
CREATE TYPE "LeadStatus" AS ENUM ('PENDING', 'GENERATED', 'SENT', 'REPLIED', 'BOOKED', 'REJECTED');
ALTER TABLE leads ALTER COLUMN status TYPE "LeadStatus" USING status::text::"LeadStatus";
DROP TYPE "LeadStatus_old";
