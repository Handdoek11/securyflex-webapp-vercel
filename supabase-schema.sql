-- ============================================
-- SECURYFLEX DATABASE SCHEMA
-- Voor Supabase PostgreSQL
-- ============================================

-- Drop existing tables (careful in production!)
-- Uncomment deze regels als je alles wilt resetten:
-- DROP TABLE IF EXISTS "Session" CASCADE;
-- DROP TABLE IF EXISTS "Account" CASCADE;
-- DROP TABLE IF EXISTS "Betaling" CASCADE;
-- DROP TABLE IF EXISTS "Factuur" CASCADE;
-- DROP TABLE IF EXISTS "Medewerker" CASCADE;
-- DROP TABLE IF EXISTS "Review" CASCADE;
-- DROP TABLE IF EXISTS "Werkuur" CASCADE;
-- DROP TABLE IF EXISTS "OpdrachtenBeveiligers" CASCADE;
-- DROP TABLE IF EXISTS "Opdracht" CASCADE;
-- DROP TABLE IF EXISTS "Opdrachtgever" CASCADE;
-- DROP TABLE IF EXISTS "BedrijfProfile" CASCADE;
-- DROP TABLE IF EXISTS "ZZPProfile" CASCADE;
-- DROP TABLE IF EXISTS "Subscription" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;
-- DROP TYPE IF EXISTS "UserRole" CASCADE;
-- DROP TYPE IF EXISTS "AccountStatus" CASCADE;
-- DROP TYPE IF EXISTS "SubscriptionTier" CASCADE;
-- DROP TYPE IF EXISTS "OpdrachtStatus" CASCADE;

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM ('ZZP_BEVEILIGER', 'BEDRIJF', 'OPDRACHTGEVER', 'ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "SubscriptionTier" AS ENUM ('ZZP', 'SMALL', 'MEDIUM', 'LARGE');
CREATE TYPE "OpdrachtStatus" AS ENUM ('OPEN', 'TOEGEWEZEN', 'BEZIG', 'AFGEROND', 'GEANNULEERD');

-- ============================================
-- USER & AUTH TABLES
-- ============================================

CREATE TABLE "User" (
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

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- ============================================
-- SUBSCRIPTION TABLE (needed for profiles)
-- ============================================

CREATE TABLE "Subscription" (
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

CREATE UNIQUE INDEX "Subscription_externalId_key" ON "Subscription"("externalId");

-- ============================================
-- ROLE-SPECIFIC PROFILES
-- ============================================

CREATE TABLE "ZZPProfile" (
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

CREATE UNIQUE INDEX "ZZPProfile_userId_key" ON "ZZPProfile"("userId");
CREATE UNIQUE INDEX "ZZPProfile_kvkNummer_key" ON "ZZPProfile"("kvkNummer");

CREATE TABLE "BedrijfProfile" (
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

CREATE UNIQUE INDEX "BedrijfProfile_userId_key" ON "BedrijfProfile"("userId");
CREATE UNIQUE INDEX "BedrijfProfile_kvkNummer_key" ON "BedrijfProfile"("kvkNummer");

CREATE TABLE "Opdrachtgever" (
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

CREATE UNIQUE INDEX "Opdrachtgever_userId_key" ON "Opdrachtgever"("userId");

-- ============================================
-- OPDRACHTEN & MATCHING
-- ============================================

CREATE TABLE "Opdracht" (
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

CREATE TABLE "OpdrachtenBeveiligers" (
    "id" TEXT NOT NULL,
    "opdrachtId" TEXT NOT NULL,
    "beveiligerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "OpdrachtenBeveiligers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OpdrachtenBeveiligers_opdrachtId_beveiligerId_key" ON "OpdrachtenBeveiligers"("opdrachtId", "beveiligerId");

-- ============================================
-- WERKUREN & GPS TRACKING
-- ============================================

CREATE TABLE "Werkuur" (
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

-- ============================================
-- SUPPORT TABLES
-- ============================================

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "beveiligerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Medewerker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "functie" TEXT NOT NULL,
    "bedrijfId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medewerker_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Medewerker_email_key" ON "Medewerker"("email");

CREATE TABLE "Factuur" (
    "id" TEXT NOT NULL,
    "nummer" TEXT NOT NULL,
    "bedrag" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "zzpId" TEXT,
    "bedrijfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Factuur_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Factuur_nummer_key" ON "Factuur"("nummer");

CREATE TABLE "Betaling" (
    "id" TEXT NOT NULL,
    "bedrag" DECIMAL(10,2) NOT NULL,
    "methode" TEXT NOT NULL,
    "opdrachtgeverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Betaling_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- NEXTAUTH TABLES
-- ============================================

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

ALTER TABLE "ZZPProfile" ADD CONSTRAINT "ZZPProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ZZPProfile" ADD CONSTRAINT "ZZPProfile_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BedrijfProfile" ADD CONSTRAINT "BedrijfProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BedrijfProfile" ADD CONSTRAINT "BedrijfProfile_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Opdrachtgever" ADD CONSTRAINT "Opdrachtgever_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Opdracht" ADD CONSTRAINT "Opdracht_opdrachtgeverId_fkey" FOREIGN KEY ("opdrachtgeverId") REFERENCES "Opdrachtgever"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Opdracht" ADD CONSTRAINT "Opdracht_bedrijfId_fkey" FOREIGN KEY ("bedrijfId") REFERENCES "BedrijfProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OpdrachtenBeveiligers" ADD CONSTRAINT "OpdrachtenBeveiligers_opdrachtId_fkey" FOREIGN KEY ("opdrachtId") REFERENCES "Opdracht"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OpdrachtenBeveiligers" ADD CONSTRAINT "OpdrachtenBeveiligers_beveiligerId_fkey" FOREIGN KEY ("beveiligerId") REFERENCES "ZZPProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Werkuur" ADD CONSTRAINT "Werkuur_opdrachtId_fkey" FOREIGN KEY ("opdrachtId") REFERENCES "Opdracht"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_beveiligerId_fkey" FOREIGN KEY ("beveiligerId") REFERENCES "ZZPProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Medewerker" ADD CONSTRAINT "Medewerker_bedrijfId_fkey" FOREIGN KEY ("bedrijfId") REFERENCES "BedrijfProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Factuur" ADD CONSTRAINT "Factuur_zzpId_fkey" FOREIGN KEY ("zzpId") REFERENCES "ZZPProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Factuur" ADD CONSTRAINT "Factuur_bedrijfId_fkey" FOREIGN KEY ("bedrijfId") REFERENCES "BedrijfProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Betaling" ADD CONSTRAINT "Betaling_opdrachtgeverId_fkey" FOREIGN KEY ("opdrachtgeverId") REFERENCES "Opdrachtgever"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
-- REAL-TIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for important tables
ALTER PUBLICATION supabase_realtime ADD TABLE "Opdracht";
ALTER PUBLICATION supabase_realtime ADD TABLE "Werkuur";
ALTER PUBLICATION supabase_realtime ADD TABLE "OpdrachtenBeveiligers";
ALTER PUBLICATION supabase_realtime ADD TABLE "Review";
ALTER PUBLICATION supabase_realtime ADD TABLE "Betaling";

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX "Opdracht_status_idx" ON "Opdracht"("status");
CREATE INDEX "Opdracht_opdrachtgeverId_idx" ON "Opdracht"("opdrachtgeverId");
CREATE INDEX "Opdracht_bedrijfId_idx" ON "Opdracht"("bedrijfId");
CREATE INDEX "Werkuur_opdrachtId_idx" ON "Werkuur"("opdrachtId");
CREATE INDEX "Review_beveiligerId_idx" ON "Review"("beveiligerId");

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_zzp_updated_at BEFORE UPDATE ON "ZZPProfile" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bedrijf_updated_at BEFORE UPDATE ON "BedrijfProfile" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_opdrachtgever_updated_at BEFORE UPDATE ON "Opdrachtgever" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_opdracht_updated_at BEFORE UPDATE ON "Opdracht" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscription_updated_at BEFORE UPDATE ON "Subscription" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();