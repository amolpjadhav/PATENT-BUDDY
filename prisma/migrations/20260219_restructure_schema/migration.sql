-- Drop old tables
DROP TABLE IF EXISTS "QualityCheck";
DROP TABLE IF EXISTS "Claim";
DROP TABLE IF EXISTS "Section";
DROP TABLE IF EXISTS "Interview";

-- Modify Project table
ALTER TABLE "Project" DROP COLUMN "token";
ALTER TABLE "Project" DROP COLUMN "inventorName";
ALTER TABLE "Project" DROP COLUMN "status";
ALTER TABLE "Project" ADD COLUMN "jurisdiction" TEXT NOT NULL DEFAULT 'US';
ALTER TABLE "Project" ADD COLUMN "interviewStep" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN "interviewCompleted" BOOLEAN NOT NULL DEFAULT false;

-- InterviewAnswer
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewAnswer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InterviewAnswer_projectId_questionKey_key" UNIQUE ("projectId", "questionKey")
);

-- DraftSection
CREATE TABLE "DraftSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DraftSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DraftSection_projectId_sectionKey_key" UNIQUE ("projectId", "sectionKey")
);

-- QualityIssue
CREATE TABLE "QualityIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QualityIssue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
