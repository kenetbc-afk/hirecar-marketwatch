/**
 * HIRECAR HIRE Bot Fleet Registry
 * REF-HC-0001 — Bot Classification, Supervision & QA Standards
 *
 * Every bot in the HIRECAR fleet is tracked here for:
 *  - Issue tracking and impact classification
 *  - Supervisor level mapping
 *  - QA standard adherence
 *  - Inter-bot dependency mapping
 *  - Version tracking (vX.Y.Z — major.minor.patch)
 *
 * Naming Convention: HIRE Bot #XX vX.Y.Z
 * Examples: "HIRE Bot #08 v1.0.0", "HIRE Bot #17 v1.2.1"
 *
 * Version Rules:
 *  - Major (X): Breaking change in bot behavior, schema, or API
 *  - Minor (Y): New capability added, non-breaking
 *  - Patch (Z): Bug fix, config change, tuning
 */

export const HIRE_BOT_REGISTRY = {
  // ═══════════════════════════════════════════════════════════
  // CORE FLEET (D01–D16) — 16 INTERNAL DEPARTMENTS
  // ═══════════════════════════════════════════════════════════
  'HIRE Bot #01': {
    name: 'Enrollment & Onboarding',
    version: 'v0.1.0',
    department: 'D01',
    classification: 'Client Operations',
    supervisorLevel: 'D01 Lead',
    qaStandard: 'QA-HC-ONBOARD',
    qaDescription: 'Identity verification, membership agreement generation, welcome sequence',
    clientFacing: true,
    dependsOn: ['HIRE Bot #07', 'HIRE Bot #08', 'HIRE Bot #13'],
    status: 'planned',
  },
  'HIRE Bot #02': {
    name: 'Disputes & Resolution',
    version: 'v0.1.0',
    department: 'D02',
    classification: 'Compliance / Client Protection',
    supervisorLevel: 'D02 Lead + D10 QA Audit',
    qaStandard: 'QA-HC-DISPUTE',
    qaDescription: 'Evidence collection, timeline adherence, resolution documentation',
    clientFacing: true,
    dependsOn: ['HIRE Bot #04', 'HIRE Bot #08', 'HIRE Bot #19'],
    status: 'planned',
  },
  'HIRE Bot #03': {
    name: 'Score Monitoring',
    version: 'v0.1.0',
    department: 'D03',
    classification: 'Analytics / Risk',
    supervisorLevel: 'D03 Lead + D12 Analytics',
    qaStandard: 'QA-HC-SCORE',
    qaDescription: '6-score system integrity (HBI, CRI, BRE, FPI, VDI, MSI), trend detection',
    clientFacing: false,
    dependsOn: ['HIRE Bot #12', 'HIRE Bot #19'],
    status: 'planned',
  },
  'HIRE Bot #04': {
    name: 'Document Management',
    version: 'v0.1.0',
    department: 'D04',
    classification: 'Compliance / Operations',
    supervisorLevel: 'D04 Lead + D10 QA',
    qaStandard: 'QA-HC-DOC',
    qaDescription: 'HC Format compliance, version control, audit trail',
    clientFacing: false,
    dependsOn: ['HIRE Bot #16'],
    status: 'planned',
  },
  'HIRE Bot #05': {
    name: 'Communications Engine',
    version: 'v0.1.0',
    department: 'D05',
    classification: 'Client Operations / Outreach',
    supervisorLevel: 'D05 Lead',
    qaStandard: 'QA-HC-COMMS',
    qaDescription: 'Tone review, timing constraints, opt-out compliance, channel selection',
    clientFacing: true,
    dependsOn: ['HIRE Bot #13'],
    status: 'planned',
  },
  'HIRE Bot #06': {
    name: 'Playbook Execution',
    version: 'v0.1.0',
    department: 'D06',
    classification: 'Strategy / Operations',
    supervisorLevel: 'D06 Lead + D10 QA',
    qaStandard: 'QA-HC-PLAY',
    qaDescription: 'Playbook step validation, outcome tracking, adaptation triggers',
    clientFacing: false,
    dependsOn: ['HIRE Bot #18', 'HIRE Bot #19'],
    status: 'planned',
  },
  'HIRE Bot #07': {
    name: 'Digital Pass & Wallet',
    version: 'v0.1.0',
    department: 'D07',
    classification: 'Client Operations / Identity',
    supervisorLevel: 'D07 Lead + D16 Security',
    qaStandard: 'QA-HC-PASS',
    qaDescription: 'QR code generation, pass updates, wallet integration, expiry management',
    clientFacing: true,
    dependsOn: ['HIRE Bot #01', 'HIRE Bot #16'],
    status: 'planned',
  },
  'HIRE Bot #08': {
    name: 'Billing & Invoicing',
    version: 'v1.0.0',
    department: 'D08',
    classification: 'Financial Operations',
    supervisorLevel: 'D08 Lead + D10 QA Audit',
    qaStandard: 'QA-HC-FIN',
    qaDescription: 'Double-entry reconciliation, audit trail, multi-platform ledger integrity',
    clientFacing: false,
    dependsOn: ['HIRE Bot #14', 'HIRE Bot #17'],
    status: 'active', // payment-orchestrator.js
    module: 'src/payment-orchestrator.js',
  },
  'HIRE Bot #09': {
    name: 'Member Portal',
    version: 'v0.1.0',
    department: 'D09',
    classification: 'Client Operations / Self-Service',
    supervisorLevel: 'D09 Lead',
    qaStandard: 'QA-HC-PORTAL',
    qaDescription: 'Dashboard accuracy, data freshness, accessibility compliance',
    clientFacing: true,
    dependsOn: ['HIRE Bot #08', 'HIRE Bot #03', 'HIRE Bot #07'],
    status: 'planned',
  },
  'HIRE Bot #10': {
    name: 'QA & Compliance',
    version: 'v0.1.0',
    department: 'D10',
    classification: 'Compliance / Quality Assurance',
    supervisorLevel: 'D10 Lead (reports to CEO)',
    qaStandard: 'QA-HC-META',
    qaDescription: 'Audits other bots, enforces QA standards, compliance reporting',
    clientFacing: false,
    dependsOn: [], // Independent — audits all others
    status: 'planned',
  },
  'HIRE Bot #11': {
    name: 'Advisor Assignment',
    version: 'v0.1.0',
    department: 'D11',
    classification: 'Operations / Relationship Management',
    supervisorLevel: 'D11 Lead + D13 CRM',
    qaStandard: 'QA-HC-ADVISE',
    qaDescription: 'Load balancing, escalation routing, handoff documentation',
    clientFacing: false,
    dependsOn: ['HIRE Bot #19', 'HIRE Bot #13'],
    status: 'planned',
  },
  'HIRE Bot #12': {
    name: 'Analytics & Reporting',
    version: 'v0.1.0',
    department: 'D12',
    classification: 'Analytics / Business Intelligence',
    supervisorLevel: 'D12 Lead',
    qaStandard: 'QA-HC-DATA',
    qaDescription: 'Data accuracy, report freshness, metric definitions, trend validation',
    clientFacing: false,
    dependsOn: ['HIRE Bot #03', 'HIRE Bot #08', 'HIRE Bot #19'],
    status: 'planned',
  },
  'HIRE Bot #13': {
    name: 'CRM & Relationship Engineering',
    version: 'v0.1.0',
    department: 'D13',
    classification: 'Client Operations / Strategic',
    supervisorLevel: 'D13 Lead',
    qaStandard: 'QA-HC-CRM',
    qaDescription: 'Data hygiene, interaction logging, relationship scoring accuracy',
    clientFacing: false,
    dependsOn: ['HIRE Bot #05', 'HIRE Bot #03'],
    status: 'planned',
  },
  'HIRE Bot #14': {
    name: 'Platform Infrastructure',
    version: 'v1.0.0',
    department: 'D14',
    classification: 'Infrastructure / Platform Operations',
    supervisorLevel: 'D14 Lead + D16 Security',
    qaStandard: 'QA-HC-SYNC',
    qaDescription: 'Idempotent sync, audit logging, retry safety, cross-platform alignment',
    clientFacing: false,
    dependsOn: [],
    status: 'active', // product-sync-worker.js
    module: 'src/product-sync-worker.js',
  },
  'HIRE Bot #15': {
    name: 'Scheduling & Calendar',
    version: 'v0.1.0',
    department: 'D15',
    classification: 'Operations / Coordination',
    supervisorLevel: 'D15 Lead',
    qaStandard: 'QA-HC-SCHED',
    qaDescription: 'Availability accuracy, conflict detection, reminder delivery',
    clientFacing: true,
    dependsOn: ['HIRE Bot #05'],
    status: 'planned',
  },
  'HIRE Bot #16': {
    name: 'Security & Access',
    version: 'v0.1.0',
    department: 'D16',
    classification: 'Security / Compliance',
    supervisorLevel: 'D16 Lead (reports to CEO)',
    qaStandard: 'QA-HC-SEC',
    qaDescription: 'Auth validation, permission enforcement, breach detection, audit logging',
    clientFacing: false,
    dependsOn: [],
    status: 'planned',
  },

  // ═══════════════════════════════════════════════════════════
  // PAYMENT ORCHESTRATION LAYER (Bot #17–#20)
  // ═══════════════════════════════════════════════════════════
  'HIRE Bot #17': {
    name: 'Transaction Completion Engine',
    version: 'v1.0.0',
    department: 'Payment Orchestration',
    classification: 'Client Operations / Revenue Recovery',
    supervisorLevel: 'D05 Comms + D08 Billing + D11 Advisor',
    qaStandard: 'QA-HC-CLIENT',
    qaDescription: 'Tone review, timing constraints (no outreach before 9am/after 8pm), opt-out compliance, escalation thresholds',
    clientFacing: true,
    dependsOn: ['HIRE Bot #05', 'HIRE Bot #08', 'HIRE Bot #18', 'HIRE Bot #19'],
    status: 'active', // payment-orchestrator.js → evaluatePaymentCompletion
    module: 'src/payment-orchestrator.js',
    triggers: ['partial payment detected', 'invoice overdue', 'membership payment failed'],
  },
  'HIRE Bot #18': {
    name: 'Milestone Progression Engine',
    version: 'v1.0.0',
    department: 'Payment Orchestration',
    classification: 'Journey Management / Internal',
    supervisorLevel: 'D06 Playbook + D12 Analytics',
    qaStandard: 'QA-HC-JOURNEY',
    qaDescription: 'Milestone validation, brief generation, timeline accuracy, no backward movement without audit',
    clientFacing: false,
    dependsOn: ['HIRE Bot #06', 'HIRE Bot #04', 'HIRE Bot #12'],
    status: 'active', // payment-orchestrator.js → triggerMilestoneAdvance
    module: 'src/payment-orchestrator.js',
    triggers: ['invoice fully paid', 'service completed', 'document signed'],
  },
  'HIRE Bot #19': {
    name: 'Lane Evaluation Engine',
    version: 'v1.0.0',
    department: 'Payment Orchestration',
    classification: 'Risk / Health Monitoring / Internal',
    supervisorLevel: 'D10 QA + D12 Analytics + D11 Advisor',
    qaStandard: 'QA-HC-LANE',
    qaDescription: 'Transition audit trail, no client exposure of lane status, advisor notification on escalation, recovery path validation',
    clientFacing: false,
    dependsOn: ['HIRE Bot #03', 'HIRE Bot #08', 'HIRE Bot #11', 'HIRE Bot #12'],
    status: 'active', // payment-orchestrator.js → evaluateLane
    module: 'src/payment-orchestrator.js',
    triggers: ['payment failure', 'partial stall', 'HBI drop', 'milestone miss', 'cash dispute'],
    lanes: {
      revenue: { color: 'green', description: 'Active, current, healthy — generating revenue' },
      cure: { color: 'yellow', description: 'At risk — needs intervention to return to revenue' },
      remedy: { color: 'red', description: 'Critical — requires dedicated advisor and escalation' },
      exit: { color: 'black', description: 'Departed — voluntary or involuntary termination' },
    },
  },
  'HIRE Bot #20': {
    name: 'Cash Transaction Protocol',
    version: 'v1.0.0',
    department: 'Payment Orchestration',
    classification: 'Field Operations / Compliance',
    supervisorLevel: 'D10 QA + D06 Playbook',
    qaStandard: 'QA-HC-CASH',
    qaDescription: 'Dual-party SMS auth, denomination audit, 24h expiry enforcement, dispute case auto-creation',
    clientFacing: true,
    dependsOn: ['HIRE Bot #08', 'HIRE Bot #05', 'HIRE Bot #19'],
    status: 'active', // payment-orchestrator.js → logCashReceipt, confirmCashReceipt, disputeCashReceipt
    module: 'src/payment-orchestrator.js',
    triggers: ['cash payment logged by receiver', 'SMS confirmation received', 'SMS dispute received', '24h expiry'],
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Get bot info by number
// ═══════════════════════════════════════════════════════════════
export function getBot(number) {
  const key = `HIRE Bot #${String(number).padStart(2, '0')}`;
  return HIRE_BOT_REGISTRY[key] || null;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Get all bots by status
// ═══════════════════════════════════════════════════════════════
export function getBotsByStatus(status) {
  return Object.entries(HIRE_BOT_REGISTRY)
    .filter(([, bot]) => bot.status === status)
    .map(([id, bot]) => ({ id, ...bot }));
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Get supervision chain for a bot
// ═══════════════════════════════════════════════════════════════
export function getSupervisionChain(number) {
  const bot = getBot(number);
  if (!bot) return null;
  return {
    bot: `HIRE Bot #${String(number).padStart(2, '0')}`,
    name: bot.name,
    supervisorLevel: bot.supervisorLevel,
    qaStandard: bot.qaStandard,
    qaDescription: bot.qaDescription,
    dependsOn: bot.dependsOn,
  };
}

// ═══════════════════════════════════════════════════════════════
// QA STANDARDS REFERENCE
// ═══════════════════════════════════════════════════════════════
export const QA_STANDARDS = {
  'QA-HC-ONBOARD':  { scope: 'Enrollment accuracy', auditor: 'HIRE Bot #10', frequency: 'per-enrollment' },
  'QA-HC-DISPUTE':  { scope: 'Dispute resolution compliance', auditor: 'HIRE Bot #10', frequency: 'per-case' },
  'QA-HC-SCORE':    { scope: '6-score system integrity', auditor: 'HIRE Bot #10', frequency: 'daily' },
  'QA-HC-DOC':      { scope: 'HC Format document compliance', auditor: 'HIRE Bot #10', frequency: 'per-document' },
  'QA-HC-COMMS':    { scope: 'Outreach tone and timing', auditor: 'HIRE Bot #10', frequency: 'per-message' },
  'QA-HC-PLAY':     { scope: 'Playbook execution fidelity', auditor: 'HIRE Bot #10', frequency: 'per-step' },
  'QA-HC-PASS':     { scope: 'Digital pass integrity', auditor: 'HIRE Bot #10', frequency: 'per-update' },
  'QA-HC-FIN':      { scope: 'Financial reconciliation', auditor: 'HIRE Bot #10', frequency: 'per-transaction + daily batch' },
  'QA-HC-PORTAL':   { scope: 'Portal data accuracy', auditor: 'HIRE Bot #10', frequency: 'hourly' },
  'QA-HC-META':     { scope: 'QA system self-audit', auditor: 'External / CEO', frequency: 'weekly' },
  'QA-HC-ADVISE':   { scope: 'Advisor assignment fairness', auditor: 'HIRE Bot #10', frequency: 'per-assignment' },
  'QA-HC-DATA':     { scope: 'Analytics accuracy', auditor: 'HIRE Bot #10', frequency: 'per-report' },
  'QA-HC-CRM':      { scope: 'CRM data hygiene', auditor: 'HIRE Bot #10', frequency: 'daily' },
  'QA-HC-SYNC':     { scope: 'Cross-platform product sync', auditor: 'HIRE Bot #10', frequency: 'per-sync' },
  'QA-HC-SCHED':    { scope: 'Scheduling accuracy', auditor: 'HIRE Bot #10', frequency: 'per-booking' },
  'QA-HC-SEC':      { scope: 'Security posture', auditor: 'External / CEO', frequency: 'continuous' },
  'QA-HC-CLIENT':   { scope: 'Client-facing transaction outreach', auditor: 'HIRE Bot #10', frequency: 'per-outreach' },
  'QA-HC-JOURNEY':  { scope: 'Milestone progression integrity', auditor: 'HIRE Bot #10', frequency: 'per-transition' },
  'QA-HC-LANE':     { scope: 'Lane transition audit', auditor: 'HIRE Bot #10 + D12', frequency: 'per-transition' },
  'QA-HC-CASH':     { scope: 'Cash protocol compliance', auditor: 'HIRE Bot #10', frequency: 'per-receipt' },
};
