/**
 * Fictional demo data only. No real child, sponsor, or field-partner
 * identity is used anywhere in this file — names, photos (generated
 * initials avatars, not photographs), stories and figures are invented to
 * demonstrate the platform end to end, per the brief's explicit instruction
 * not to use real Gaza children's information.
 */
import { PrismaClient, ChildGender, ChildStatus, Role } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { initialsAvatarSvg, illustrativeCardSvg } from "../src/lib/avatar";
import { saveGeneratedAsset } from "../src/lib/storage";
import { calculateAge } from "../src/lib/format";

const prisma = new PrismaClient();
faker.seed(42);

const DEMO_PASSWORD = "Passw0rd!";

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function wipe() {
  const tables = [
    "AuditLog",
    "Notification",
    "Message",
    "DistributionEvidence",
    "DistributionRecord",
    "DistributionBatch",
    "Media",
    "ReportReview",
    "Report",
    "SponsorshipTransaction",
    "Sponsorship",
    "Meeting",
    "ChildStatusHistory",
    "ChildConsent",
    "ChildDocument",
    "Guardian",
    "Story",
    "Child",
    "ProjectCoordinator",
    "UfukStaff",
    "Sponsor",
    "User",
    "ProgrammeSetting",
  ];
  for (const table of tables) {
    // @ts-expect-error dynamic model access for a generic wipe routine
    await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany();
  }
}

const REGIONS = ["Gaza City", "Khan Younis", "Rafah", "Deir al-Balah", "Jabalia", "Beit Lahia", "Nuseirat"];
const EDUCATION_STAGES = [
  "Kindergarten",
  "Grade 1 – Primary",
  "Grade 3 – Primary",
  "Grade 5 – Primary",
  "Grade 7 – Preparatory",
  "Grade 9 – Secondary",
  "Grade 11 – Secondary",
];
const INTERESTS = [
  "drawing",
  "football",
  "reading",
  "storytelling",
  "puzzles",
  "singing",
  "swimming",
  "science experiments",
  "poetry",
  "chess",
  "handicrafts",
  "volunteering with younger children",
];
const ASPIRATIONS = [
  "become a doctor",
  "become a teacher",
  "become an engineer",
  "become an artist",
  "help rebuild their community",
  "become a nurse",
  "become a writer",
  "become a football coach",
  "become a scientist",
];
const BOY_NAMES = ["Omar", "Yousef", "Khaled", "Ahmad", "Karim", "Tariq", "Zain", "Malik"];
const GIRL_NAMES = ["Lina", "Sara", "Yasmin", "Nour", "Rania", "Dana", "Maryam", "Huda"];
const FAMILY_NAMES = ["Al-Masri", "Abu Zaid", "Nasser", "Barakat", "Shaheen", "Qassem", "Odeh", "Faris"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ageToDob(age: number): Date {
  const now = new Date();
  return new Date(now.getFullYear() - age, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }));
}

/**
 * A realistic-enough age band for each education stage. Picking
 * `educationStage` fully at random (the previous behaviour) produced
 * combinations like a 6-year-old in "Grade 11 – Secondary" — exactly the
 * "unrealistic age/grade combos" the redesign brief flagged as a
 * data-quality problem to fix before polishing the UI.
 */
