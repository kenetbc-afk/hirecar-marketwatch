---
document_id: HC-CFG-013-A
title: Bot Fleet Routing Configuration — 140 Bots × 16 Departments
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS2 Bot Building
workstation: WS2-BOT-ENROLLMENT
---

# Bot Fleet Routing Configuration

## 1. Fleet Overview

| Field | Value |
|-------|-------|
| **Total Bots** | 140 |
| **Departments** | 16 |
| **Base Domain** | bot.hirecar.io |
| **Endpoint Pattern** | `bot.hirecar.io/{department}/{action}` |
| **Health Check** | Every 5 minutes per endpoint |
| **Alert Channel** | Slack #hirecar-bot-ops |
| **Pipeline Viz** | Slack #hirecar-enrollment-pipeline |

---

## 2. Department Mapping

### 2.1 Department Registry

| Dept ID | Department | Bot Count | Slug | Primary Function |
|---------|-----------|-----------|------|-----------------|
| D01 | Enrollment & Onboarding | 15 | `enrollment` | New member intake, verification, welcome flow |
| D02 | Credit Dispute Processing | 18 | `disputes` | Dispute filing, letter generation, bureau tracking |
| D03 | Score Monitoring | 10 | `scores` | Score calculation, change detection, alerts |
| D04 | Document Management | 8 | `documents` | HC Format compliance, approval routing, archival |
| D05 | Communication & Notifications | 12 | `comms` | Email, SMS, push notification orchestration |
| D06 | Playbook Management | 8 | `playbooks` | Template generation, PIN management, access control |
| D07 | Pass & Wallet Operations | 6 | `passes` | PassKit CRUD, wallet updates, QR management |
| D08 | Payment & Billing | 10 | `billing` | Invoice generation, payment tracking, tier management |
| D09 | Member Portal Support | 8 | `portal` | Authentication, session management, data proxy |
| D10 | Quality Assurance | 6 | `qa` | Brand compliance, validation scans, audit trails |
| D11 | Advisor Operations | 10 | `advisors` | Case assignment, workload balancing, escalation |
| D12 | Analytics & Reporting | 8 | `analytics` | Dashboard data, report generation, trend analysis |
| D13 | CRM Integration | 7 | `crm` | Zoho sync, field updates, workflow triggers |
| D14 | Security & Compliance | 6 | `security` | CROA compliance, PII protection, access logging |
| D15 | Scheduling & Reminders | 5 | `scheduling` | Appointment booking, follow-up cadence, SLA tracking |
| D16 | Infrastructure & Monitoring | 3 | `infra` | Health checks, uptime monitoring, error recovery |
| — | **TOTAL** | **140** | — | — |

---

## 3. Bot Naming Convention

```
BOT-HC-{DEPT_SEQ}{BOT_NUM}
```

- `DEPT_SEQ`: 2-digit department number (01–16)
- `BOT_NUM`: 2-digit bot sequence within department (01–18)

**Examples:**
- `BOT-HC-0101` — Enrollment: Welcome Flow Bot
- `BOT-HC-0201` — Disputes: Letter Generator Bot
- `BOT-HC-1601` — Infra: Health Check Bot

---

## 4. Routing Rules

### 4.1 Inbound Request Routing

```
Inbound Request → bot.hirecar.io/{dept}/{action}
                       │
                       ├─ Match department slug → Department Router
                       │     │
                       │     ├─ Match action → Specific Bot
                       │     │
                       │     └─ No match → Department Default Bot
                       │
                       └─ No match → 404 + log to #hirecar-bot-ops
```

### 4.2 Department Endpoint Map

