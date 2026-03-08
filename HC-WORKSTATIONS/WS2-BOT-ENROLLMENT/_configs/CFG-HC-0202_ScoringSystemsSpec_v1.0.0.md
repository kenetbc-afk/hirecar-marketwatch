---
document_id: HC-CFG-012-A
title: HIRECAR Scoring Systems — Calculation Specifications
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS2 Bot Building
workstation: WS2-BOT-ENROLLMENT
---

# HIRECAR Scoring Systems — Calculation Specifications

## 1. Score System Overview

HIRECAR uses 6 proprietary scoring systems to assess client health across different dimensions. The HBI (HIRECAR Business Index) is the composite master score; the other 5 are component indices.

| Score | Full Name | Range | Calculated On | Update Frequency | Weight in HBI |
|-------|-----------|-------|---------------|------------------|---------------|
| **HBI** | HIRECAR Business Index | 0–1000 | Enrollment | Monthly | — (composite) |
| **VDI** | Vehicle Dependency Index | 0–100 | Enrollment | Quarterly | 15% |
| **BRE** | Business Readiness Evaluation | 0–100 | Enrollment | Monthly | 25% |
| **CRI** | Credit Repair Index | 0–100 | Enrollment | Monthly | 30% |
| **FPI** | Financial Progress Index | 0–100 | Enrollment | Monthly | 20% |
| **MSI** | Membership Stability Index | 0–100 | Post-enrollment | Weekly | 10% |

---

## 2. HBI — HIRECAR Business Index (0–1000)

### Purpose
Master composite score reflecting overall client health and business readiness within the HIRECAR ecosystem.

### Calculation

```
HBI = round(
  (CRI × 0.30 + BRE × 0.25 + FPI × 0.20 + VDI × 0.15 + MSI × 0.10) × 10
)
```

Each component score is 0–100, so the weighted sum is 0–100, multiplied by 10 to give 0–1000.

### Rating Tiers

| HBI Range | Rating | Display Color |
|-----------|--------|---------------|
| 800–1000 | Excellent | #34d399 (green) |
| 600–799 | Good | #60a5fa (blue) |
| 400–599 | Fair | #fbbf24 (amber) |
| 200–399 | Needs Work | #fb923c (orange) |
| 0–199 | Critical | #f87171 (red) |

### Initial Enrollment Value
At enrollment, MSI defaults to 50 (neutral), so initial HBI uses: `CRI×0.30 + BRE×0.25 + FPI×0.20 + VDI×0.15 + 50×0.10 = weighted × 10`

---

## 3. VDI — Vehicle Dependency Index (0–100)

### Purpose
Measures the client's reliance on personal/commercial vehicles for income generation and daily operations.

### Input Factors

| Factor | Source | Weight |
|--------|--------|--------|
| Vehicle ownership status | Enrollment form | 20% |
| Auto loan current/delinquent | Credit report | 25% |
| Vehicle age & value | Enrollment form | 15% |
| Transportation alternatives | Enrollment form | 10% |
| Commercial use (rideshare, delivery) | Enrollment form | 20% |
| Insurance status | Enrollment form | 10% |

### Scoring Logic

```
vdi_raw = (
  vehicle_ownership_score × 0.20 +
  auto_loan_score × 0.25 +
  vehicle_condition_score × 0.15 +
  alt_transport_score × 0.10 +
  commercial_use_score × 0.20 +
  insurance_score × 0.10
)

VDI = round(vdi_raw)
```

**Factor Scoring:**

- **vehicle_ownership_score**: Owned outright = 90, Financed current = 70, Financed delinquent = 30, Leased = 60, No vehicle = 10
- **auto_loan_score**: No auto debt = 95, Current (0 late) = 80, 1–2 lates = 50, 3+ lates = 20, Repo/charge-off = 5
- **vehicle_condition_score**: < 3 years old = 85, 3–7 years = 70, 7–12 years = 50, > 12 years = 30
- **alt_transport_score**: Multiple options = 80, Public transit available = 60, Limited = 40, None = 20
- **commercial_use_score**: Active commercial driver = 90, Part-time gig = 70, Personal only = 50, Not applicable = 30
- **insurance_score**: Full coverage = 90, Liability only = 60, Lapsed = 20, None = 5

