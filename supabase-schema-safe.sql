-- ============================================
-- SECURYFLEX DATABASE SCHEMA (SAFE VERSION)
-- Voor Supabase PostgreSQL
-- Dit script checkt eerst of objecten bestaan
-- ============================================

-- ============================================
-- DROP EXISTING TABLES (indien nodig)
-- ============================================
-- Uncomment deze sectie als je alles wilt resetten:
/*
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Betaling" CASCADE;
DROP TABLE IF EXISTS "Factuur" CASCADE;
DROP TABLE IF EXISTS "Medewerker" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Werkuur" CASCADE;
DROP TABLE IF EXISTS "OpdrachtenBeveiligers" CASCADE;
DROP TABLE IF EXISTS "Opdracht" CASCADE;
DROP TABLE IF EXISTS "Opdrachtgever" CASCADE;
DROP TABLE IF EXISTS "BedrijfProfile" CASCADE;
DROP TABLE IF EXISTS "ZZPProfile" CASCADE;
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "AccountStatus" CASCADE;
DROP TYPE IF EXISTS "SubscriptionTier" CASCADE;
DROP TYPE IF EXISTS "OpdrachtStatus" CASCADE;
*/

-- ============================================
-- CREATE ENUMS (if not exists)
-- ============================================

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ZZP_BEVEILIGER', 'BEDRIJF', 'OPDRACHTGEVER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionTier" AS ENUM ('ZZP', 'SMALL', 'MEDIUM', 'LARGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OpdrachtStatus" AS ENUM ('OPEN', 'TOEGEWEZEN', 'BEZIG', 'AFGEROND', 'GEANNULEERD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CREATE TABLES (if not exists)
-- ============================================

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Add unique index if not exists
DO $$ BEGIN
    CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "externalId" TEXT,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- ZZPProfile table
CREATE TABLE IF NOT EXISTS "ZZPProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kvkNummer" TEXT NOT NULL,
    "btwNummer" TEXT,
    "specialisaties" TEXT[],
    "certificaten" TEXT[],
    "werkgebied" TEXT[],
    "beschikbaarheid" JSONB NOT NULL,
    "uurtarief" DECIMAL(10,2) NOT NULL,
    "rating" DECIMAL(2,1),
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "subscriptionId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ZZPProfile_pkey" PRIMARY KEY ("id")
);

-- BedrijfProfile table
CREATE TABLE IF NOT EXISTS "BedrijfProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bedrijfsnaam" TEXT NOT NULL,
    "kvkNummer" TEXT NOT NULL,
    "btwNummer" TEXT NOT NULL,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "extraAccounts" INTEGER NOT NULL DEFAULT 0,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'SMALL',
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BedrijfProfile_pkey" PRIMARY KEY ("id")
);

-- Opdrachtgever table
CREATE TABLE IF NOT EXISTS "Opdrachtgever" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bedrijfsnaam" TEXT NOT NULL,
    "kvkNummer" TEXT,
    "contactpersoon" TEXT NOT NULL,
    "totalHoursBooked" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opdrachtgever_pkey" PRIMARY KEY ("id")
);

-- Opdracht table
CREATE TABLE IF NOT EXISTS "Opdracht" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschrijving" TEXT NOT NULL,
    "locatie" TEXT NOT NULL,
    "startDatum" TIMESTAMP(3) NOT NULL,
    "eindDatum" TIMESTAMP(3) NOT NULL,
    "aantalBeveiligers" INTEGER NOT NULL,
    "uurtarief" DECIMAL(10,2) NOT NULL,
    "status" "OpdrachtStatus" NOT NULL DEFAULT 'OPEN',
    "opdrachtgeverId" TEXT NOT NULL,
    "bedrijfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opdracht_pkey" PRIMARY KEY ("id")
);

-- OpdrachtenBeveiligers table
CREATE TABLE IF NOT EXISTS "OpdrachtenBeveiligers" (
    "id" TEXT NOT NULL,
    "opdrachtId" TEXT NOT NULL,
    "beveiligerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "OpdrachtenBeveiligers_pkey" PRIMARY KEY ("id")
);

-- Werkuur table
CREATE TABLE IF NOT EXISTS "Werkuur" (
    "id" TEXT NOT NULL,
    "opdrachtId" TEXT NOT NULL,
    "startTijd" TIMESTAMP(3) NOT NULL,
    "eindTijd" TIMESTAMP(3),
    "startLocatie" JSONB NOT NULL,
    "eindLocatie" JSONB,
    "urenGewerkt" DECIMAL(10,2) NOT NULL,
    "uurtarief" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL DEFAULT 2.99,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Werkuur_pkey" PRIMARY KEY ("id")
);

-- Review table
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "beveiligerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Medewerker table
CREATE TABLE IF NOT EXISTS "Medewerker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "functie" TEXT NOT NULL,
    "bedrijfId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Medewerker_pkey" PRIMARY KEY ("id")
);

-- Factuur table
CREATE TABLE IF NOT EXISTS "Factuur" (
    "id" TEXT NOT NULL,
    "nummer" TEXT NOT NULL,
    "bedrag" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "zzpId" TEXT,
    "bedrijfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Factuur_pkey" PRIMARY KEY ("id")
);

-- Betaling table
CREATE TABLE IF NOT EXISTS "Betaling" (
    "id" TEXT NOT NULL,
    "bedrag" DECIMAL(10,2) NOT NULL,
    "methode" TEXT NOT NULL,
    "opdrachtgeverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Betaling_pkey" PRIMARY KEY ("id")
);