```
bot.hirecar.io/
├── enrollment/
│   ├── intake         → BOT-HC-0101 (New member intake)
│   ├── verify         → BOT-HC-0102 (Identity verification)
│   ├── welcome        → BOT-HC-0103 (Welcome flow orchestrator)
│   ├── pin-generate   → BOT-HC-0104 (PIN generation)
│   ├── tier-assign    → BOT-HC-0105 (Membership tier assignment)
│   └── status         → BOT-HC-0106 (Enrollment status check)
│
├── disputes/
│   ├── file           → BOT-HC-0201 (File new dispute)
│   ├── letter         → BOT-HC-0202 (Generate dispute letter)
│   ├── track          → BOT-HC-0203 (Track bureau response)
│   ├── escalate       → BOT-HC-0204 (Escalation handler)
│   ├── resolve        → BOT-HC-0205 (Resolution processor)
│   └── bulk           → BOT-HC-0206 (Bulk dispute operations)
│
├── scores/
│   ├── calculate      → BOT-HC-0301 (Score calculation engine)
│   ├── update         → BOT-HC-0302 (Score update processor)
│   ├── history        → BOT-HC-0303 (Score history tracker)
│   ├── alert          → BOT-HC-0304 (Score change alerter)
│   └── report         → BOT-HC-0305 (Score report generator)
│
├── documents/
│   ├── validate       → BOT-HC-0401 (HC Format validator)
│   ├── route          → BOT-HC-0001 (Doc Approval Router — existing)
│   ├── archive        → BOT-HC-0402 (Document archival)
│   └── scan           → BOT-HC-0002 (QA Validation Bot — existing)
│
├── comms/
│   ├── email          → BOT-HC-0501 (Email dispatcher)
│   ├── sms            → BOT-HC-0502 (SMS dispatcher)
│   ├── push           → BOT-HC-0503 (Push notification sender)
│   ├── template       → BOT-HC-0504 (Template resolver)
│   └── queue          → BOT-HC-0505 (Message queue manager)
│
├── playbooks/
│   ├── create         → BOT-HC-0601 (Playbook creator)
│   ├── password       → BOT-HC-0602 (Password manager)
│   ├── template       → BOT-HC-0603 (Template engine)
│   └── access         → BOT-HC-0604 (Access control)
│
├── passes/
│   ├── create         → BOT-HC-0701 (Pass creator)
│   ├── update         → BOT-HC-0702 (Pass updater)
│   ├── revoke         → BOT-HC-0703 (Pass revocation)
│   └── status         → BOT-HC-0704 (Pass status checker)
│
├── billing/
│   ├── invoice        → BOT-HC-0801 (Invoice generator)
│   ├── payment        → BOT-HC-0802 (Payment processor)
│   ├── tier           → BOT-HC-0803 (Tier management)
│   └── history        → BOT-HC-0804 (Payment history)
│
├── portal/
│   ├── auth           → BOT-HC-0901 (Auth flow handler)
│   ├── session        → BOT-HC-0902 (Session manager)
│   ├── data           → BOT-HC-0903 (Data proxy)
│   └── render         → BOT-HC-0904 (Page renderer)
│
├── qa/
│   ├── brand-scan     → BOT-HC-1001 (Brand compliance scan)
│   ├── deploy-check   → BOT-HC-1002 (Pre-deploy validation)
│   └── audit          → BOT-HC-1003 (Audit trail generator)
│
├── advisors/
│   ├── assign         → BOT-HC-1101 (Case assignment)
│   ├── balance        → BOT-HC-1102 (Workload balancer)
│   ├── escalate       → BOT-HC-1103 (Escalation router)
│   └── notify         → BOT-HC-1104 (Advisor notification)
│
├── analytics/
│   ├── dashboard      → BOT-HC-1201 (Dashboard data aggregator)
│   ├── report         → BOT-HC-1202 (Report generator)
│   ├── trend          → BOT-HC-1203 (Trend analyzer)
│   └── export         → BOT-HC-1204 (Data exporter)
│
├── crm/
│   ├── sync           → BOT-HC-1301 (Zoho CRM sync)
│   ├── update         → BOT-HC-1302 (Field updater)
│   └── workflow       → BOT-HC-1303 (Workflow trigger)
│
├── security/
│   ├── croa           → BOT-HC-1401 (CROA compliance checker)
│   ├── pii            → BOT-HC-1402 (PII scanner)
│   └── access-log     → BOT-HC-1403 (Access logger)
│
├── scheduling/
│   ├── appointment    → BOT-HC-1501 (Appointment booker)
│   ├── reminder       → BOT-HC-1502 (Reminder sender)
│   └── sla            → BOT-HC-1503 (SLA tracker)
│
└── infra/
    ├── health         → BOT-HC-1601 (Health check runner)
    ├── monitor        → BOT-HC-1602 (Uptime monitor)
    └── recover        → BOT-HC-1603 (Error recovery)
```