function stageForAge(age: number): (typeof EDUCATION_STAGES)[number] {
  if (age <= 5) return "Kindergarten";
  if (age <= 7) return "Grade 1 – Primary";
  if (age <= 9) return "Grade 3 – Primary";
  if (age <= 11) return "Grade 5 – Primary";
  if (age <= 13) return "Grade 7 – Preparatory";
  if (age <= 15) return "Grade 9 – Secondary";
  return "Grade 11 – Secondary";
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function main() {
  console.log("Wiping existing data…");
  await wipe();

  console.log("Programme settings…");
  await prisma.programmeSetting.createMany({
    data: [
      { key: "monthlySponsorshipAmount", value: "50", description: "USD per child per month" },
      { key: "currency", value: "USD", description: "Programme currency" },
      { key: "distributionFrequencyMonths", value: "3", description: "Support delivered every N months" },
      { key: "reportingCycleMonths", value: "3", description: "A progress report is due every N months" },
      { key: "meetingCycleMonths", value: "6", description: "A sponsor-child meeting is due every N months" },
      {
        key: "orgDescription",
        value:
          "MyFundAction is a registered organisation that focuses on youth development in three main aspects: volunteerism, entrepreneurship, and academic excellence. We believe that a well-developed youth will further revamp the social and economic standard of a nation. With the tagline “For The Best Future,” we aim to be the best platform to develop future global leaders amongst the youth for a better tomorrow.",
        description: "Shown on the public About page",
      },
      {
        key: "footerTagline",
        value:
          "MyFundAction develops youth through volunteerism, entrepreneurship, and academic excellence, for the best future. This Gaza Child Sponsorship Programme is delivered with our field partner.",
        description: "Shown in the site footer on every public page",
      },
      {
        key: "orgAddress",
        value:
          "SH-G-26, Pangsapuri Perkhidmatan Knox Wawasan,\nJalan Sungai Burung 32/68, Seksyen 32, Bukit Rimau,\n40460 Shah Alam, Selangor Darul Ehsan",
        description: "Registered address, shown on About, Contact, and the footer",
      },
      { key: "orgPhone", value: "+603 5525 3963", description: "Shown on About, Contact, and the footer" },
    ],
  });

  // --- Users --------------------------------------------------------------
  console.log("Creating users…");
  const passwordHash = await hash(DEMO_PASSWORD);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@myfundaction.org",
      passwordHash,
      name: "System Administrator",
      role: Role.ADMIN,
    },
  });

  const pcDefs = [
    { name: "Nadia Suleiman", email: "nadia.suleiman@myfundaction.org" },
    { name: "Farid Rahman", email: "farid.rahman@myfundaction.org" },
  ];
  const pcs = [];
  for (const d of pcDefs) {
    const user = await prisma.user.create({
      data: { email: d.email, passwordHash, name: d.name, role: Role.MYFUNDACTION_PC },
    });
    const pc = await prisma.projectCoordinator.create({
      data: { userId: user.id, name: d.name, phone: faker.phone.number() },
    });
    pcs.push(pc);
  }

  const ufukDefs = [
    { name: "Yusuf Al-Amin", email: "yusuf.alamin@fieldpartner.org", title: "Senior Field Programme Officer" },
    { name: "Layla Nasser", email: "layla.nasser@fieldpartner.org", title: "Field Programme Officer" },
    { name: "Omar Ziyad", email: "omar.ziyad@fieldpartner.org", title: "Field Programme Officer" },
  ];
  const ufukStaff = [];
  for (const d of ufukDefs) {
    const user = await prisma.user.create({
      data: { email: d.email, passwordHash, name: d.name, role: Role.UFUK },
    });
    const staff = await prisma.ufukStaff.create({
      data: { userId: user.id, name: d.name, title: d.title, phone: faker.phone.number() },
    });
    ufukStaff.push(staff);
  }

  const sponsorCountries = [
    "Malaysia",
    "United Kingdom",
    "Australia",
    "Qatar",
    "Canada",
    "United Arab Emirates",
    "Singapore",
    "Indonesia",
    "United States",
    "Turkey",
  ];
  const sponsorSeed = [
    { name: "Amira Yusof", email: "sponsor.amira@example.com" },
    { name: "James Whitfield", email: "sponsor.james@example.com" },
  ];
  const sponsors = [];
  for (let i = 0; i < 10; i++) {
    const seed = sponsorSeed[i];
    const name = seed?.name ?? faker.person.fullName();
    const email = seed?.email ?? faker.internet.email({ firstName: name.split(" ")[0] }).toLowerCase();
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: Role.SPONSOR },
    });
    const sponsor = await prisma.sponsor.create({
      data: {
        userId: user.id,
        displayName: name,
        country: sponsorCountries[i % sponsorCountries.length],
        phone: faker.phone.number(),
      },
    });
    sponsors.push(sponsor);
  }

  // --- Children -------------------------------------------------------------
  console.log("Creating children…");
  type ChildPlan = {
    gender: ChildGender;
    age: number;
    status: ChildStatus;
  };
  const plans: ChildPlan[] = [
    ...Array.from({ length: 9 }, () => ({
      gender: pick([ChildGender.MALE, ChildGender.FEMALE]),
      age: faker.number.int({ min: 6, max: 15 }),
      status: ChildStatus.SPONSORED,
    })),
    ...Array.from({ length: 4 }, () => ({
      gender: pick([ChildGender.MALE, ChildGender.FEMALE]),
      age: faker.number.int({ min: 6, max: 15 }),
      status: ChildStatus.AVAILABLE,
    })),
    { gender: ChildGender.FEMALE, age: 10, status: ChildStatus.ON_HOLD },
    { gender: ChildGender.MALE, age: 13, status: ChildStatus.EXITED },
    { gender: ChildGender.MALE, age: 8, status: ChildStatus.ELIGIBLE },
  ];

  const children: { child: Awaited<ReturnType<typeof prisma.child.create>>; plan: ChildPlan; assignedUfukStaff: (typeof ufukStaff)[number] }[] = [];
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const firstName = plan.gender === ChildGender.MALE ? pick(BOY_NAMES) : pick(GIRL_NAMES);
    const lastName = pick(FAMILY_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const childCode = `GZ-${String(i + 1).padStart(4, "0")}`;
    const slug = `${slugify(firstName)}-${childCode.toLowerCase()}`;
    const region = pick(REGIONS);
    // `dateOfBirth` is picked with a random day/month within the target
    // birth year, so the age it computes to (via calculateAge, the same
    // function every view of the app uses) can land a year off `plan.age`
    // depending on whether that birthday has occurred yet this year. The
    // bio text must be built from that *computed* age, not the raw plan
    // value, or the two numbers silently drift apart — exactly the kind of
    // "age mismatch" data-quality issue the redesign brief called out.
    const dateOfBirth = ageToDob(plan.age);
    const age = calculateAge(dateOfBirth);
    const educationStage = stageForAge(age);
    const interests = faker.helpers.arrayElements(INTERESTS, 2);
    const aspiration = pick(ASPIRATIONS);
    const pronoun = plan.gender === ChildGender.MALE ? "he" : "she";
    const bio = `${firstName} is a ${age}-year-old child from ${region} who enjoys ${interests[0]} and ${interests[1]}. Currently in ${educationStage}, ${pronoun} dreams of one day being able to ${aspiration}.`;

    const avatarSvg = initialsAvatarSvg(firstName, childCode);
    const photoUrl = await saveGeneratedAsset("avatars", `${childCode}.svg`, avatarSvg);

    const assignedUfukStaff = pick(ufukStaff);

    const child = await prisma.child.create({
      data: {
        childCode,
        slug,
        displayName: firstName,
        fullName,
        dateOfBirth,
        gender: plan.gender,
        region,
        photoUrl,
        bio,
        interests: interests.join(", "),
        aspirations: aspiration.charAt(0).toUpperCase() + aspiration.slice(1),
        educationStage,
        schoolName: `${region} Community School ${faker.number.int({ min: 1, max: 9 })}`,
        status: plan.status,
        registeredAt: monthsAgo(faker.number.int({ min: 6, max: 20 })),
        consentOnFile: true,
        assignedUfukStaffId: assignedUfukStaff.id,
      },
    });

    await prisma.guardian.create({
      data: {
        childId: child.id,
        name: `${pick(["Abu", "Umm"])} ${firstName}`,
        relationship: pick(["Mother", "Father", "Grandmother", "Uncle"]),
        phone: faker.phone.number(),
        address: `${region} (internal record, not shown to sponsors)`,
        householdNotes: "Household composition and needs on file with the field team.",
      },
    });

    await prisma.childConsent.createMany({
      data: [
        { childId: child.id, consentType: "programme_participation", granted: true, grantedBy: "Guardian", grantedAt: child.registeredAt },
        { childId: child.id, consentType: "media", granted: plan.status !== ChildStatus.ELIGIBLE, grantedBy: "Guardian", grantedAt: child.registeredAt },
      ],
    });

    await prisma.childStatusHistory.create({
      data: {
        childId: child.id,
        fromStatus: null,
        toStatus: ChildStatus.ELIGIBLE,
        reason: "Initial registration and eligibility screening completed by our field partner.",
        changedById: adminUser.id,
        changedAt: child.registeredAt,
      },
    });
    if (plan.status !== ChildStatus.ELIGIBLE) {
      await prisma.childStatusHistory.create({
        data: {
          childId: child.id,
          fromStatus: ChildStatus.ELIGIBLE,
          toStatus: plan.status === ChildStatus.SPONSORED ? ChildStatus.AVAILABLE : plan.status,
          reason: "Profile approved and made available for sponsorship.",
          changedById: pcs[0].userId,
          changedAt: monthsAgo(faker.number.int({ min: 3, max: 12 })),
        },
      });
    }

    children.push({ child, plan, assignedUfukStaff });
  }

  // --- Sponsorships -----------------------------------------------------
  console.log("Creating sponsorships…");
  const sponsoredChildren = children.filter((c) => c.plan.status === ChildStatus.SPONSORED);
  const exitedChild = children.find((c) => c.plan.status === ChildStatus.EXITED)!;

  const sponsorshipStatusCycle = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "PAUSED", "PAYMENT_ISSUE"] as const;

  for (let i = 0; i < sponsoredChildren.length; i++) {
    const { child } = sponsoredChildren[i];
    const sponsor = sponsors[i % sponsors.length];
    const status = sponsorshipStatusCycle[i % sponsorshipStatusCycle.length];
    const startDate = monthsAgo(faker.number.int({ min: 3, max: 14 }));

    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorId: sponsor.id,
        childId: child.id,
        startDate,
        status,
        monthlyAmount: 50,
        currency: "USD",
        paymentFrequency: "QUARTERLY",
        confirmedById: pcs[i % pcs.length].id,
        confirmedAt: startDate,
        pausedReason: status === "PAUSED" ? "Sponsor requested a temporary pause while reviewing their household budget." : null,
      },
    });

    const quarters = Math.max(1, Math.floor(faker.number.int({ min: 1, max: 4 })));
    for (let q = 0; q < quarters; q++) {
      await prisma.sponsorshipTransaction.create({
        data: {
          sponsorshipId: sponsorship.id,
          periodLabel: `Quarter ${q + 1}`,
          amount: 150,
          currency: "USD",
          status: status === "PAYMENT_ISSUE" && q === quarters - 1 ? "FAILED" : "CONFIRMED",
          method: "stub",
          reference: faker.string.alphanumeric(10).toUpperCase(),
          paidAt: monthsAgo((quarters - q) * 3),
        },
      });
    }
  }

  // One completed historical sponsorship for the exited child
  await prisma.sponsorship.create({
    data: {
      sponsorId: sponsors[0].id,
      childId: exitedChild.child.id,
      startDate: monthsAgo(24),
      endDate: monthsAgo(2),
      status: "COMPLETED",
      monthlyAmount: 50,
      currency: "USD",
      paymentFrequency: "QUARTERLY",
      confirmedById: pcs[0].id,
      confirmedAt: monthsAgo(24),
    },
  });
  await prisma.childStatusHistory.create({
    data: {
      childId: exitedChild.child.id,
      fromStatus: "SPONSORED",
      toStatus: "EXITED",
      reason: "Family relocated outside the programme's registered service area.",
      changedById: pcs[0].userId,
      changedAt: monthsAgo(2),
    },
  });

  // --- Reports -----------------------------------------------------------
  console.log("Creating reports…");
  const activeSponsorships = await prisma.sponsorship.findMany({ where: { status: "ACTIVE" }, include: { child: true } });

  const reportStatusPlan = ["PUBLISHED", "PUBLISHED", "APPROVED", "UNDER_REVIEW", "RETURNED", "DRAFT"] as const;
  for (let i = 0; i < activeSponsorships.length; i++) {
    const { child } = activeSponsorships[i];
    const ufuk = ufukStaff.find((u) => u.id === children.find((c) => c.child.id === child.id)?.assignedUfukStaff.id) ?? ufukStaff[0];
    const pc = pcs[i % pcs.length];
    const status = reportStatusPlan[i % reportStatusPlan.length];

    const periodEnd = monthsAgo(i % 3);
    const periodStart = monthsAgo((i % 3) + 3);

    const report = await prisma.report.create({
      data: {
        childId: child.id,
        reportingPeriodStart: periodStart,
        reportingPeriodEnd: periodEnd,
        status,
        schoolYear: "2025/2026",
        attendanceSummary: `${faker.number.int({ min: 82, max: 99 })}% attendance this term`,
        academicProgress: "Steady improvement across core subjects, with strong engagement in class discussions.",
        subjectProgress: "Arabic: Strong. Mathematics: Improving. Science: Strong. English: Developing.",
        achievements: "Received recognition for a class project and improved reading fluency.",
        areasForImprovement: "Continued support recommended for English vocabulary.",
        participationNotes: "Actively participates in school and community activities.",
        interestsUpdate: "Has started joining a weekly drawing club at the community centre.",
        generalDevelopmentNotes: "Settling well; positive relationships with peers and teachers.",
        narrativeUpdate: `${child.displayName} continues to make encouraging progress this term, supported by consistent attendance and an engaged, curious attitude in class.`,
        challenges: "Occasional disruption to school attendance due to local conditions; the family and school are managing this as well as possible.",
        currentNeeds: "Continued educational materials support and psychosocial check-ins.",
        nextSteps: "Continue monitoring academic progress and confirm materials are received ahead of next term.",
        guardianRemarks: "Guardian reports the child is in good spirits and grateful for continued support.",
        submittedByUfukId: ufuk.id,
        submittedAt: monthsAgo(i % 3 === 0 ? 1 : 2),
        reviewedByPcId: status === "DRAFT" || status === "UNDER_REVIEW" ? null : pc.id,
        reviewedAt: status === "DRAFT" || status === "UNDER_REVIEW" ? null : monthsAgo(1),
        approvedAt: status === "APPROVED" || status === "PUBLISHED" ? monthsAgo(1) : null,
        publishedAt: status === "PUBLISHED" ? monthsAgo(1) : null,
        currentReviewComment:
          status === "RETURNED"
            ? "Please add subject-level detail for Mathematics and confirm the attendance percentage with the school register before resubmitting."
            : null,
      },
    });

    if (status === "RETURNED") {
      await prisma.reportReview.create({
        data: {
          reportId: report.id,
          decision: "RETURNED",
          comment: "Please add subject-level detail for Mathematics and confirm the attendance percentage with the school register before resubmitting.",
          reviewedById: pc.userId,
          reviewedAt: monthsAgo(1),
        },
      });
    } else if (status === "APPROVED" || status === "PUBLISHED") {
      await prisma.reportReview.create({
        data: {
          reportId: report.id,
          decision: "APPROVED",
          comment: "Thorough and clear. Approved.",
          reviewedById: pc.userId,
          reviewedAt: monthsAgo(1),
        },
      });
    }
  }

  // --- Distribution batches -----------------------------------------------
  console.log("Creating distribution batches…");
  const batchQ4 = await prisma.distributionBatch.create({
    data: {
      label: "Q4 2025",
      periodStart: monthsAgo(6),
      periodEnd: monthsAgo(3),
      notes: "Fourth-quarter 2025 support distribution.",
      createdByUfukId: ufukStaff[0].id,
      createdAt: monthsAgo(6),
    },
  });
  const batchQ1 = await prisma.distributionBatch.create({
    data: {
      label: "Q1 2026",
      periodStart: monthsAgo(3),
      periodEnd: monthsAgo(0),
      notes: "First-quarter 2026 support distribution, in progress.",
      createdByUfukId: ufukStaff[1].id,
      createdAt: monthsAgo(3),
    },
  });

  const distStatusCycleQ4 = ["VERIFIED", "VERIFIED", "VERIFIED", "ISSUE_FLAGGED"] as const;
  const distStatusCycleQ1 = ["EVIDENCE_SUBMITTED", "DISTRIBUTED", "PLANNED", "VERIFIED"] as const;

  for (let i = 0; i < activeSponsorships.length; i++) {
    const { child } = activeSponsorships[i];

    const recQ4 = await prisma.distributionRecord.create({
      data: {
        batchId: batchQ4.id,
        childId: child.id,
        expectedAmount: 150,
        actualAmount: distStatusCycleQ4[i % distStatusCycleQ4.length] === "ISSUE_FLAGGED" ? 120 : 150,
        currency: "USD",
        distributionDate: monthsAgo(4),
        method: "Cash assistance via guardian",
        recipientNote: "Guardian",
        status: distStatusCycleQ4[i % distStatusCycleQ4.length],
        verifiedByPcId: distStatusCycleQ4[i % distStatusCycleQ4.length] === "VERIFIED" ? pcs[i % pcs.length].id : null,
        verifiedAt: distStatusCycleQ4[i % distStatusCycleQ4.length] === "VERIFIED" ? monthsAgo(4) : null,
        issueNotes:
          distStatusCycleQ4[i % distStatusCycleQ4.length] === "ISSUE_FLAGGED"
            ? "Amount delivered was short of the expected quarterly total; follow-up requested from our field partner."
            : null,
      },
    });

    if (recQ4.status !== "PLANNED") {
      const evidenceSvg = illustrativeCardSvg(`${child.displayName}: Q4 2025 support delivered`, child.id);
      const evidenceUrl = await saveGeneratedAsset("evidence", `${recQ4.id}.svg`, evidenceSvg);
      await prisma.distributionEvidence.create({
        data: {
          distributionRecordId: recQ4.id,
          fileUrl: evidenceUrl,
          fileType: "PHOTO",
          description: "Illustrative confirmation record (demo placeholder, not an actual photograph).",
          uploadedById: ufukStaff[i % ufukStaff.length].userId,
        },
      });
    }

    await prisma.distributionRecord.create({
      data: {
        batchId: batchQ1.id,
        childId: child.id,
        expectedAmount: 150,
        actualAmount: ["EVIDENCE_SUBMITTED", "VERIFIED"].includes(distStatusCycleQ1[i % distStatusCycleQ1.length]) ? 150 : null,
        currency: "USD",
        distributionDate: ["PLANNED"].includes(distStatusCycleQ1[i % distStatusCycleQ1.length]) ? null : monthsAgo(1),
        method: "Cash assistance via guardian",
        recipientNote: "Guardian",
        status: distStatusCycleQ1[i % distStatusCycleQ1.length],
        verifiedByPcId: distStatusCycleQ1[i % distStatusCycleQ1.length] === "VERIFIED" ? pcs[0].id : null,
        verifiedAt: distStatusCycleQ1[i % distStatusCycleQ1.length] === "VERIFIED" ? monthsAgo(1) : null,
      },
    });
  }

  // --- Media ---------------------------------------------------------------
  console.log("Creating media…");
  for (let i = 0; i < children.length; i++) {
    const { child, assignedUfukStaff, plan } = children[i];
    if (plan.status === "DRAFT" || plan.status === "ELIGIBLE") continue;

    const visibilityCycle = ["PUBLIC_APPROVED", "SPONSOR_ONLY", "INTERNAL"] as const;
    const visibility = visibilityCycle[i % visibilityCycle.length];
    const approvalStatus = visibility === "INTERNAL" ? (i % 2 === 0 ? "PENDING" : "APPROVED") : "APPROVED";

    const svg = illustrativeCardSvg(`${child.displayName}: programme activity`, `media-${child.id}`);
    const fileUrl = await saveGeneratedAsset("media", `${child.id}-activity.svg`, svg);

    await prisma.media.create({
      data: {
        childId: child.id,
        type: "PHOTO",
        fileUrl,
        description: "Illustrative activity update (demo placeholder art, not a real photograph).",
        reportingPeriodLabel: "Q1 2026",
        uploadedById: assignedUfukStaff.id,
        uploadedAt: monthsAgo(1),
        consentConfirmed: true,
        purpose: "Education/programme activity update",
        visibility,
        approvalStatus,
        reviewedById: approvalStatus === "APPROVED" ? pcs[0].id : null,
        reviewedAt: approvalStatus === "APPROVED" ? monthsAgo(1) : null,
      },
    });
  }

  // --- Meetings -----------------------------------------------------------
  console.log("Creating meetings…");
  const meetingStatusCycle = ["COMPLETED", "SCHEDULED", "COORDINATING", "AWAITING_UFUK", "DUE"] as const;
  const activeSponsorshipsWithSponsor = await prisma.sponsorship.findMany({
    where: { status: "ACTIVE" },
    include: { child: true, sponsor: true },
  });
  for (let i = 0; i < activeSponsorshipsWithSponsor.length; i++) {
    const s = activeSponsorshipsWithSponsor[i];
    const status = meetingStatusCycle[i % meetingStatusCycle.length];
    await prisma.meeting.create({
      data: {
        childId: s.childId,
        sponsorId: s.sponsorId,
        cycleLabel: i % 2 === 0 ? "2026 H1" : "2025 H2",
        status,
        scheduledDate: status === "SCHEDULED" || status === "COMPLETED" ? monthsAgo(status === "COMPLETED" ? 2 : -1) : null,
        timezone: status === "SCHEDULED" ? "Asia/Kuala_Lumpur" : null,
        platform: status === "SCHEDULED" || status === "COMPLETED" ? "GOOGLE_MEET" : null,
        meetingLink: status === "SCHEDULED" ? "https://meet.google.com/demo-placeholder-link" : null,
        responsiblePcId: pcs[i % pcs.length].id,
        ufukRepId: ufukStaff[i % ufukStaff.length].id,
        internalNotes: "MyFundAction PC to facilitate and remain present throughout, per safeguarding policy.",
        completedAt: status === "COMPLETED" ? monthsAgo(2) : null,
      },
    });
  }

  // --- Messages -------------------------------------------------------------
  console.log("Creating moderated messages…");
  const firstActive = activeSponsorshipsWithSponsor[0];
  const secondActive = activeSponsorshipsWithSponsor[1];
  if (firstActive) {
    await prisma.message.create({
      data: {
        sponsorId: firstActive.sponsorId,
        childId: firstActive.childId,
        direction: "SPONSOR_TO_CHILD",
        occasion: "Eid",
        content: "Wishing you and your family a joyful Eid! I'm thinking of you and so proud of your progress this year.",
        status: "DELIVERED",
        reviewedById: pcs[0].userId,
        reviewedAt: monthsAgo(1),
        deliveredAt: monthsAgo(1),
      },
    });
    await prisma.message.create({
      data: {
        sponsorId: firstActive.sponsorId,
        childId: firstActive.childId,
        direction: "CHILD_TO_SPONSOR",
        occasion: "Eid",
        content: "Thank you so much for your kind wishes and support. Eid Mubarak to you too!",
        status: "APPROVED",
        reviewedById: pcs[0].userId,
        reviewedAt: monthsAgo(1),
        deliveredAt: monthsAgo(1),
      },
    });
  }
  if (secondActive) {
    await prisma.message.create({
      data: {
        sponsorId: secondActive.sponsorId,
        childId: secondActive.childId,
        direction: "SPONSOR_TO_CHILD",
        occasion: "Encouragement",
        content: "Just wanted to say how proud I am of your school progress this term. Keep up the great work!",
        status: "SUBMITTED",
      },
    });
  }

  // --- Notifications ---------------------------------------------------------
  console.log("Creating notifications…");
  if (firstActive) {
    const sponsorUser = await prisma.sponsor.findUnique({ where: { id: firstActive.sponsorId } });
    if (sponsorUser) {
      await prisma.notification.create({
        data: {
          userId: sponsorUser.userId,
          title: "New report published",
          body: `A new progress report for ${firstActive.child.displayName} is now available.`,
          entityType: "Report",
          link: `/portal/children/${firstActive.childId}/reports`,
        },
      });
      await prisma.notification.create({
        data: {
          userId: sponsorUser.userId,
          title: "Support delivered",
          body: `Q4 2025 support for ${firstActive.child.displayName} has been verified and delivered.`,
          entityType: "DistributionRecord",
          link: `/portal/children/${firstActive.childId}/support`,
        },
      });
    }
  }
  await prisma.notification.create({
    data: {
      userId: pcs[0].userId,
      title: "Report awaiting review",
      body: "A newly submitted report is waiting in the Review Centre.",
      entityType: "Report",
      link: "/management/review",
    },
  });
  await prisma.notification.create({
    data: {
      userId: ufukStaff[0].userId,
      title: "Report returned for correction",
      body: "MyFundAction has requested corrections on a submitted report.",
      entityType: "Report",
      link: "/implementer/reports",
    },
  });

  // --- Audit log ---------------------------------------------------------
  console.log("Creating audit log entries…");
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: pcs[0].userId,
        action: "SPONSORSHIP_CONFIRMED",
        entityType: "Sponsorship",
        entityId: firstActive?.id ?? "seed",
        summary: "Sponsorship match confirmed and child status updated to Sponsored.",
      },
      {
        actorId: pcs[0].userId,
        action: "REPORT_APPROVED",
        entityType: "Report",
        entityId: "seed",
        summary: "Progress report reviewed and approved for publishing.",
      },
      {
        actorId: pcs[1].userId,
        action: "DISTRIBUTION_VERIFIED",
        entityType: "DistributionRecord",
        entityId: "seed",
        summary: "Quarterly support distribution evidence reviewed and verified.",
      },
    ],
  });

  // --- Stories (public) ----------------------------------------------------
  console.log("Creating public stories…");
  const storyChildren = faker.helpers.arrayElements(sponsoredChildren, 3);
  const storyDefs = [
    {
      title: "A Year of Steady Progress",
      excerpt: "How consistent sponsorship and verified reporting helped one family plan with confidence.",
      body: "Since joining the programme, this family has received consistent quarterly support, verified at every step by our team and our field partner. Regular academic updates show steady, encouraging progress at school.",
    },
    {
      title: "Small Support, Steady Encouragement",
      excerpt: "A look at how sponsorship updates create a real, ongoing connection between sponsor and child.",
      body: "Every quarter, our field partner documents how support was delivered, and our team reviews it before anything reaches a sponsor. It's a small process that adds up to a trustworthy, human connection.",
    },
    {
      title: "What Verified Reporting Looks Like in Practice",
      excerpt: "Behind every published update is a review process built to protect both children and sponsors.",
      body: "Reports move through a clear path: drafted by our field partner's team, reviewed by MyFundAction, and only published once approved. This story walks through why that matters.",
    },
  ];
  for (let i = 0; i < storyDefs.length; i++) {
    const s = storyDefs[i];
    const child = storyChildren[i];
    const cover = illustrativeCardSvg(s.title, `story-${i}`);
    const coverUrl = await saveGeneratedAsset("stories", `story-${i}.svg`, cover);
    await prisma.story.create({
      data: {
        title: s.title,
        slug: slugify(s.title),
        excerpt: s.excerpt,
        body: s.body,
        coverImageUrl: coverUrl,
        childId: child?.child.id,
        publishedAt: monthsAgo(i + 1),
      },
    });
  }

  console.log("\nSeed complete.\n");
  console.log("Demo accounts (all use the same password):");
  console.log(`  Password: ${DEMO_PASSWORD}\n`);
  console.log(`  Admin:              admin@myfundaction.org`);
  console.log(`  MyFundAction PC:    nadia.suleiman@myfundaction.org`);
  console.log(`  MyFundAction PC:    farid.rahman@myfundaction.org`);
  console.log(`  Field team:         yusuf.alamin@fieldpartner.org`);
  console.log(`  Sponsor:            sponsor.amira@example.com`);
  console.log(`  Sponsor:            sponsor.james@example.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