### Update Trigger
Quarterly recalculation, or on: auto loan status change, vehicle acquisition/disposal, insurance change.

---

## 4. BRE — Business Readiness Evaluation (0–100)

### Purpose
Assesses the client's readiness to start or scale a business using HIRECAR strategies.

### Input Factors

| Factor | Source | Weight |
|--------|--------|--------|
| Business entity status | Enrollment form | 20% |
| EIN / tax registration | Enrollment form | 15% |
| Business credit profile | Credit report | 20% |
| Revenue/income stability | Enrollment form | 20% |
| Industry experience | Enrollment form | 10% |
| Business plan status | Enrollment form | 15% |

### Scoring Logic

```
BRE = round(
  entity_score × 0.20 +
  tax_score × 0.15 +
  biz_credit_score × 0.20 +
  income_score × 0.20 +
  experience_score × 0.10 +
  plan_score × 0.15
)
```

**Factor Scoring:**

- **entity_score**: LLC/Corp active = 90, Sole prop registered = 60, Informal/no entity = 20
- **tax_score**: EIN + current filings = 90, EIN only = 60, SSN only = 30
- **biz_credit_score**: D&B 80+ = 90, D&B 50–79 = 65, No business credit file = 30, Derogatory = 10
- **income_score**: Stable $5K+/mo = 90, $3K–5K = 70, $1K–3K = 45, < $1K = 20
- **experience_score**: 5+ years = 90, 2–5 years = 70, 1–2 years = 50, < 1 year = 30
- **plan_score**: Written plan with projections = 90, Basic plan = 60, Concept only = 30, None = 10

---

## 5. CRI — Credit Repair Index (0–100)

### Purpose
Tracks credit repair progress — the primary metric for dispute clients. Directly tied to credit score movement and negative item resolution.

### Input Factors

| Factor | Source | Weight |
|--------|--------|--------|
| Current credit score (mapped) | Credit report | 30% |
| Negative items count | Credit report | 25% |
| Score improvement since enrollment | Calculated | 20% |
| Dispute resolution rate | Tracking | 15% |
| Utilization ratio | Credit report | 10% |

### Scoring Logic

```
CRI = round(
  score_mapped × 0.30 +
  negative_items_score × 0.25 +
  improvement_score × 0.20 +
  resolution_score × 0.15 +
  utilization_score × 0.10
)
```

**Factor Scoring:**

- **score_mapped** (from Score_Range at enrollment):
  - 800–850 → 95
  - 740–799 → 80
  - 670–739 → 60
  - 580–669 → 40
  - 300–579 → 15

- **negative_items_score**: 0 items = 100, 1–2 items = 70, 3–5 items = 45, 6–10 items = 25, 10+ = 10
- **improvement_score**: +100 pts = 100, +50 pts = 75, +25 pts = 55, 0 pts = 35, Declined = 10
- **resolution_score**: 100% resolved = 100, 75%+ = 80, 50%+ = 55, 25%+ = 35, < 25% = 15
- **utilization_score**: < 10% = 95, 10–29% = 80, 30–49% = 55, 50–74% = 30, 75%+ = 10

### Initial Value (at enrollment)
Only score_mapped, negative_items_score, and utilization_score are available. improvement_score = 35 (baseline), resolution_score = 15 (no activity yet).

---

## 6. FPI — Financial Progress Index (0–100)

### Purpose
Measures financial health improvement trajectory — savings, debt reduction, and income growth.

### Input Factors

| Factor | Source | Weight |
|--------|--------|--------|
| Debt-to-income ratio | Enrollment form | 25% |
| Savings/emergency fund | Enrollment form | 20% |
| Income trend | Tracking | 20% |
| Bill payment consistency | Credit report | 20% |
| Financial literacy engagement | Playbook tracking | 15% |

### Scoring Logic

```
FPI = round(
  dti_score × 0.25 +
  savings_score × 0.20 +
  income_trend_score × 0.20 +
  payment_score × 0.20 +
  literacy_score × 0.15
)
```

**Factor Scoring:**