---

## 5. Health Monitoring

### 5.1 Health Check Protocol

Each bot exposes a health endpoint:
```
GET bot.hirecar.io/{dept}/{action}/health
```

**Expected response (200 OK):**
```json
{
  "botId": "BOT-HC-0101",
  "status": "healthy",
  "uptime": 86400,
  "lastExecution": "2026-03-04T10:30:00Z",
  "queueDepth": 0,
  "version": "1.0.0"
}
```

### 5.2 Monitoring Schedule

| Check | Frequency | Alert Threshold |
|-------|-----------|----------------|
| Health ping | Every 5 min | 2 consecutive failures |
| Queue depth | Every 1 min | Queue > 10 items |
| Response time | Every 5 min | p95 > 5 seconds |
| Error rate | Rolling 15 min | > 5% error rate |

### 5.3 Alert Routing

```
Bot Health Failure
  └─ Slack: #hirecar-bot-ops (immediate)
  └─ Email: ops@hirecar.la (if 3+ bots down)
  └─ SMS: On-call engineer (if 10+ bots down)
  └─ Zoho CRM: Incident record created
```

---

## 6. Queue Management

### 6.1 Queue Configuration

Each department has a message queue for async bot operations:

| Department | Max Queue | Priority | Timeout |
|-----------|-----------|----------|---------|
| D01 Enrollment | 50 | HIGH | 30s |
| D02 Disputes | 100 | HIGH | 60s |
| D03 Scores | 50 | MEDIUM | 45s |
| D04 Documents | 25 | LOW | 120s |
| D05 Comms | 200 | HIGH | 15s |
| D06 Playbooks | 50 | MEDIUM | 60s |
| D07 Passes | 50 | HIGH | 30s |
| D08 Billing | 50 | HIGH | 30s |
| D09 Portal | 100 | MEDIUM | 15s |
| D10 QA | 25 | LOW | 120s |
| D11 Advisors | 50 | MEDIUM | 30s |
| D12 Analytics | 25 | LOW | 60s |
| D13 CRM | 50 | MEDIUM | 30s |
| D14 Security | 25 | HIGH | 15s |
| D15 Scheduling | 50 | MEDIUM | 30s |
| D16 Infra | 10 | CRITICAL | 10s |

### 6.2 Backpressure Rules

- Queue > 80% capacity → log warning
- Queue > 90% capacity → Slack alert
- Queue 100% → reject new requests with 503, alert on-call

---

## 7. Implementation Checklist

- [ ] Register all 140 bot IDs in HC Format registry (BOT-HC-0101 through BOT-HC-1603)
- [ ] Deploy routing layer at bot.hirecar.io (Cloudflare Workers)
- [ ] Configure department routing rules
- [ ] Implement health check endpoint for each bot
- [ ] Set up 5-minute health monitoring (WS4 scope)
- [ ] Configure Slack #hirecar-bot-ops channel and webhook
- [ ] Set up Slack #hirecar-enrollment-pipeline channel for enrollment pipeline visualization
- [ ] Run initial health check sweep: all 140 bots respond
- [ ] Load test: 100 concurrent requests across departments
- [ ] Document bot-to-department mapping in ARC-HC-0001

---

*Document Control: HC-CFG-013-A | WS2-BOT-ENROLLMENT | 2026-03-04*
