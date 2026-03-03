# HIRECAR — Governing Rights, Workflows & Bot Trigger Conditions
> Master blueprint: every section, every page, every bot, every trigger — start to end.
> Version 1.0 — March 3, 2026

---

## Table of Contents

1. [System-Wide Governing Rights](#1-system-wide-governing-rights)
2. [Client Milestone Journey — Governance & Workflows](#2-client-milestone-journey)
3. [Gamification Engine — Governance & Scoring Rules](#3-gamification-engine)
4. [Credit Repair (HIRECREDIT) — Dept 1](#4-credit-repair-hirecredit)
5. [Collision + Claims — Dept 2](#5-collision--claims)
6. [Recovery + PIFR — Dept 3](#6-recovery--pifr)
7. [Operator Standards — Dept 4](#7-operator-standards)
8. [Auto Insurance — Dept 5](#8-auto-insurance)
9. [Biz Funding (SeedXchange) — Dept 6](#9-biz-funding-seedxchange)
10. [Mobility + Rentals — Dept 7](#10-mobility--rentals)
11. [Roadside — Dept 8](#11-roadside)
12. [Entertainment — Dept 9](#12-entertainment)
13. [MW Intelligence — Dept 10](#13-mw-intelligence)
14. [Playbooks — Dept 11](#14-playbooks)
15. [Accounting, Follow-Up & Planning — Dept 12](#15-accounting-follow-up--planning)
16. [Marketing & Sales — Dept 13](#16-marketing--sales)
17. [Membership Services — Dept 14](#17-membership-services)
18. [HIRECAR HQ — Dept 15](#18-hirecar-hq)
19. [Cross-Department Handoff Rules](#19-cross-department-handoff-rules)
20. [Bot Delegation Model — Master Trigger Map](#20-bot-delegation-model)

---

## 1. System-Wide Governing Rights

### 1.1 Access Control Hierarchy

```
ROLE                    ACCESS LEVEL                    GOVERNS
─────────────────────────────────────────────────────────────────────────
Platform Admin          Full system access              All departments, all data, all bots
Department Lead         Department + downstream         Own dept pages, bots, member data within scope
Operator (Staff)        Assigned department views        Read/execute within assigned workflows
Member (Client)         Tier-gated access               Pages/services unlocked by milestone + tier
Supplier (HQ)           Supplier Portal only             Own listings, bids, payouts, compliance
Guest / Prospect        Public pages only                Landing, About, Contact, limited Services
```

### 1.2 Tier-Gated Access Rights

| Tier | XP Required | Access Rights |
|------|-------------|---------------|
| **Standard** | 0 XP | Basic member portal, service catalog (view only), support (standard queue), 1 active service, basic playbooks |
| **Operator** | 1,000 XP | Priority support queue, all playbooks, up to 3 active services, VDI tracker, HBI dashboard, discount pricing |
| **First Class** | 5,000 XP | Concierge bot, premium services, unlimited active services, coaching portal, funding pre-qualification, entertainment access |
| **Elite Operator** | 15,000 XP | VIP support (direct line), advisory board access, beta features, custom playbooks, SeedXchange priority, white-glove onboarding for referrals |

### 1.3 Data Governance Rules

| Rule | Description |
|------|-------------|
| **Member Data Isolation** | No member can view another member's data, scores, or journey status |
| **Score Immutability** | Scores are computed by bots only — no manual override without audit trail |
| **Document Retention** | All uploaded documents retained for 7 years minimum |
| **Audit Trail** | Every bot action, score change, and milestone transition logged with timestamp + actor |
| **Consent Gate** | No bot action proceeds without member confirmation at the ACT step |
| **Human Escalation** | Member can request human operator at any point — bot must comply immediately |
| **Data Portability** | Member can export all their data (scores, documents, history) at any time |

### 1.4 Bot Operating Principles (All Departments)

Every AI bot in the system operates under these universal rules:

```
PRINCIPLE               RULE
─────────────────────────────────────────────────────────────────
Transparency            Bot must identify itself and state its purpose on first interaction
Consent                 No irreversible action without explicit member confirmation
Explainability          Bot must explain WHY it's recommending an action when asked
Fallback                If bot confidence < 70%, escalate to human
Rate Limiting           No more than 3 bot-initiated contacts per member per day
Quiet Hours             No bot notifications between 10 PM – 7 AM member local time
Context Carry           Bot must carry full context when handing off to another department
Score Protection        Bot cannot lower a score without logging the specific reason
XP Integrity            XP awards are final — cannot be retroactively removed
Privacy                 Bot never shares member data across members or with suppliers
```

---

## 2. Client Milestone Journey

### 2.1 Governing Rights

| Right | Rule |
|-------|------|
| **Phase Assignment** | Only the Milestone Evaluator bot or Platform Admin can advance a member's phase |
| **Phase Regression** | A member can regress phases only if a qualifying event occurs (new incident, compliance failure) — requires audit log entry |
| **Visibility** | Members see their own journey map. Staff sees all members in their department scope |
| **Override** | Department Lead can manually override a phase gate with documented reason |
| **Department Activation** | Departments auto-activate based on phase — no manual activation needed |

### 2.2 Phase Definitions & Gate Conditions

```
PHASE 1: INTAKE
├── Entry Trigger:     New member enrollment OR lead conversion
├── Gate to Phase 2:   Profile complete + at least 1 service activated + first appointment booked
├── Active Departments: Marketing & Sales, Membership Services
├── Locked Departments: All service departments (view-only catalog)
└── Bot Active:        Welcome Journey, Service Discovery Engine, Lead Scoring Engine

PHASE 2: RECOVERY
├── Entry Trigger:     Intake complete + qualifying event identified (collision, claim, incident)
├── Gate to Phase 3:   Active claims resolved OR PIFR packet submitted + insurance status confirmed
├── Active Departments: Collision + Claims, Recovery + PIFR, Auto Insurance, Roadside
├── Newly Unlocked:    Claims Tracker, PIFR Portal, Collections Shield
└── Bot Active:        Claims Intake Bot, PIFR Tier Recommender, Emergency Dispatch Bot

PHASE 3: REBUILDING
├── Entry Trigger:     Recovery phase complete OR credit repair need identified at intake
├── Gate to Phase 4:   CRI Score ≥ 60 + at least 1 dispute cycle complete + tradeline strategy active
├── Active Departments: Credit Repair (HIRECREDIT)
├── Newly Unlocked:    HIRECREDIT Dashboard, Dispute Center, CreditWithKen Portal
└── Bot Active:        Credit Intake Wizard, Dispute Builder, Tradeline Strategy Coach

PHASE 4: OPERATING
├── Entry Trigger:     Rebuilding complete + BRE baseline assessment done
├── Gate to Phase 5:   HBI ≥ 75 + VDI ≥ 80 on all vehicles + BRE ≥ 70 + zero open cure windows
├── Active Departments: Operator Standards, MW Intelligence, Playbooks, Entertainment
├── Newly Unlocked:    HBI Dashboard, BRE Compliance Center, VDI Tracker, Intelligence Dashboard
└── Bot Active:        HBI Live Scorer, BRE Compliance Walkthrough, VDI Document Challenge

PHASE 5: SCALING
├── Entry Trigger:     Operating phase standards met
├── Gate:              None — this is the growth phase (ongoing)
├── Active Departments: Biz Funding, Mobility + Rentals, Marketing (referral programs)
├── Newly Unlocked:    SeedXchange Portal, Fleet Dashboard, Referral Program Hub
└── Bot Active:        Application Pre-Qualifier, Funding Match Engine, Fleet ROI Modeler
```

### 2.3 Workflow: Start to End

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CLIENT MILESTONE JOURNEY — FULL WORKFLOW                │
└─────────────────────────────────────────────────────────────────────────────┘

START: New lead captured (Marketing) OR direct enrollment (Membership Services)
  │
  ▼
[1] INTAKE PHASE
  │  ├── Welcome Journey bot activates → 5-step onboarding quest
  │  ├── Service Discovery Engine → matches services to member situation
  │  ├── Profile + Vehicle Registry → baseline data collected
  │  ├── MSI Score initialized → engagement tracking begins
  │  └── Gate Check: Profile complete? Service active? Appointment booked?
  │         ├── NO → Bot nudges: "You're 2 steps from unlocking your services"
  │         └── YES ▼
  │
[2] RECOVERY PHASE (if qualifying event exists)
  │  ├── Claims Intake Bot → collects incident details
  │  ├── PIFR Tier Recommender → assesses Core/Plus/Max
  │  ├── Recovery Packet Generator → assembles documents
  │  ├── Collections Shield activates → monitors for new collections
  │  ├── Auto Insurance bots → policy review + gap detection
  │  └── Gate Check: Claims resolved? PIFR submitted? Insurance confirmed?
  │         ├── NO → Bot tracks timelines, sends reminders, escalates stalls
  │         └── YES ▼
  │
[3] REBUILDING PHASE
  │  ├── Credit Intake Wizard → builds dispute profile interactively
  │  ├── Dispute Builder → generates dispute letters per negative item
  │  ├── Tradeline Strategy Coach → models credit improvement paths
  │  ├── CreditWithKen Session Prep → readies member for coaching
  │  ├── Score Projection Simulator → visualizes trajectory
  │  ├── CRI Score tracked → gamified credit health
  │  └── Gate Check: CRI ≥ 60? Dispute cycle done? Strategy active?
  │         ├── NO → Weekly Credit Challenge keeps engagement
  │         └── YES ▼
  │
[4] OPERATING PHASE
  │  ├── HBI Live Scorer → interactive behavioral scorecard
  │  ├── BRE Compliance Walkthrough → guided audit checklist
  │  ├── VDI Document Challenge → per-vehicle doc completion game
  │  ├── Revenue Lane Navigator → lane selection + action plan
  │  ├── Cure Window Coach → deadline tracking with guided resolution
  │  ├── MW Intelligence bots → custom reports + trend analysis
  │  └── Gate Check: HBI ≥ 75? VDI ≥ 80 all? BRE ≥ 70? Zero cures?
  │         ├── NO → Monthly Operations Quest drives progress
  │         └── YES ▼
  │
[5] SCALING PHASE (ongoing)
  │  ├── Application Pre-Qualifier → funding readiness check
  │  ├── Funding Match Engine → matches to capital programs
  │  ├── Fleet ROI Modeler → projects expansion returns
  │  ├── Dynamic Pricing Engine → rental optimization
  │  ├── Referral Match Bot → growth through network
  │  └── No gate — continuous growth with tier advancement
  │
  ▼
ONGOING: All phases maintain
  ├── Accounting bots → invoicing, payments, follow-ups
  ├── Membership Services bots → engagement, support, renewals
  ├── Gamification Engine → XP, streaks, badges, quests
  └── HQ bots → supplier matching, fulfillment, quality
```

### 2.4 Bot Trigger Conditions — Journey System

| Bot | Trigger Condition | Frequency | Output |
|-----|-------------------|-----------|--------|
| **Milestone Evaluator** | Runs when any gate-relevant metric changes (score update, document upload, service completion) | Event-driven | Phase advancement recommendation or hold with reason |
| **Department Router** | Fires on phase transition | On phase change | Activates/deactivates department access, notifies relevant bots |
| **Journey Orchestrator** | Fires when cross-department handoff needed | Event-driven | Carries context from Dept A to Dept B, queues next workflow |
| **Progress Reporter** | Scheduled + on-demand | Weekly (auto) + member request | Summary of milestones achieved, scores changed, next steps |
| **Bottleneck Detector** | Runs when member stalls in a phase > 30 days | Every 30 days of stall | Identifies stall reason, recommends intervention, alerts staff |
| **Completion Predictor** | Runs on phase entry + monthly | Phase entry + monthly | Estimated timeline to next milestone based on historical cohort data |

---

## 3. Gamification Engine

### 3.1 Governing Rights

| Right | Rule |
|-------|------|
| **XP Issuance** | Only bots can award XP — no manual XP grants without Platform Admin + audit log |
| **XP Permanence** | Earned XP is permanent — cannot be deducted or reversed |
| **Tier Advancement** | Automatic when XP threshold met — no approval required |
| **Tier Regression** | Tiers cannot regress — once earned, always retained |
| **Badge Authenticity** | Badges awarded only when all criteria met — no partial badges |
| **Score Computation** | Department scores computed by authorized department bots only |
| **Composite Score** | Computed as weighted average: HBI (20%) + VDI (15%) + BRE (15%) + CRI (20%) + FPI (15%) + MSI (15%) |
| **Leaderboard Privacy** | No public leaderboards — scores are private to each member |
| **Quest Fairness** | Quest difficulty scales with member tier — no one-size-fits-all |
| **Streak Rules** | Streaks reset on miss — no retroactive credit. Earned XP from streaks retained |

### 3.2 XP Award Workflow

```
EVENT OCCURS (doc upload, dispute filed, payment made, etc.)
  │
  ▼
Bot validates the event
  ├── Was the action genuine? (not duplicate, not fraudulent)
  ├── Does the member qualify? (right phase, right tier)
  └── Is this the first award for this event? (dedup check)
        │
        ├── FAIL → Log attempt, no XP awarded, flag if suspicious
        └── PASS ▼
              │
              Award XP to member account
              │
              ├── Update XP total
              ├── Check tier threshold → if crossed, trigger Tier Advancement
              ├── Check badge criteria → if met, award badge
              ├── Check quest progress → if complete, award quest bonus
              ├── Check streak status → if active, increment streak counter
              ├── Update department score (CRI, HBI, etc.)
              ├── Recalculate Composite Score
              └── Push notification to member: "+150 XP — Dispute Round Complete!"
```

### 3.3 Scoring System Governance

| Score | Department Owner | Inputs | Update Frequency | Bot Responsible |
|-------|-----------------|--------|------------------|-----------------|
| **HBI (0–100)** | Operator Standards | Response time, compliance adherence, engagement consistency, vendor audit readiness, cure window performance | Real-time on event | HBI Live Scorer |
| **VDI (0–100)** | Operator Standards | Document completeness per vehicle: registration, insurance, service records, inspection, title | On document upload | VDI Document Challenge |
| **BRE (0–100)** | Operator Standards | Business license, insurance, certifications, compliance checklists, audit pass rate | On audit/upload | BRE Compliance Walkthrough |
| **CRI (0–100)** | Credit Repair | Credit score baseline, dispute success rate, collections cleared, tradeline strategy adherence, funding ledger performance | On dispute result / payment | Dispute Builder + Collections Shield |
| **FPI (0–100)** | Accounting | Invoice payment timeliness, outstanding balance age, payment plan adherence, budget health | On payment / invoice event | Invoice Walkthrough + Payment Plan Builder |
| **MSI (0–100)** | Membership Services | Login frequency, service activation rate, appointment attendance, support interactions, document vault completeness | Daily recalculation | Engagement Pulse |

### 3.4 Badge Unlock Workflow

```
BADGE CRITERIA MET (detected by relevant department bot)
  │
  ▼
Badge Engine validates
  ├── All criteria confirmed? (cross-check with audit trail)
  ├── Badge not already awarded?
  └── Member in eligible phase/tier?
        │
        ├── FAIL → Log, no badge
        └── PASS ▼
              │
              Award badge to member profile
              │
              ├── Badge appears on Member Portal + Operator Stories
              ├── Celebration animation triggered
              ├── Push notification: "You earned Dispute Champion!"
              ├── Bonus XP awarded (badge-specific)
              └── If badge unlocks a perk → activate perk immediately
```

---

## 4. Credit Repair (HIRECREDIT) — Dept 1

### 4.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 3 (Rebuilding) or if credit need identified at intake |
| **Minimum Tier** | Standard (all tiers can access basic credit tools) |
| **CreditWithKen** | Coaching portal requires Operator tier or above |
| **Dispute Limits** | Max 5 concurrent dispute letters per bureau per cycle |
| **Data Source** | Member must provide credit report — bot does not pull credit |
| **Letter Delivery** | Bot generates letters; member responsible for mailing unless First Class+ (concierge mails) |
| **Funding Ledger** | Read-only for members; updated by system on funding events |
| **Score Visibility** | CRI visible to member + Credit department staff only |

### 4.2 Page Workflows

#### HIRECREDIT Dashboard
```
TRIGGER: Member navigates to HIRECREDIT section
  │
  ▼
Load member credit profile
  ├── Display CRI Score with animated progress ring
  ├── Show credit score trend line (if data available)
  ├── Show active disputes and their status
  ├── Show collections shield status
  ├── Show funding ledger timeline (if applicable)
  ├── Show next recommended action card
  └── Show weekly credit challenge status
```

#### Credit Dispute Center
```
TRIGGER: Member clicks "Start Dispute" or bot queues dispute workflow
  │
  ▼
Dispute Builder bot activates
  ├── Step 1: Present negative items as interactive cards
  │     └── Each card shows: creditor, amount, date, bureau, dispute angle
  ├── Step 2: Member taps item → bot explains dispute strategy
  │     └── "This item is a [type]. Best angle: [strategy]. Confidence: [%]"
  ├── Step 3: Member confirms or adjusts approach
  ├── Step 4: Bot generates dispute letter in real-time
  │     └── Letter preview shown → member can edit or approve
  ├── Step 5: Member approves → letter queued for delivery
  │     └── First Class+ → concierge mails; Standard/Operator → member mails
  ├── Step 6: Award +150 XP per completed dispute round
  ├── Step 7: Update CRI Score
  ├── Step 8: Check badge progress (Dispute Champion: 5 resolved)
  └── Step 9: Recommend next action: "Track response in 30 days" or "Start next item"
```

#### Collections Protection Hub
```
TRIGGER: Collections Shield detects new collection OR member navigates to hub
  │
  ▼
Display active collections with status
  ├── For each collection:
  │     ├── Show creditor, amount, date reported, bureau
  │     ├── Show protection status (active/pending/resolved)
  │     └── Show available actions
  ├── If new collection detected:
  │     ├── Push alert to member
  │     ├── Bot walks through response options interactively
  │     ├── Auto-generate protection letter if member approves
  │     └── Award +200 XP on clearance + CRI boost
  └── If zero new collections for 90 days → award Clean Shield badge
```

#### CreditWithKen Coaching Portal
```
TRIGGER: Member books a session OR session reminder fires (24hr before)
  │
  ▼
CreditWithKen Session Prep bot activates
  ├── Step 1: 5-minute interactive review
  │     └── "Your CRI moved from [X] → [Y] since last session. Here's what changed..."
  ├── Step 2: Present key changes as cards (disputes resolved, scores moved, new items)
  ├── Step 3: Member flags questions for Ken
  ├── Step 4: Generate session prep summary (shared with Ken before session)
  ├── Step 5: Award +100 XP for attending
  └── Step 6: Bonus +25 XP if all prep questions completed
```

#### Score Projection Simulator
```
TRIGGER: Member navigates to simulator OR bot recommends it
  │
  ▼
Load current credit data
  ├── Present interactive sliders:
  │     ├── "Pay down $X on [account]" → projected impact
  │     ├── "Dispute [Y] items" → projected impact
  │     └── "Add [Z] tradeline" → projected impact
  ├── AI calculates projected trajectory in real-time
  ├── Display animated graph showing score over time
  ├── If projected milestone reachable → trigger Quest:
  │     └── "Reach 680 by Q3 — here's your path"
  └── Quest completion = +500 XP bonus
```

### 4.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow Steps | XP Award |
|-----|---------|-----------|----------------|----------|
| **Credit Intake Wizard** | Member enters Phase 3 OR manually starts credit intake | First-time credit profile build | GREET → collect bureau data → explain items → build dispute profile → REWARD | +50 XP |
| **Dispute Builder** | Member initiates dispute OR bot recommends next round | Negative items exist on credit report | Present items → explain angles → member confirms → generate letter → track delivery | +150 XP/round |
| **Tradeline Strategy Coach** | Credit Intake complete OR CRI < 50 | Member needs tradeline improvement | Present options as decision tree → model impact → member selects → execute strategy | +75 XP/strategy |
| **Collections Shield** | New collection detected on monitored report | Real-time monitoring (daily scan) | Alert → walk through options → generate protection letter → track resolution | +200 XP on clearance |
| **CreditWithKen Session Prep** | 24 hours before scheduled coaching session | Session booked in scheduling system | Interactive review → flag questions → generate prep summary | +100 XP attend, +25 XP prep |
| **Score Projection Simulator** | On-demand (member navigates) OR bot recommends | Credit data available | Load data → interactive sliders → calculate trajectory → quest generation | +500 XP on quest complete |
| **Weekly Credit Challenge** | Every Monday at 9 AM member local time | Member is in Phase 3+ with active credit services | Issue micro-challenge → track completion → award XP → update streak | +25–50 XP per challenge |

---

## 5. Collision + Claims — Dept 2

### 5.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 2 (Recovery) when a collision/incident is reported |
| **Minimum Tier** | Standard |
| **Data Sensitivity** | Claims data is restricted — visible only to member + Claims department staff |
| **Photo Upload** | All photos are encrypted at rest and in transit |
| **Third-Party Data** | Multi-party liability data never shared with other members |
| **Report Access** | MCI reports accessible to Operator tier+ only |
| **Collision Data** | Aggregate LA collision data (810K+ records) is anonymized — no PII |

### 5.2 Page Workflows

#### LA Collision Data Dashboard
```
TRIGGER: Member or staff navigates to collision data section
  │
  ▼
Load anonymized collision dataset
  ├── Display heatmap of LA collision locations
  ├── Show trend analysis (time of day, day of week, intersection risk)
  ├── Filter controls: date range, location, severity, vehicle type
  ├── Display top-risk corridors for operators
  └── Link to MCI R-DATA-003 report (Operator tier+)
```

#### Multi-Party Claims Tracker
```
TRIGGER: Claims Intake Bot completes intake OR member navigates to tracker
  │
  ▼
Load claim record
  ├── Display all parties with their role (claimant, respondent, witness)
  ├── Show coverage status per party
  ├── Display liability assessment (AI-generated, staff-reviewable)
  ├── Timeline view: incident → claim filed → adjuster assigned → resolution
  ├── Status badges: Open / Under Review / Resolved / Escalated
  └── Action buttons: Upload Document / Request Update / Escalate
```

### 5.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Claims Intake Bot** | Member reports a collision/incident (via portal or roadside) | New incident, no existing claim | GREET → collect accident details → request photos/police report → create claim record → assign to adjuster | +50 XP |
| **Multi-Party Liability Analyzer** | Claims Intake complete + multiple parties identified | ≥2 parties involved | Analyze fault distribution → present findings → staff review → member notification | +75 XP |
| **Claims Status Monitor** | Claim open for > 14 days without update | Active claim with no recent activity | Check insurer response → flag delay → send nudge to insurer → escalate if > 30 days | +30 XP on resolution |
| **Collision-to-Credit Impact Predictor** | Claim filed + member has active credit profile | Both claims and credit data exist | Map collision financial impact → predict credit timeline effects → generate protective strategy | +40 XP |

---

## 6. Recovery + PIFR — Dept 3

### 6.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 2 (Recovery) |
| **Tier Selection** | Bot recommends tier; member makes final selection. No forced upsells |
| **Packet Integrity** | Once a recovery packet is submitted, it cannot be edited without audit trail |
| **Custody Log** | Chain-of-evidence logs are tamper-proof — append-only |
| **Admin Failure Docs** | Admin failure documentation is privileged — not shared with at-fault parties |
| **SOW Approval** | Statement of Work requires explicit member sign-off before work begins |

### 6.2 Page Workflows

#### PIFR Intake Portal
```
TRIGGER: Member selects "Start Recovery" from Recovery department OR bot recommends PIFR
  │
  ▼
PIFR Tier Recommender bot activates
  ├── Step 1: GREET — "I'm going to help you select the right recovery tier"
  ├── Step 2: GUIDE — Conversational intake:
  │     ├── "How many vehicles involved?"
  │     ├── "Any administrative failures by insurers?"
  │     ├── "How many days since the incident?"
  │     ├── "Any collections activity resulting from the incident?"
  │     └── Additional qualifying questions based on responses
  ├── Step 3: Bot scores situation against tier criteria:
  │     ├── Core: Single incident, straightforward recovery
  │     ├── Plus: Multi-party, admin failures, moderate complexity
  │     └── Max: Complex multi-party, custody disputes, extensive admin failures
  ├── Step 4: Present recommendation with reasoning
  │     └── "Based on [factors], I recommend PIFR Plus. Here's why..."
  ├── Step 5: Member confirms tier selection
  ├── Step 6: ACT — Generate SOW for selected tier
  ├── Step 7: Member reviews and signs SOW
  ├── Step 8: REWARD — +75 XP for completing intake
  └── Step 9: NEXT — Queue Recovery Packet Generator
```

#### Recovery Packet Builder
```
TRIGGER: PIFR Tier selected + SOW signed
  │
  ▼
Recovery Packet Generator bot activates
  ├── Step 1: List all required documents for selected tier
  ├── Step 2: For each document:
  │     ├── Check if already in Document Vault → auto-attach if yes
  │     ├── If missing → prompt member to upload
  │     └── If obtainable → offer to request on member's behalf (First Class+)
  ├── Step 3: Assemble documents into formatted packet
  ├── Step 4: Member reviews assembled packet
  ├── Step 5: Submit packet → status changes to "Under Review"
  ├── Step 6: Award +100 XP for packet submission
  └── Step 7: Track packet status and notify member of updates
```

### 6.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **PIFR Tier Recommender** | Member initiates recovery OR Collision bot completes + flags recovery need | Qualifying incident exists | Conversational intake → score situation → recommend tier → member selects | +75 XP |
| **Recovery Packet Generator** | PIFR tier selected + SOW signed | Required docs list established | Check vault → prompt uploads → assemble → submit | +100 XP |
| **Admin Failure Pattern Detector** | Recovery packet contains admin failure claims | ≥1 admin failure alleged | Analyze failure patterns → cross-reference industry data → generate pattern report | +50 XP |
| **Custody Log Auditor** | Vehicle custody chain entered | ≥2 custody transfers | Audit chain for gaps → flag inconsistencies → generate audit findings | +50 XP |
| **SOW Generator** | PIFR tier selected by member | Tier + incident data available | Generate Statement of Work with scope, timeline, fees → member review | N/A (part of intake) |
| **Audit Report Builder** | Recovery process complete OR on-demand | All recovery data collected | Compile findings → format report → present to member | +75 XP |

---

## 7. Operator Standards — Dept 4

### 7.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 4 (Operating) |
| **Score Transparency** | HBI, VDI, BRE scores visible to member at all times with full breakdown |
| **Audit Scheduling** | Vendor audits require 14-day advance notice to member |
| **Cure Windows** | Cure window deadlines are system-enforced — no extensions without Department Lead approval |
| **Lane Selection** | Revenue Lane vs Cure Lane is advisory — member makes final choice |
| **VDI per Vehicle** | Each vehicle scored independently — fleet average also shown |
| **Compliance Failure** | 3 consecutive BRE audit failures → member flagged for remediation plan |

### 7.2 Page Workflows

#### HBI Score Dashboard
```
TRIGGER: Member navigates to Operator Standards OR Phase 4 entry
  │
  ▼
HBI Live Scorer bot activates
  ├── Display HBI Score as animated gauge (0–100)
  ├── Break down into 5 behavioral tiers:
  │     ├── Tier 1: Response Time (weight: 20%)
  │     ├── Tier 2: Compliance Adherence (weight: 25%)
  │     ├── Tier 3: Engagement Consistency (weight: 20%)
  │     ├── Tier 4: Vendor Audit Readiness (weight: 15%)
  │     └── Tier 5: Cure Window Performance (weight: 20%)
  ├── Each tier is tappable → bot explains what's driving score
  ├── Bot offers specific action for lowest-scoring tier:
  │     └── "Your response time is dragging Tier 1. Want auto-reply templates?"
  ├── Member accepts → bot configures → score updates live
  ├── Award +100 XP per tier improvement
  └── Reaching HBI 80+ → Operator Excellence badge
```

#### BRE Compliance Center
```
TRIGGER: Member navigates OR quarterly audit cycle begins
  │
  ▼
BRE Compliance Walkthrough bot activates
  ├── Present audit as interactive checklist conversation
  ├── For each compliance item:
  │     ├── "Business license — is this current? [Upload / Confirm / Skip]"
  │     ├── Bot explains why this item matters
  │     ├── If gap found → bot offers to auto-generate fix action
  │     └── Progress bar updates with each item
  ├── Complete audit pass = +150 XP
  ├── Zero gaps = Compliance Ace badge progress (need 3 consecutive months)
  └── Gaps found → bot generates remediation timeline
```

#### VDI Tracker
```
TRIGGER: Member navigates OR new vehicle added to registry
  │
  ▼
VDI Document Challenge bot activates
  ├── Display each vehicle with VDI progress wheel
  ├── For each vehicle, show:
  │     ├── Current VDI score
  │     ├── Missing documents (registration, service records, insurance, inspection, title)
  │     └── Upload interface per missing doc
  ├── Bot prompts: "Your [Vehicle] is at VDI [X]. Missing: [list]. Upload any to level up."
  ├── Each doc uploaded = +25 XP + VDI score bump
  ├── VDI 80+ per vehicle = +200 XP + Doc Master badge progress
  └── Weekly VDI Challenge: "Get 3 vehicles to VDI 80+ this month" = +500 XP quest
```

### 7.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **HBI Live Scorer** | Phase 4 entry + any behavioral event (response, compliance action, engagement) | Member in Phase 4+ | Score → present breakdown → offer improvement actions → track | +100 XP/tier improvement |
| **BRE Compliance Walkthrough** | Quarterly audit cycle OR member initiates | BRE data available | Guided checklist → explain items → flag gaps → generate fixes | +150 XP/audit pass |
| **VDI Document Challenge** | New vehicle added OR weekly challenge cycle | ≥1 vehicle in registry | Show progress wheels → prompt uploads → score updates → badge checks | +25 XP/doc, +200 XP at 80+ |
| **Revenue Lane Navigator** | Phase 4 entry OR bot detects mixed lane signals | HBI + cure data available | Diagnostic questions → lane recommendation → build action plan → track | +300 XP on lane completion |
| **Cure Window Coach** | Cure window opened OR deadline approaching (14/7/3/1 day warnings) | Open cure window exists | Countdown display → escalating nudges → guided resolution → track | +75 XP per cure resolved |
| **Vendor Audit Game** | 14 days before scheduled vendor audit | Audit scheduled | Readiness quiz → score responses → flag gaps → generate prep actions | +150 XP at 90%+ |
| **Monthly Operations Quest** | 1st of each month | Member in Phase 4+ | Issue cross-metric challenge → track progress → award on completion | +750 XP |

---

## 8. Auto Insurance — Dept 5

### 8.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 2 (Recovery) — Coming 2026 |
| **Policy Data** | Member provides policy data — system does not access insurer systems directly |
| **No Binding** | System provides comparison and recommendation only — does not bind policies |
| **Coverage Advice** | All coverage recommendations include disclaimer: "Not insurance advice" |
| **Insurer Neutrality** | No preferential treatment of any insurer in comparison tools |

### 8.2 Page Workflows

#### Policy Comparison Tool
```
TRIGGER: Member navigates to insurance section OR Recovery phase activates insurance review
  │
  ▼
Policy Recommender bot activates
  ├── Collect current coverage details (member input or document upload)
  ├── Present side-by-side comparison: current vs recommended options
  ├── Each option shows: premium, deductible, coverage limits, gap analysis
  ├── Bot explains tradeoffs: "Option B costs $40/mo more but eliminates your $15K gap"
  └── Member selects preference → bot generates coverage action plan
```

### 8.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Policy Recommender** | Phase 2 entry + insurance review flagged | Policy data provided | Analyze profile → match to coverage options → present comparison | +50 XP |
| **Claims-to-Collections Predictor** | Active claim + aging > 60 days | Claim open, potential billing exposure | Model timeline → predict collection risk → recommend protective actions | +40 XP |
| **Billing Fog Analyzer** | Member uploads insurance statement OR flags billing confusion | Insurance billing document available | Decode statement → explain charges → flag errors → recommend disputes | +30 XP |
| **Coverage Gap Detector** | Policy data available + fleet vehicles registered | ≥1 policy + ≥1 vehicle | Cross-reference policies to vehicles → identify gaps → recommend fixes | +50 XP |

---

## 9. Biz Funding (SeedXchange) — Dept 6

### 9.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 5 (Scaling) — Coming 2026 |
| **Minimum Tier** | Operator tier+ for applications; First Class+ for priority review |
| **HBI Gate** | HBI ≥ 70 required to submit funding application |
| **CRI Gate** | CRI ≥ 55 required for funding pre-qualification |
| **Financial Data** | Member provides financial documents — system does not access bank accounts |
| **Approval Authority** | Bot pre-qualifies only — final approval by SeedXchange underwriting team |
| **Funding Ledger** | All funding events logged to CRI Funding Ledger automatically |
| **Conflict of Interest** | System discloses all fees, terms, and conditions before application |

### 9.2 Page Workflows

#### SeedXchange Application Portal
```
TRIGGER: Member in Phase 5 + meets HBI/CRI gates + navigates to funding
  │
  ▼
Application Pre-Qualifier bot activates
  ├── Step 1: Check gate scores (HBI ≥ 70, CRI ≥ 55)
  │     ├── FAIL → Show which scores need improvement + link to relevant dept
  │     └── PASS → Continue
  ├── Step 2: Conversational pre-qualification:
  │     ├── "What type of funding? [Fleet expansion / Working capital / Equipment]"
  │     ├── "How much are you looking for?"
  │     ├── "What's your monthly revenue?"
  │     └── Additional qualifying questions
  ├── Step 3: Bot scores application likelihood
  │     └── "Based on your profile, estimated approval chance: [X%]"
  ├── Step 4: If ≥ 60% chance → proceed to full application
  │     └── If < 60% → recommend improvement actions first
  ├── Step 5: Document Prep Bot assembles required financial docs
  ├── Step 6: Member reviews and submits application
  ├── Step 7: Award +100 XP for submission
  └── Step 8: Track application through 24hr qualification dashboard
```

### 9.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Application Pre-Qualifier** | Member initiates funding application | Phase 5 + HBI ≥ 70 + CRI ≥ 55 | Gate check → conversational intake → score likelihood → proceed or defer | +100 XP on submit |
| **Funding Match Engine** | Pre-qualification score ≥ 60% | Application data available | Match to capital programs → rank by fit → present options | +50 XP |
| **Fleet ROI Modeler** | Funding type = fleet expansion | Vehicle + revenue data available | Project ROI → model scenarios → present analysis | +75 XP |
| **Document Prep Bot** | Application proceeds past pre-qualification | Doc checklist generated | Check vault → identify missing → prompt uploads → assemble package | +50 XP |
| **Approval Pathway Advisor** | Application submitted | Application in review | Guide through approval steps → track status → provide updates | +30 XP/update |

---

## 10. Mobility + Rentals — Dept 7

### 10.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 5 (Scaling) — Coming 2026 |
| **Booking** | All bookings require valid member profile + payment method on file |
| **Cancellation** | 24hr free cancellation; fees after per booking type |
| **First Class Access** | Premium vehicles and chauffeur services require First Class tier+ |
| **Driver Network** | Private drivers are vetted through HQ supplier management |
| **Pricing Transparency** | All pricing visible before booking confirmation |
| **Insurance Requirement** | Active insurance coverage required for rental bookings |

### 10.2 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Dynamic Pricing Engine** | Hourly recalculation cycle | Fleet inventory + demand data | Analyze supply/demand → adjust pricing → update listings | N/A (system) |
| **Fleet Utilization Optimizer** | Daily at 6 AM | Fleet deployment data | Analyze utilization → recommend redeployment → flag idle vehicles | N/A (system) |
| **Booking Concierge** | Member initiates booking inquiry | Member in Phase 5+ | Conversational booking → preferences → vehicle match → confirm | +30 XP |
| **Driver Match Bot** | Chauffeur service requested | First Class+ tier | Match preferences → present driver options → schedule → confirm | +30 XP |

---

## 11. Roadside — Dept 8

### 11.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 2 (Recovery) — Coming 2026 |
| **Emergency Priority** | Emergency requests bypass all queues — immediate dispatch |
| **Location Data** | Member location used for dispatch only — not stored beyond service completion |
| **ETA Accuracy** | Bot must provide realistic ETAs — never underestimate |
| **Provider Vetting** | All roadside providers vetted through HQ supplier management |
| **Service Limits** | Standard tier: 2 roadside calls/month; Operator+: 5/month; First Class+: unlimited |

### 11.2 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Emergency Dispatch Bot** | Member taps "Emergency" OR calls in | Active membership + location available | Triage → dispatch nearest provider → track → confirm arrival | +50 XP |
| **ETA Predictor** | Dispatch confirmed | Provider location + route data | Calculate ETA → push to member → update every 5 min | N/A (service) |
| **Preventive Maintenance Advisor** | Vehicle service record shows gap > 6 months | Vehicle in registry with service history | Recommend services → show nearest providers → book if member approves | +25 XP |
| **Service Provider Matcher** | Non-emergency service request | Service type + location | Score providers → rank by location/rating/availability → present top 3 | +20 XP |

---

## 12. Entertainment — Dept 9

### 12.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Unlocked at Phase 4 (Operating) for full access; public content visible to all |
| **Content Submission** | Members can submit content; all submissions moderated before publishing |
| **Operator Stories** | Featured stories require member consent and editorial review |
| **Event RSVPs** | Event capacity managed — RSVP required, waitlist if full |
| **Badge Display** | Only earned badges display on Operator Stories profiles |
| **Brand Guidelines** | All published content must comply with HIRECAR brand guidelines |

### 12.2 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Content Scheduler** | Content queued for publication | Approved content in pipeline | Schedule publication → distribute across channels → track engagement | N/A (system) |
| **Community Engagement Bot** | New content submission | Member submits photo/story/wrap | Moderate → approve/request changes → publish → highlight if quality score high | +30 XP on publish |
| **Event Promotion Engine** | New event created (30 days before) | Event details finalized | Generate promo materials → schedule social posts → track RSVPs | N/A (system) |

---

## 13. MW Intelligence — Dept 10

### 13.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Intelligence Dashboard: Phase 4+; MCI Reports: Operator tier+ |
| **Data Anonymization** | All market data anonymized — no individual operator data in reports |
| **Report Frequency** | Custom reports: max 2 per month (Standard); unlimited (First Class+) |
| **Predictive Models** | All predictions include confidence interval and disclaimer |
| **Data Freshness** | Reports labeled with data vintage — must be < 30 days old |
| **Operator Dashboard** | Shows only member's own data in context of market averages |

### 13.2 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Report Generator** | Member requests custom report OR scheduled generation | Data available + member in Phase 4+ | Compile data → format report → deliver → log | +50 XP |
| **Trend Analyzer** | Weekly cycle (Monday 8 AM) | Sufficient data for trend analysis | Analyze collision/credit data → identify patterns → surface insights | N/A (system) |
| **Anomaly Detector** | Continuous monitoring | Operator metrics outside 2σ of norm | Flag anomaly → investigate → alert staff → recommend intervention | N/A (system) |
| **Predictive Modeler** | Monthly cycle OR on-demand | Historical data ≥ 6 months | Build forecast → project outcomes → present with confidence intervals | +40 XP |

---

## 14. Playbooks — Dept 11

### 14.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Basic playbooks: all members; Advanced: Operator tier+; Custom: First Class+ |
| **Version Control** | All playbooks versioned — members always see latest version |
| **Completion Tracking** | Playbook progress tracked per member — cannot be reset without member request |
| **Custom Playbooks** | AI-generated playbooks reviewed by staff before delivery |
| **Checklist Enforcement** | Checklist completion gates milestone advancement (configurable per playbook) |
| **Content Updates** | Playbook Updater bot flags outdated content — staff approves updates |

### 14.2 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Playbook Recommender** | Phase transition OR member requests guidance | Journey context available | Analyze situation → match to relevant playbooks → present ranked list | +20 XP |
| **Checklist Enforcer** | Member attempts milestone advancement | Gate playbook assigned to milestone | Verify all checklist items complete → pass/fail → list remaining items | N/A (gate) |
| **Playbook Updater** | Monthly content review cycle | Playbook last updated > 90 days | Scan for outdated content → flag for staff review → log update | N/A (system) |
| **Custom Playbook Generator** | First Class+ member requests custom playbook | Member profile + situation data available | Analyze situation → generate custom guide → staff review → deliver | +75 XP |

---

## 15. Accounting, Follow-Up & Planning — Dept 12

### 15.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | All phases — every member has accounting access from day 1 |
| **Invoice Dispute** | Members can dispute any invoice within 30 days of issue |
| **Payment Data** | Payment methods stored by payment processor — HIRECAR stores only last-4 and type |
| **Auto-Pay** | Auto-pay requires explicit opt-in; can be canceled at any time |
| **Aging Escalation** | Invoices aging > 60 days escalate to Department Lead; > 90 days to Platform Admin |
| **Planning Data** | Personal planning/goals visible only to member + assigned advisor |
| **Budget Data** | Department budgets visible to Department Leads + Platform Admin only |
| **Follow-Up Limits** | Max 1 bot follow-up per day per topic; max 3 per day total |
| **FPI Transparency** | FPI Score breakdown visible to member with explanation for each factor |

### 15.2 Page Workflows

#### Accounting Dashboard
```
TRIGGER: Member navigates to Accounting OR invoice generated
  │
  ▼
Load financial profile
  ├── Display FPI Score with trend line
  ├── Show outstanding invoices (sorted by age)
  ├── Show payment history (last 12 months)
  ├── Show active payment plans and adherence
  ├── Show upcoming due dates
  ├── Show Aging Alert status (green/yellow/red)
  └── Quick actions: Pay Now / Set Up Plan / Dispute / View Detail
```

#### Follow-Up Center
```
TRIGGER: Member navigates OR Follow-Up Responder has pending items
  │
  ▼
Load all pending follow-ups across departments
  ├── Display unified list sorted by priority:
  │     ├── Urgent (deadline within 48hrs) — red
  │     ├── Active (deadline within 7 days) — yellow
  │     └── Scheduled (future) — green
  ├── Each item shows: department, topic, due date, last action, next step
  ├── Member can respond inline: [On track / Need help / Completed]
  ├── Bot routes response to appropriate department
  └── Responding within 24hrs = +40 XP
```

### 15.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Invoice Walkthrough** | Service completion event from any department | Service delivered + billing data available | Present line items interactively → member reviews → approve → send | +30 XP approve, +50 XP pay in 48hrs |
| **Payment Plan Builder** | Outstanding balance > $500 OR member requests plan | Balance exists + member eligible | Present plan options → member selects → set up auto-pay → track | +50 XP/on-time payment, +200 XP plan complete |
| **Billing Clarity Bot** | Member taps "What's this?" on any invoice line item | Invoice data available | Explain charge → link to service record → show authorizing SOW | N/A (informational) |
| **Follow-Up Responder** | Follow-up due date reached | Pending follow-up in queue | Send interactive prompt → route response → queue next action | +40 XP within 24hrs |
| **Budget Health Check** | Quarterly (1st of Jan/Apr/Jul/Oct) | ≥1 quarter of financial data | Review spend → calculate ROI per service → recommend optimizations | +50 XP |
| **Aging Alert Game** | Invoice ages past 30 days | Outstanding balance aging | Issue clearance challenge with deadline → track → award if cleared | +150 XP bonus if cleared in time |
| **Planning Sprint** | Quarterly (start of each quarter) | Member in any phase | Guided goal-setting → build action plan → set milestones → track | +500 XP on quarterly goals met |
| **Financial Snapshot** | Weekly (Monday 8 AM member local time) | ≥1 week of financial activity | Present key numbers as cards → member reviews → drill into any card | +5 XP (streak contribution) |
| **Audit Trail Explorer** | On-demand (member queries billing history) | Billing data exists | Pull audit trail → present visually → explain events | N/A (informational) |

---

## 16. Marketing & Sales — Dept 13

### 16.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Intake phase (lead capture) + Scaling phase (referral programs) |
| **Lead Data** | Lead data governed by privacy policy — opt-in only |
| **Referral Consent** | Referrals require consent from both referrer and referee |
| **Campaign Approval** | All marketing campaigns require Department Lead approval before launch |
| **CAN-SPAM** | All email campaigns comply with CAN-SPAM — unsubscribe honored within 24hrs |
| **Social Media** | All social posts reviewed before publishing — no automated posting without approval |
| **Sales Scripts** | AI-generated scripts are templates — staff must personalize before use |
| **Competitor Data** | Competitor intelligence is for internal use only — never shared with members |

### 16.2 Page Workflows

#### Sales Pipeline Dashboard
```
TRIGGER: Staff navigates to Marketing & Sales
  │
  ▼
Load pipeline data
  ├── Display visual funnel: Lead → Qualified → Contacted → Proposal → Closed
  ├── Show conversion rates between stages
  ├── Show lead scores (AI-generated)
  ├── Filter by source, date, score, assigned rep
  ├── Click lead → view full interaction history
  └── Action buttons: Assign / Contact / Score / Archive
```

#### Lead Intake Portal
```
TRIGGER: New lead form submission (website, referral, campaign)
  │
  ▼
Lead Scoring Engine activates
  ├── Score lead by conversion likelihood (0–100)
  ├── Factors: source quality, form completeness, vehicle ownership, location, urgency
  ├── Route by score:
  │     ├── Score ≥ 80 → Hot lead → immediate assignment + notification
  │     ├── Score 50–79 → Warm → enter nurture sequence
  │     └── Score < 50 → Cool → enter long-term drip
  ├── Create CRM record
  └── Queue Lead Nurture Sequence based on routing
```

### 16.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Lead Scoring Engine** | New lead form submission | Form data received | Score → route → create CRM record → notify assigned rep | N/A (system) |
| **Lead Nurture Sequences** | Lead enters pipeline + not yet qualified | Lead scored + routing determined | Send personalized drip emails based on behavior → track opens/clicks → escalate when engaged | N/A (system) |
| **Sales Script Generator** | Rep requests script for specific lead | Lead profile + CRM data available | Analyze lead profile → generate customized pitch → include objection handling | N/A (staff tool) |
| **Campaign ROI Analyzer** | Campaign end date OR monthly review cycle | Campaign spend + acquisition data | Track spend vs. acquisitions → calculate CAC → recommend optimization | N/A (staff tool) |
| **Referral Match Bot** | Monthly cycle OR member reaches Operator tier+ | Active members with referral eligibility | Identify high-value referral opportunities → prompt members | +300 XP per successful referral |
| **Content Generator** | Campaign creation OR social media scheduling | Brand guidelines + campaign brief | Generate copy → apply brand voice → present for review | N/A (staff tool) |
| **Competitor Intelligence** | Weekly cycle (Friday) | Market data available | Monitor competitor activity → summarize changes → flag threats | N/A (internal) |
| **Conversion Optimizer** | A/B test reaches statistical significance | Test running with sufficient data | Analyze variants → declare winner → recommend implementation | N/A (system) |
| **Client Reactivation Engine** | Member inactive > 45 days | Dormant member identified | Analyze history → create win-back campaign → personalize outreach | N/A (system) |

---

## 17. Membership Services — Dept 14

### 17.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | All phases — every member interacts through Membership Services |
| **Enrollment** | Self-service enrollment; bot-assisted but member makes all tier choices |
| **Tier Changes** | Upgrades immediate; downgrades take effect at renewal date |
| **Cancellation** | 30-day notice required; pro-rated refund for unused months |
| **Data Access** | Member has full access to all their data across all departments via portal |
| **Document Vault** | Encrypted at rest + in transit; member controls sharing permissions |
| **Message Center** | All communications archived; member can download full history |
| **Support SLA** | Standard: 24hr response; Operator: 12hr; First Class: 4hr; Elite: 1hr |
| **Renewal** | Auto-renewal with 30-day advance notice; opt-out available |
| **MSI Transparency** | MSI breakdown visible with explanation for each factor |

### 17.2 Page Workflows

#### Member Portal (Home)
```
TRIGGER: Member logs in
  │
  ▼
Load personalized dashboard
  ├── Display greeting with current tier badge
  ├── Show HIRECAR Composite Score (combined metric)
  ├── Show individual scores: HBI, VDI, BRE, CRI, FPI, MSI
  ├── Show current journey phase with progress to next gate
  ├── Show active services with status
  ├── Show upcoming appointments
  ├── Show pending follow-ups (from Follow-Up Center)
  ├── Show streak status (daily engagement counter)
  ├── Show quest board (active challenges)
  ├── Show recent XP activity feed
  ├── Show next recommended action (from Journey Orchestrator)
  └── Show notification badges for Message Center
```

#### Membership Enrollment
```
TRIGGER: New user clicks "Join HIRECAR" OR lead conversion from Marketing
  │
  ▼
Welcome Journey bot activates
  ├── Step 1: GREET — "Welcome to HIRECAR. I'm your concierge."
  ├── Step 2: Tier Presentation
  │     ├── Display tier comparison cards side-by-side
  │     ├── Highlight: features, pricing, service limits
  │     ├── Bot recommends based on intake quiz (optional)
  │     └── Member selects tier
  ├── Step 3: Profile Setup (interactive conversation)
  │     ├── Personal info → Business info → Vehicle registry
  │     └── Each section = interactive Q&A, not a boring form
  ├── Step 4: First Service Activation
  │     ├── Service Discovery Engine → match services to situation
  │     └── Activate first service
  ├── Step 5: Document Upload (first batch)
  │     ├── Bot suggests most important docs to upload first
  │     └── Links to Document Vault Quest for gamified completion
  ├── Step 6: Schedule First Appointment
  │     ├── Appointment Game → book across relevant departments
  │     └── Calendar integration offered
  ├── Step 7: REWARD
  │     ├── +50 XP per step completed (250 total)
  │     ├── +100 XP bonus for completing all 5 steps
  │     ├── Onboarded badge awarded
  │     └── MSI baseline established
  └── Step 8: NEXT — Route to first active department based on situation
```

#### Document Vault
```
TRIGGER: Member navigates to vault OR Document Vault Quest active
  │
  ▼
Document Vault Quest bot activates
  ├── Show vault completion percentage with visual progress bar
  ├── List all document categories with status:
  │     ├── ✅ Uploaded (with date)
  │     ├── ⏳ Requested (pending from provider)
  │     └── ❌ Missing (with explanation of what's needed)
  ├── Each missing doc = mini-quest:
  │     ├── Bot explains why it matters
  │     ├── Bot explains how to obtain it
  │     ├── For First Class+ → "Want me to request it from your provider?"
  │     └── Upload interface
  ├── Each upload = +25 XP + vault % increase
  ├── 100% completion = +200 XP + Vault Master badge
  └── Documents are categorized by department + vehicle
```

#### Support & Help Desk
```
TRIGGER: Member clicks "Help" or "Support" from any page
  │
  ▼
Support Concierge bot activates
  ├── Step 1: Conversational triage
  │     ├── "What do you need help with today?"
  │     └── Category selection: Billing / Services / Technical / Account / Other
  ├── Step 2: Bot attempts resolution
  │     ├── Search FAQ knowledge base
  │     ├── Check member's recent activity for context
  │     ├── Provide answer or guided fix
  │     └── If resolved → +10 XP for rating the experience
  ├── Step 3: If bot can't resolve
  │     ├── Create support ticket with full context pre-loaded
  │     ├── Route to appropriate department based on category
  │     ├── Assign based on tier SLA:
  │     │     ├── Standard → general queue (24hr)
  │     │     ├── Operator → priority queue (12hr)
  │     │     ├── First Class → concierge queue (4hr)
  │     │     └── Elite → direct line (1hr)
  │     └── Member receives ticket number + estimated response time
  └── Step 4: Follow-up
        ├── Bot checks in after resolution: "Was your issue resolved?"
        └── Satisfaction rating contributes to MSI
```

### 17.3 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Welcome Journey** | New member enrollment | First-time member | 5-step onboarding quest → profile → service → docs → appointment | +350 XP total |
| **Service Discovery Engine** | Onboarding OR member requests OR phase transition | Member profile available | Interactive quiz → match services → rank by impact → present | +30 XP quiz, +75 XP activation |
| **Appointment Game** | Monthly cycle (1st of month) OR member navigates to scheduling | ≥1 service requiring appointment | Present services needing attention → schedule → track attendance | +100 XP for booking all |
| **Document Vault Quest** | Onboarding OR vault < 100% + weekly reminder | Documents missing | Show progress → list missing → explain each → track uploads | +25 XP/upload, +200 XP at 100% |
| **Support Concierge** | Member clicks "Help" from any page | Active membership | Triage → attempt resolution → escalate if needed → follow up | +10 XP for rating |
| **Engagement Pulse** | Daily check (member's first daily login) | Active membership | Display streak → show weekly accomplishments → incentivize engagement | +5 XP/day, +100 XP/7-day streak |
| **Tier Progression Coach** | Member reaches 80% of next tier threshold OR requests | XP data available | Calculate gap → recommend fastest XP actions → queue workflows | +500 XP on tier advance |
| **Cross-Department Navigator** | Department workflow completes + next dept workflow queued | Cross-department handoff needed | Bridge context → explain next phase → get member confirmation → route | N/A (routing) |
| **Monthly Recap & Rewards** | Last day of each month | ≥1 month of activity | Present achievements → score changes → badges → progress → next goals | +20 XP for reviewing |
| **Renewal & Upgrade Advisor** | 30 days before membership renewal date | Approaching renewal | Value review → usage summary → ROI → tier comparison → renew/upgrade | +100 XP renew, +300 XP upgrade |

---

## 18. HIRECAR HQ — Dept 15

### 18.1 Governing Rights

| Right | Rule |
|-------|------|
| **Access** | Supplier Portal: registered suppliers only. Buyer Side: HIRECAR staff only |
| **Supplier Onboarding** | All suppliers must pass vetting bot + submit required documentation |
| **Listing Approval** | Service listings reviewed by HQ staff before going live |
| **Bid Transparency** | Suppliers see only their own bids — never competitor bids |
| **SLA Enforcement** | SLA violations auto-documented; 3 violations in 90 days → supplier review |
| **Payment Terms** | Net-30 payment terms standard; expedited for top-tier suppliers |
| **Dispute Resolution** | HQ mediates all supplier-member disputes; binding resolution within 14 days |
| **Data Isolation** | Supplier data isolated — suppliers cannot see other suppliers' data or member PII |
| **Rate Cards** | Rate cards are negotiated per supplier; no public rate disclosure |
| **Compliance** | Suppliers must maintain active licenses, insurance, certifications — auto-monitored |
| **Capacity Data** | Supplier capacity is self-reported; HQ verifies through fulfillment tracking |

### 18.2 Page Workflows — Supplier Side

#### Supplier Portal (Onboarding)
```
TRIGGER: New supplier registration submission
  │
  ▼
Supplier Onboarding Assistant bot activates
  ├── Step 1: GREET — "Welcome to the HIRECAR supplier network"
  ├── Step 2: GUIDE — Conversational profile setup:
  │     ├── Business info (name, type, location, coverage area)
  │     ├── Service types offered (tow, body shop, credit, insurance, EV, etc.)
  │     ├── Capacity (daily volume, hours of operation, response time commitment)
  │     └── Pricing (base rates, surcharges, payment preferences)
  ├── Step 3: Documentation upload:
  │     ├── Business license
  │     ├── Insurance certificate
  │     ├── Professional certifications
  │     └── References (optional)
  ├── Step 4: Vetting Bot runs credential check
  │     ├── Verify license validity
  │     ├── Check insurance coverage adequacy
  │     ├── Flag any red flags
  │     └── Score supplier readiness (0–100)
  ├── Step 5: If readiness ≥ 70 → submit for HQ staff review
  │     └── If < 70 → provide improvement list before resubmission
  ├── Step 6: HQ staff approves/rejects with feedback
  └── Step 7: Approved → supplier portal access granted, listings enabled
```

#### Service Listing Manager
```
TRIGGER: Approved supplier creates/edits service listing
  │
  ▼
Validate listing data
  ├── Service type, description, coverage area, pricing, availability
  ├── Check compliance: required certifications for service type?
  ├── Submit for HQ review
  │     ├── Approved → listing goes live in Supplier Directory
  │     └── Rejected → feedback provided, supplier can revise
  └── Listing visible in Supplier Directory for HIRECAR procurement
```

### 18.3 Page Workflows — Buyer Side (HIRECAR Procurement)

#### Service Fulfillment Tracker
```
TRIGGER: Member service request created by any department
  │
  ▼
Service Matcher bot activates
  ├── Step 1: Parse service request (type, location, urgency, member tier)
  ├── Step 2: Query Supplier Directory:
  │     ├── Filter by service type + coverage area
  │     ├── Score by: quality rating, response time, cost, capacity
  │     ├── Rank top 3 matches
  │     └── For time-sensitive (roadside, towing) → Auto-Dispatch Engine
  ├── Step 3: Assign supplier
  │     ├── Auto-assign if urgency = critical
  │     └── HQ staff review if urgency = standard
  ├── Step 4: Notify supplier via Supplier Communication Center
  ├── Step 5: Track fulfillment:
  │     ├── Supplier accepts → ETA provided → member notified
  │     ├── Supplier declines → next-best match auto-assigned
  │     ├── In progress → status updates pushed to member
  │     └── Complete → member prompted to rate service
  ├── Step 6: Quality Assurance
  │     ├── Member rating + SLA compliance → update Vendor Scorecard
  │     └── If rating < 3/5 → trigger Dispute Resolution Bot
  └── Step 7: Payout processed → logged in Payout Center
```

### 18.4 Bot Trigger Conditions

| Bot | Trigger | Condition | Workflow | XP |
|-----|---------|-----------|----------|-----|
| **Supplier Vetting Bot** | New supplier application submitted | Application data + documents uploaded | Credential check → risk assessment → readiness score → route for review | N/A (supplier-facing) |
| **Compliance Monitor** | Daily scan at 6 AM | All active suppliers | Check license/cert expiration dates → flag ≤ 30 days → auto-send renewal reminders | N/A (system) |
| **Performance Analyzer** | Monthly cycle (1st of month) | Fulfillment data available | Score suppliers → rank → flag underperformers → recommend actions | N/A (system) |
| **Supplier Onboarding Assistant** | New supplier registration | First-time supplier | Guided setup → doc upload → vetting → submit for review | N/A (supplier-facing) |
| **Service Matcher** | Service request created by any department | Member need + supplier inventory | Match → rank → assign → notify | N/A (system) |
| **Auto-Dispatch Engine** | Time-sensitive service request (roadside, towing) | Urgency = critical + location available | Immediate match → auto-assign → dispatch → track | N/A (system) |
| **Fulfillment Monitor** | Service assigned to supplier | Active fulfillment in progress | Track real-time → flag delays (> SLA) → escalate if needed | N/A (system) |
| **Cost Optimizer** | Quarterly review cycle | ≥1 quarter of procurement data | Analyze spend → identify savings → recommend supplier switches | N/A (staff tool) |
| **Demand Forecaster** | Monthly cycle | ≥6 months of demand data | Predict demand by type/region → inform capacity planning | N/A (system) |
| **SLA Enforcer** | Fulfillment event deviates from SLA | SLA defined + deviation detected | Document violation → notify supplier → if 3 in 90 days → trigger review | N/A (system) |
| **Dispute Resolution Bot** | Member rating < 3/5 OR explicit dispute filed | Dispute data available | Mediate → collect both sides → propose resolution → enforce if agreed | N/A (system) |
| **Rate Negotiator Assistant** | Contract renewal approaching (60 days out) | Historical data + market benchmarks | Prepare negotiation brief → benchmark rates → recommend position | N/A (staff tool) |
| **Supply Gap Detector** | Monthly analysis | Coverage data by type/region | Identify thin coverage areas → recommend supplier recruitment targets | N/A (system) |
| **Audit Bot** | Quarterly OR on-demand | Supplier records available | Audit docs/insurance/certs → flag issues → generate audit report | N/A (system) |

---

## 19. Cross-Department Handoff Rules

### 19.1 Handoff Protocol

Every cross-department handoff follows this protocol:

```
DEPARTMENT A (Source)                    DEPARTMENT B (Target)
──────────────────                      ──────────────────
Bot completes workflow
  │
  ├── Checks: Is there a next-best action in another dept?
  │
  ├── YES → Cross-Department Navigator activates
  │     │
  │     ├── Package context:
  │     │     • Member ID
  │     │     • Source department
  │     │     • Completed workflow
  │     │     • Relevant scores
  │     │     • Documents generated
  │     │     • XP earned this session
  │     │
  │     ├── Present to member:
  │     │     "Your [task] is complete.
  │     │      Next recommended step:
  │     │      [Dept B action]. Ready?"
  │     │
  │     ├── Member confirms ──────────▶ Dept B bot receives context
  │     │                                  │
  │     │                                  ├── GREET (with context)
  │     │                                  ├── Skip redundant intake
  │     │                                  ├── Reference prior work
  │     │                                  └── Continue journey
  │     │
  │     └── Member declines → log,
  │         queue for future nudge
  │
  └── NO → Recommend general next steps
```

### 19.2 Common Handoff Paths

| From → To | Trigger | Context Carried |
|-----------|---------|-----------------|
| Claims → PIFR | Claim filed + recovery need identified | Incident details, party info, coverage data |
| Claims → Credit | Claim closed + credit impact detected | Claim outcome, financial exposure, timeline |
| PIFR → Credit | Recovery complete + collections activity found | Recovery packet, admin failures, collections list |
| Credit → Operator Standards | CRI ≥ 60 + Phase 3 gate passed | Credit status, dispute history, tradeline strategy |
| Operator Standards → Funding | HBI ≥ 75 + BRE ≥ 70 + Phase 4 gate passed | Compliance status, scores, business readiness |
| Roadside → Claims | Roadside event reveals collision damage | Service record, photos, provider notes |
| Any Dept → Accounting | Service completed + billing needed | Service details, SOW reference, pricing |
| Any Dept → Membership Services | Member needs support or has general question | Current workflow context, member state |
| Marketing → Membership Services | Lead converts to member | Lead data, scoring, source, initial interest |

### 19.3 Handoff Governance Rules

| Rule | Description |
|------|-------------|
| **Consent Required** | Member must confirm before handoff proceeds |
| **Context Completeness** | All relevant data must transfer — no data loss at boundary |
| **No Repeat Intake** | If data was already collected in Dept A, Dept B must not re-collect it |
| **Score Continuity** | XP, scores, and streak status carry across handoffs |
| **Audit Trail** | Every handoff logged: timestamp, source dept, target dept, member consent |
| **Fallback** | If target department's bot is unavailable, queue the handoff and notify staff |
| **Priority** | Handoffs to Recovery-phase departments take priority over Scaling-phase ones |

---

## 20. Bot Delegation Model — Master Trigger Map

### 20.1 Bot Lifecycle

Every bot operates on this lifecycle:

```
DORMANT ──▶ TRIGGERED ──▶ ACTIVE ──▶ COMPLETE ──▶ DORMANT
  │              │            │           │
  │              │            │           └── Log results
  │              │            │               Update scores
  │              │            │               Award XP
  │              │            │               Check for next trigger
  │              │            │
  │              │            └── GREET → GUIDE → ACT → REWARD → NEXT
  │              │                 (Interactive loop with member)
  │              │
  │              └── Trigger condition met:
  │                   • Event-driven (doc upload, phase change, score update)
  │                   • Time-driven (daily, weekly, monthly, quarterly)
  │                   • Member-initiated (navigates to page, clicks button)
  │                   • Alert-driven (deadline approaching, anomaly detected)
  │
  └── Waiting for trigger condition
```

### 20.2 Master Bot Registry

| # | Bot Name | Department | Trigger Type | Trigger Condition | Member-Facing? |
|---|----------|-----------|--------------|-------------------|----------------|
| 1 | Welcome Journey | Membership | Event | New enrollment | Yes |
| 2 | Service Discovery Engine | Membership | Event + On-demand | Onboarding / phase change / request | Yes |
| 3 | Appointment Game | Membership | Time + On-demand | Monthly 1st / member navigates | Yes |
| 4 | Document Vault Quest | Membership | Event + Time | Onboarding + weekly if < 100% | Yes |
| 5 | Support Concierge | Membership | On-demand | Member clicks Help | Yes |
| 6 | Engagement Pulse | Membership | Time | Daily (first login) | Yes |
| 7 | Tier Progression Coach | Membership | Event | XP reaches 80% of next tier | Yes |
| 8 | Cross-Department Navigator | Membership | Event | Dept workflow complete + handoff needed | Yes |
| 9 | Monthly Recap & Rewards | Membership | Time | Last day of month | Yes |
| 10 | Renewal & Upgrade Advisor | Membership | Time | 30 days before renewal | Yes |
| 11 | Credit Intake Wizard | HIRECREDIT | Event | Phase 3 entry / manual start | Yes |
| 12 | Dispute Builder | HIRECREDIT | Event + On-demand | Member initiates / bot recommends | Yes |
| 13 | Tradeline Strategy Coach | HIRECREDIT | Event | Credit intake complete / CRI < 50 | Yes |
| 14 | Collections Shield | HIRECREDIT | Alert | New collection detected (daily scan) | Yes |
| 15 | CreditWithKen Session Prep | HIRECREDIT | Time | 24hrs before scheduled session | Yes |
| 16 | Score Projection Simulator | HIRECREDIT | On-demand | Member navigates / bot recommends | Yes |
| 17 | Weekly Credit Challenge | HIRECREDIT | Time | Every Monday 9 AM | Yes |
| 18 | Claims Intake Bot | Collision | Event | Incident reported | Yes |
| 19 | Multi-Party Liability Analyzer | Collision | Event | Claims intake complete + ≥2 parties | Yes |
| 20 | Claims Status Monitor | Collision | Time + Alert | Claim open > 14 days without update | Yes |
| 21 | Collision-to-Credit Impact Predictor | Collision | Event | Claim filed + credit profile exists | Yes |
| 22 | PIFR Tier Recommender | Recovery | Event | Recovery initiated / collision bot flags | Yes |
| 23 | Recovery Packet Generator | Recovery | Event | Tier selected + SOW signed | Yes |
| 24 | Admin Failure Pattern Detector | Recovery | Event | Admin failure claims in packet | Yes |
| 25 | Custody Log Auditor | Recovery | Event | ≥2 custody transfers entered | Yes |
| 26 | SOW Generator | Recovery | Event | Tier selected | Yes |
| 27 | Audit Report Builder | Recovery | Event + On-demand | Recovery complete / on-demand | Yes |
| 28 | HBI Live Scorer | Operator Standards | Event | Phase 4 entry + behavioral events | Yes |
| 29 | BRE Compliance Walkthrough | Operator Standards | Time + On-demand | Quarterly cycle / member initiates | Yes |
| 30 | VDI Document Challenge | Operator Standards | Event + Time | Vehicle added / weekly challenge | Yes |
| 31 | Revenue Lane Navigator | Operator Standards | Event | Phase 4 entry / mixed lane signals | Yes |
| 32 | Cure Window Coach | Operator Standards | Alert | Cure window opened / deadline 14/7/3/1 days | Yes |
| 33 | Vendor Audit Game | Operator Standards | Time | 14 days before audit | Yes |
| 34 | Monthly Operations Quest | Operator Standards | Time | 1st of each month | Yes |
| 35 | Policy Recommender | Insurance | Event | Phase 2 + insurance review flagged | Yes |
| 36 | Claims-to-Collections Predictor | Insurance | Alert | Claim aging > 60 days | Yes |
| 37 | Billing Fog Analyzer | Insurance | Event | Statement uploaded / confusion flagged | Yes |
| 38 | Coverage Gap Detector | Insurance | Event | Policy + vehicle data available | Yes |
| 39 | Application Pre-Qualifier | Funding | On-demand | Member initiates funding app | Yes |
| 40 | Funding Match Engine | Funding | Event | Pre-qualification ≥ 60% | Yes |
| 41 | Fleet ROI Modeler | Funding | Event | Funding type = fleet expansion | Yes |
| 42 | Document Prep Bot (Funding) | Funding | Event | Application past pre-qual | Yes |
| 43 | Approval Pathway Advisor | Funding | Event | Application submitted | Yes |
| 44 | Dynamic Pricing Engine | Mobility | Time | Hourly recalculation | No (system) |
| 45 | Fleet Utilization Optimizer | Mobility | Time | Daily 6 AM | No (system) |
| 46 | Booking Concierge | Mobility | On-demand | Member initiates booking | Yes |
| 47 | Driver Match Bot | Mobility | On-demand | Chauffeur service requested | Yes |
| 48 | Emergency Dispatch Bot | Roadside | Alert | Emergency request | Yes |
| 49 | ETA Predictor | Roadside | Event | Dispatch confirmed | Yes |
| 50 | Preventive Maintenance Advisor | Roadside | Alert | Service gap > 6 months | Yes |
| 51 | Service Provider Matcher | Roadside | On-demand | Non-emergency request | Yes |
| 52 | Content Scheduler | Entertainment | Time | Content queued | No (system) |
| 53 | Community Engagement Bot | Entertainment | Event | New submission | Yes |
| 54 | Event Promotion Engine | Entertainment | Time | 30 days before event | No (system) |
| 55 | Report Generator | MW Intelligence | On-demand + Time | Member requests / scheduled | Yes |
| 56 | Trend Analyzer | MW Intelligence | Time | Weekly Monday 8 AM | No (system) |
| 57 | Anomaly Detector | MW Intelligence | Alert | Metrics outside 2σ | No (system) |
| 58 | Predictive Modeler | MW Intelligence | Time + On-demand | Monthly / on-demand | Yes |
| 59 | Playbook Recommender | Playbooks | Event | Phase transition / member request | Yes |
| 60 | Checklist Enforcer | Playbooks | Event | Milestone advancement attempt | No (gate) |
| 61 | Playbook Updater | Playbooks | Time | Monthly content review | No (system) |
| 62 | Custom Playbook Generator | Playbooks | On-demand | First Class+ request | Yes |
| 63 | Invoice Walkthrough | Accounting | Event | Service completion | Yes |
| 64 | Payment Plan Builder | Accounting | Event + On-demand | Balance > $500 / member requests | Yes |
| 65 | Billing Clarity Bot | Accounting | On-demand | Member taps "What's this?" | Yes |
| 66 | Follow-Up Responder | Accounting | Time | Follow-up due date reached | Yes |
| 67 | Budget Health Check | Accounting | Time | Quarterly 1st | Yes |
| 68 | Aging Alert Game | Accounting | Alert | Invoice aging > 30 days | Yes |
| 69 | Planning Sprint | Accounting | Time | Quarterly start | Yes |
| 70 | Financial Snapshot | Accounting | Time | Weekly Monday 8 AM | Yes |
| 71 | Audit Trail Explorer | Accounting | On-demand | Member queries history | Yes |
| 72 | Lead Scoring Engine | Marketing | Event | New lead form submission | No (system) |
| 73 | Lead Nurture Sequences | Marketing | Event | Lead enters pipeline | No (system) |
| 74 | Sales Script Generator | Marketing | On-demand | Rep requests script | No (staff tool) |
| 75 | Campaign ROI Analyzer | Marketing | Time + Event | Campaign end / monthly review | No (staff tool) |
| 76 | Referral Match Bot | Marketing | Time | Monthly cycle | Yes |
| 77 | Content Generator (Marketing) | Marketing | On-demand | Campaign creation | No (staff tool) |
| 78 | Competitor Intelligence | Marketing | Time | Weekly Friday | No (internal) |
| 79 | Conversion Optimizer | Marketing | Event | A/B test reaches significance | No (system) |
| 80 | Client Reactivation Engine | Marketing | Alert | Member inactive > 45 days | No (system) |
| 81 | Milestone Evaluator | Journey | Event | Gate-relevant metric changes | No (system) |
| 82 | Department Router | Journey | Event | Phase transition | No (system) |
| 83 | Journey Orchestrator | Journey | Event | Cross-department handoff needed | No (system) |
| 84 | Progress Reporter | Journey | Time + On-demand | Weekly / member request | Yes |
| 85 | Bottleneck Detector | Journey | Alert | Member stalls > 30 days | No (system) |
| 86 | Completion Predictor | Journey | Event + Time | Phase entry / monthly | Yes |
| 87 | Supplier Vetting Bot | HQ | Event | New supplier application | No (supplier) |
| 88 | Compliance Monitor (HQ) | HQ | Time | Daily 6 AM | No (system) |
| 89 | Performance Analyzer (HQ) | HQ | Time | Monthly 1st | No (system) |
| 90 | Supplier Onboarding Assistant | HQ | Event | New supplier registration | No (supplier) |
| 91 | Service Matcher | HQ | Event | Service request created | No (system) |
| 92 | Auto-Dispatch Engine | HQ | Alert | Critical urgency request | No (system) |
| 93 | Fulfillment Monitor | HQ | Event | Service assigned | No (system) |
| 94 | Cost Optimizer | HQ | Time | Quarterly | No (staff tool) |
| 95 | Demand Forecaster | HQ | Time | Monthly | No (system) |
| 96 | SLA Enforcer | HQ | Alert | SLA deviation detected | No (system) |
| 97 | Dispute Resolution Bot | HQ | Event | Rating < 3/5 / dispute filed | No (system) |
| 98 | Rate Negotiator Assistant | HQ | Time | 60 days before contract renewal | No (staff tool) |
| 99 | Supply Gap Detector | HQ | Time | Monthly analysis | No (system) |
| 100 | Audit Bot (HQ) | HQ | Time + On-demand | Quarterly / on-demand | No (system) |

### 20.3 Summary Statistics

```
TOTAL BOTS:                    100
├── Member-Facing (Interactive): 62
├── System (Background):         24
├── Staff Tools:                   8
├── Supplier-Facing:               2
└── Gate (Enforcement):            4 (Checklist Enforcer + 3 gate checks)

TRIGGER TYPES:
├── Event-Driven:               42
├── Time-Driven:                28
├── On-Demand (Member):         16
├── Alert-Driven:               10
└── Hybrid (Multiple):           4

DEPARTMENTS BY BOT COUNT:
├── Membership Services:        10
├── HIRECREDIT:                  7
├── Operator Standards:          7
├── Accounting:                  9
├── HQ:                         14
├── Recovery + PIFR:             6
├── Marketing & Sales:           9
├── Journey System:              6
├── Collision + Claims:          4
├── MW Intelligence:             4
├── Insurance:                   4
├── Funding:                     5
├── Playbooks:                   4
├── Mobility + Rentals:          4
├── Roadside:                    4
└── Entertainment:               3
```

---

## Appendix A: Page-to-Bot Mapping Quick Reference

| Page | Primary Bot(s) | Secondary Bot(s) |
|------|---------------|-------------------|
| Member Portal | Engagement Pulse, Tier Progression Coach | Monthly Recap, Cross-Dept Navigator |
| Membership Enrollment | Welcome Journey | Service Discovery Engine |
| HIRECREDIT Dashboard | Credit Intake Wizard | Score Projection Simulator, Weekly Challenge |
| Credit Dispute Center | Dispute Builder | Tradeline Strategy Coach |
| Collections Hub | Collections Shield | Collision-to-Credit Predictor |
| CreditWithKen Portal | Session Prep | Score Projection Simulator |
| LA Collision Dashboard | — (data display) | Trend Analyzer |
| Multi-Party Claims | Claims Intake Bot | Liability Analyzer, Status Monitor |
| PIFR Intake Portal | PIFR Tier Recommender | SOW Generator |
| Recovery Packet Builder | Recovery Packet Generator | Admin Failure Detector, Custody Auditor |
| HBI Score Dashboard | HBI Live Scorer | Revenue Lane Navigator |
| BRE Compliance Center | BRE Compliance Walkthrough | Cure Window Coach |
| VDI Tracker | VDI Document Challenge | — |
| Policy Comparison | Policy Recommender | Coverage Gap Detector |
| SeedXchange Portal | Application Pre-Qualifier | Funding Match, Document Prep |
| Fleet Dashboard | Booking Concierge | Dynamic Pricing, Fleet Optimizer |
| Emergency Portal | Emergency Dispatch | ETA Predictor |
| Intelligence Dashboard | Report Generator | Anomaly Detector, Predictive Modeler |
| Playbook Library | Playbook Recommender | Custom Playbook Generator |
| Accounting Dashboard | Invoice Walkthrough | Aging Alert Game, Financial Snapshot |
| Follow-Up Center | Follow-Up Responder | Planning Sprint |
| Sales Pipeline | Lead Scoring Engine | Lead Nurture, Conversion Optimizer |
| Supplier Portal | Supplier Onboarding | Supplier Vetting, Compliance Monitor |
| Procurement Dashboard | Service Matcher | Fulfillment Monitor, Cost Optimizer |
| Document Vault | Document Vault Quest | — |
| Support & Help Desk | Support Concierge | — |
| Journey Map Dashboard | Milestone Evaluator | Bottleneck Detector, Progress Reporter |

---

*End of Governing Rights & Workflow Document*
*HIRECAR MarketWatch — v1.0 — March 3, 2026*
