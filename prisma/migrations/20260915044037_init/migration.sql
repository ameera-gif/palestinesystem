-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "country" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sponsor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UfukStaff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UfukStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectCoordinator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectCoordinator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "interests" TEXT,
    "aspirations" TEXT,
    "educationStage" TEXT,
    "schoolName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentOnFile" BOOLEAN NOT NULL DEFAULT false,
    "assignedUfukStaffId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_assignedUfukStaffId_fkey" FOREIGN KEY ("assignedUfukStaffId") REFERENCES "UfukStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "householdNotes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Guardian_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChildDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "notes" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChildDocument_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChildDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "UfukStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChildConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedBy" TEXT,
    "grantedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "ChildConsent_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChildStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChildStatusHistory_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "monthlyAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentFrequency" TEXT NOT NULL DEFAULT 'QUARTERLY',
    "pausedReason" TEXT,
    "cancelledReason" TEXT,
    "confirmedById" TEXT,
    "confirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sponsorship_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sponsorship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sponsorship_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "ProjectCoordinator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SponsorshipTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorshipId" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'stub',
    "reference" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SponsorshipTransaction_sponsorshipId_fkey" FOREIGN KEY ("sponsorshipId") REFERENCES "Sponsorship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "reportingPeriodStart" DATETIME NOT NULL,
    "reportingPeriodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "schoolYear" TEXT,
    "attendanceSummary" TEXT,
    "academicProgress" TEXT,
    "subjectProgress" TEXT,
    "achievements" TEXT,
    "areasForImprovement" TEXT,
    "participationNotes" TEXT,
    "interestsUpdate" TEXT,
    "generalDevelopmentNotes" TEXT,
    "narrativeUpdate" TEXT,
    "challenges" TEXT,
    "currentNeeds" TEXT,
    "nextSteps" TEXT,
    "guardianRemarks" TEXT,
    "submittedByUfukId" TEXT,
    "submittedAt" DATETIME,
    "reviewedByPcId" TEXT,
    "reviewedAt" DATETIME,
    "approvedAt" DATETIME,
    "publishedAt" DATETIME,
    "currentReviewComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_submittedByUfukId_fkey" FOREIGN KEY ("submittedByUfukId") REFERENCES "UfukStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_reviewedByPcId_fkey" FOREIGN KEY ("reviewedByPcId") REFERENCES "ProjectCoordinator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "reviewedById" TEXT NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportReview_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DistributionBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "notes" TEXT,
    "createdByUfukId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DistributionBatch_createdByUfukId_fkey" FOREIGN KEY ("createdByUfukId") REFERENCES "UfukStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DistributionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "expectedAmount" REAL NOT NULL,
    "actualAmount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "distributionDate" DATETIME,
    "method" TEXT,
    "recipientNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "issueNotes" TEXT,
    "verifiedByPcId" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DistributionRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DistributionBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DistributionRecord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DistributionRecord_verifiedByPcId_fkey" FOREIGN KEY ("verifiedByPcId") REFERENCES "ProjectCoordinator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DistributionEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "distributionRecordId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "description" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DistributionEvidence_distributionRecordId_fkey" FOREIGN KEY ("distributionRecordId") REFERENCES "DistributionRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "reportingPeriodLabel" TEXT,
    "relatedReportId" TEXT,
    "relatedDistributionId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "purpose" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "reviewComment" TEXT,
    CONSTRAINT "Media_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Media_relatedReportId_fkey" FOREIGN KEY ("relatedReportId") REFERENCES "Report" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_relatedDistributionId_fkey" FOREIGN KEY ("relatedDistributionId") REFERENCES "DistributionRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "UfukStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Media_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "ProjectCoordinator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "cycleLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_DUE',
    "scheduledDate" DATETIME,
    "timezone" TEXT,
    "platform" TEXT,
    "meetingLink" TEXT,
    "responsiblePcId" TEXT,
    "ufukRepId" TEXT,
    "internalNotes" TEXT,
    "sponsorVisibleNotes" TEXT,
    "cancelledReason" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meeting_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meeting_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meeting_responsiblePcId_fkey" FOREIGN KEY ("responsiblePcId") REFERENCES "ProjectCoordinator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Meeting_ufukRepId_fkey" FOREIGN KEY ("ufukRepId") REFERENCES "UfukStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "occasion" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "reviewComment" TEXT,
    "deliveredAt" DATETIME,
    CONSTRAINT "Message_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgrammeSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "childId" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_userId_key" ON "Sponsor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UfukStaff_userId_key" ON "UfukStaff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoordinator_userId_key" ON "ProjectCoordinator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Child_childCode_key" ON "Child"("childCode");

-- CreateIndex
CREATE UNIQUE INDEX "Child_slug_key" ON "Child"("slug");

-- CreateIndex
CREATE INDEX "Child_status_idx" ON "Child"("status");

-- CreateIndex
CREATE INDEX "Child_assignedUfukStaffId_idx" ON "Child"("assignedUfukStaffId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_childId_key" ON "Guardian"("childId");

-- CreateIndex
CREATE INDEX "ChildDocument_childId_idx" ON "ChildDocument"("childId");

-- CreateIndex
CREATE INDEX "ChildConsent_childId_idx" ON "ChildConsent"("childId");

-- CreateIndex
CREATE INDEX "ChildStatusHistory_childId_idx" ON "ChildStatusHistory"("childId");

-- CreateIndex
CREATE INDEX "Sponsorship_sponsorId_idx" ON "Sponsorship"("sponsorId");

-- CreateIndex
CREATE INDEX "Sponsorship_childId_idx" ON "Sponsorship"("childId");

-- CreateIndex
CREATE INDEX "Sponsorship_status_idx" ON "Sponsorship"("status");

-- CreateIndex
CREATE INDEX "SponsorshipTransaction_sponsorshipId_idx" ON "SponsorshipTransaction"("sponsorshipId");

-- CreateIndex
CREATE INDEX "Report_childId_idx" ON "Report"("childId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "ReportReview_reportId_idx" ON "ReportReview"("reportId");

-- CreateIndex
CREATE INDEX "DistributionRecord_batchId_idx" ON "DistributionRecord"("batchId");

-- CreateIndex
CREATE INDEX "DistributionRecord_childId_idx" ON "DistributionRecord"("childId");

-- CreateIndex
CREATE INDEX "DistributionRecord_status_idx" ON "DistributionRecord"("status");

-- CreateIndex
CREATE INDEX "DistributionEvidence_distributionRecordId_idx" ON "DistributionEvidence"("distributionRecordId");

-- CreateIndex
CREATE INDEX "Media_childId_idx" ON "Media"("childId");

-- CreateIndex
CREATE INDEX "Media_visibility_approvalStatus_idx" ON "Media"("visibility", "approvalStatus");

-- CreateIndex
CREATE INDEX "Meeting_childId_idx" ON "Meeting"("childId");

-- CreateIndex
CREATE INDEX "Meeting_sponsorId_idx" ON "Meeting"("sponsorId");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Message_sponsorId_idx" ON "Message"("sponsorId");

-- CreateIndex
CREATE INDEX "Message_childId_idx" ON "Message"("childId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeSetting_key_key" ON "ProgrammeSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");