-- Account table (NextAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Session table (NextAuth)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- ADD INDEXES (if not exists)
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_externalId_key" ON "Subscription"("externalId");
CREATE UNIQUE INDEX IF NOT EXISTS "ZZPProfile_userId_key" ON "ZZPProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ZZPProfile_kvkNummer_key" ON "ZZPProfile"("kvkNummer");
CREATE UNIQUE INDEX IF NOT EXISTS "BedrijfProfile_userId_key" ON "BedrijfProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "BedrijfProfile_kvkNummer_key" ON "BedrijfProfile"("kvkNummer");
CREATE UNIQUE INDEX IF NOT EXISTS "Opdrachtgever_userId_key" ON "Opdrachtgever"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "OpdrachtenBeveiligers_unique" ON "OpdrachtenBeveiligers"("opdrachtId", "beveiligerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Medewerker_email_key" ON "Medewerker"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Factuur_nummer_key" ON "Factuur"("nummer");
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- Performance indexes
CREATE INDEX IF NOT EXISTS "Opdracht_status_idx" ON "Opdracht"("status");
CREATE INDEX IF NOT EXISTS "Opdracht_opdrachtgeverId_idx" ON "Opdracht"("opdrachtgeverId");
CREATE INDEX IF NOT EXISTS "Opdracht_bedrijfId_idx" ON "Opdracht"("bedrijfId");
CREATE INDEX IF NOT EXISTS "Werkuur_opdrachtId_idx" ON "Werkuur"("opdrachtId");
CREATE INDEX IF NOT EXISTS "Review_beveiligerId_idx" ON "Review"("beveiligerId");

-- ============================================
-- ADD FOREIGN KEY CONSTRAINTS (if not exists)
-- ============================================

-- Check and add foreign keys only if they don't exist
DO $$ BEGIN
    ALTER TABLE "ZZPProfile" ADD CONSTRAINT "ZZPProfile_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ZZPProfile" ADD CONSTRAINT "ZZPProfile_subscriptionId_fkey"
        FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "BedrijfProfile" ADD CONSTRAINT "BedrijfProfile_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "BedrijfProfile" ADD CONSTRAINT "BedrijfProfile_subscriptionId_fkey"
        FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Opdrachtgever" ADD CONSTRAINT "Opdrachtgever_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Opdracht" ADD CONSTRAINT "Opdracht_opdrachtgeverId_fkey"
        FOREIGN KEY ("opdrachtgeverId") REFERENCES "Opdrachtgever"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Opdracht" ADD CONSTRAINT "Opdracht_bedrijfId_fkey"
        FOREIGN KEY ("bedrijfId") REFERENCES "BedrijfProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "OpdrachtenBeveiligers" ADD CONSTRAINT "OpdrachtenBeveiligers_opdrachtId_fkey"
        FOREIGN KEY ("opdrachtId") REFERENCES "Opdracht"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "OpdrachtenBeveiligers" ADD CONSTRAINT "OpdrachtenBeveiligers_beveiligerId_fkey"
        FOREIGN KEY ("beveiligerId") REFERENCES "ZZPProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Werkuur" ADD CONSTRAINT "Werkuur_opdrachtId_fkey"
        FOREIGN KEY ("opdrachtId") REFERENCES "Opdracht"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Review" ADD CONSTRAINT "Review_beveiligerId_fkey"
        FOREIGN KEY ("beveiligerId") REFERENCES "ZZPProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Medewerker" ADD CONSTRAINT "Medewerker_bedrijfId_fkey"
        FOREIGN KEY ("bedrijfId") REFERENCES "BedrijfProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Factuur" ADD CONSTRAINT "Factuur_zzpId_fkey"
        FOREIGN KEY ("zzpId") REFERENCES "ZZPProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Factuur" ADD CONSTRAINT "Factuur_bedrijfId_fkey"
        FOREIGN KEY ("bedrijfId") REFERENCES "BedrijfProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Betaling" ADD CONSTRAINT "Betaling_opdrachtgeverId_fkey"
        FOREIGN KEY ("opdrachtgeverId") REFERENCES "Opdrachtgever"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ZZPProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BedrijfProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opdrachtgever" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opdracht" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Werkuur" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Betaling" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ENABLE REAL-TIME SUBSCRIPTIONS
-- ============================================

-- Check if publication exists, if not create it
DO $$ BEGIN
    CREATE PUBLICATION supabase_realtime;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add tables to realtime (safe method)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Opdracht";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Werkuur";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "OpdrachtenBeveiligers";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Review";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Betaling";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CREATE UPDATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables (DROP and recreate to avoid duplicates)
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_zzp_updated_at ON "ZZPProfile";
CREATE TRIGGER update_zzp_updated_at BEFORE UPDATE ON "ZZPProfile" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_bedrijf_updated_at ON "BedrijfProfile";
CREATE TRIGGER update_bedrijf_updated_at BEFORE UPDATE ON "BedrijfProfile" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_opdrachtgever_updated_at ON "Opdrachtgever";
CREATE TRIGGER update_opdrachtgever_updated_at BEFORE UPDATE ON "Opdrachtgever" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_opdracht_updated_at ON "Opdracht";
CREATE TRIGGER update_opdracht_updated_at BEFORE UPDATE ON "Opdracht" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_updated_at ON "Subscription";
CREATE TRIGGER update_subscription_updated_at BEFORE UPDATE ON "Subscription" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ BEGIN
    RAISE NOTICE 'Database schema created/updated successfully!';
END $$;