- **dti_score**: < 20% = 95, 20–35% = 75, 36–49% = 50, 50–65% = 30, > 65% = 10
- **savings_score**: 6+ months expenses = 95, 3–6 months = 75, 1–3 months = 50, < 1 month = 25, None = 10
- **income_trend_score**: Growing 10%+ = 90, Stable = 65, Declining < 10% = 40, Declining 10%+ = 15
- **payment_score**: 0 lates in 12mo = 95, 1 late = 75, 2–3 lates = 50, 4+ lates = 20
- **literacy_score**: Completed playbook = 90, 50%+ completed = 65, Started = 40, Not started = 15

---

## 7. MSI — Membership Stability Index (0–100)

### Purpose
Tracks engagement and retention risk. Calculated post-enrollment and updated weekly.

### Input Factors

| Factor | Source | Weight |
|--------|--------|--------|
| Login frequency | Portal analytics | 20% |
| Playbook engagement | Bit.ai tracking | 25% |
| Pass interaction | PassKit analytics | 15% |
| Communication responsiveness | SMS/email tracking | 20% |
| Payment status | Billing system | 20% |

### Scoring Logic

```
MSI = round(
  login_score × 0.20 +
  playbook_score × 0.25 +
  pass_score × 0.15 +
  comm_score × 0.20 +
  payment_score × 0.20
)
```

**Factor Scoring:**

- **login_score**: 5+/week = 95, 2–4/week = 75, 1/week = 55, 1/month = 30, Inactive > 30 days = 10
- **playbook_score**: 100% sections viewed = 95, 75%+ = 80, 50%+ = 60, 25%+ = 40, < 25% = 15
- **pass_score**: Used this week = 90, Used this month = 70, Used > 30 days ago = 40, Never used = 15
- **comm_score**: Responds < 24hr = 90, Responds < 72hr = 65, Responds > 72hr = 35, No response = 10
- **payment_score**: Current = 95, 1 late = 60, 2+ lates = 25, Suspended = 5

### Initial Value
At enrollment, MSI defaults to 50 (neutral baseline) until sufficient engagement data is collected (minimum 7 days).

---

## 8. Zoho CRM Field Mapping

All scores are stored in the HC_Enrollment custom module:

| Zoho Field | API Name | Score | Type |
|------------|----------|-------|------|
| HBI Score | HBI_Score | HBI | Number (0–1000) |
| VDI Score | VDI_Score | VDI | Number (0–100) |
| BRE Score | BRE_Score | BRE | Number (0–100) |
| CRI Score | CRI_Score | CRI | Number (0–100) |
| FPI Score | FPI_Score | FPI | Number (0–100) |
| MSI Score | MSI_Score | MSI | Number (0–100) |

### Update API Call (from scoring service → Zoho)

```json
PUT /crm/v2/HC_Enrollment/{record_id}
{
  "data": [{
    "HBI_Score": 742,
    "VDI_Score": 68,
    "BRE_Score": 74,
    "CRI_Score": 82,
    "FPI_Score": 56,
    "MSI_Score": 91
  }]
}
```

---

## 9. Score Change Notifications

When any score changes by ≥5 points, trigger a PassKit push notification:

| Condition | Notification |
|-----------|-------------|
| HBI increased ≥50 pts | "Your HIRECAR Business Index improved to {HBI}! Keep it up." |
| CRI increased ≥10 pts | "Your Credit Repair Index is now {CRI}/100. Your disputes are working." |
| MSI dropped below 30 | "We miss you! Log in to check your latest score updates." |
| Any score reached 90+ | "Congratulations! Your {score_name} is now in the excellent range." |

---

## 10. Implementation Checklist

- [ ] Create scoring calculation functions (Deluge for Zoho, or Cloudflare Worker functions)
- [ ] Implement initial enrollment scoring (CRI, VDI, BRE, FPI calculated; MSI = 50)
- [ ] Set up scheduled recalculation jobs (monthly for HBI/BRE/CRI/FPI, quarterly for VDI, weekly for MSI)
- [ ] Configure PassKit push notification triggers for score changes
- [ ] Build score display components for member portal (ScoreGauge, ScoreCard)
- [ ] Create score history tracking (log each recalculation with timestamp + delta)
- [ ] Test: verify initial scores calculate correctly for 10 test enrollments
- [ ] Test: verify HBI composite matches weighted sum of components

---

*Document Control: HC-CFG-012-A | WS2-BOT-ENROLLMENT | 2026-03-04*
