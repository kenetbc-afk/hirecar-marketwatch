---
document_id: HC-CFG-010-A
title: Zoho CRM Enrollment Pipeline Configuration
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS2 Bot Building
workstation: WS2-BOT-ENROLLMENT
---

# Zoho CRM Enrollment Pipeline Configuration

## 1. Custom Module: HC_Enrollment

Create a custom module in Zoho CRM called **HC_Enrollment** with the following fields:

| Field Name | API Name | Type | Required | Notes |
|---|---|---|---|---|
| Client Name | Client_Name | Single Line | Yes | From Contact record |
| Client Email | Client_Email | Email | Yes | From Contact record |
| Client Phone | Client_Phone | Phone | Yes | E.164 format (+12135551234) |
| Dispute ID | Dispute_ID | Auto Number | Yes | Format: DSP-2026-{0000} |
| Score Range | Score_Range | Pick List | Yes | Values: 300-579, 580-669, 670-739, 740-799, 800-850 |
| Negative Items | Negative_Items | Multi Line | Yes | Description of items under dispute |
| Advisor Name | Advisor_Name | Lookup (Users) | Yes | Assigned HIRECAR advisor |
| Membership Tier | Membership_Tier | Pick List | Yes | Standard, Operator, First Class, Elite |
| Dispute Date | Dispute_Date | Date | Yes | Auto-set on creation |
| Access PIN | Access_PIN | Single Line | No | Set by Cloudflare Worker (6-digit) |
| Pass URL | Pass_URL | URL | No | Set by Cloudflare Worker (PassKit URL) |
| Playbook URL | Playbook_URL | URL | No | Set by Cloudflare Worker (Bit.ai URL) |
| Enrollment Status | Enrollment_Status | Pick List | No | LEAD, QUALIFIED, ENROLLED, ACTIVE, SUSPENDED |
| HBI Score | HBI_Score | Number | No | 0-1000, set post-enrollment |
| VDI Score | VDI_Score | Number | No | 0-100 |
| BRE Score | BRE_Score | Number | No | 0-100 |
| CRI Score | CRI_Score | Number | No | 0-100 |
| FPI Score | FPI_Score | Number | No | 0-100 |
| MSI Score | MSI_Score | Number | No | 0-100, set post-enrollment |

---

## 2. Blueprint: Enrollment Pipeline

Configure a Blueprint on the HC_Enrollment module:

```
States:
  LEAD → QUALIFIED → ENROLLED → ACTIVE → SUSPENDED (optional)

Transitions:
  LEAD → QUALIFIED:
    Gate: Client_Email not empty AND Client_Phone not empty AND Score_Range set
    Action: None (manual qualification by advisor)

  QUALIFIED → ENROLLED:
    Gate: Webhook response confirms success (Access_PIN populated)
    Action: Trigger Cloudflare Worker webhook (see Section 3)

  ENROLLED → ACTIVE:
    Gate: Pass_URL not empty AND Playbook_URL not empty
    Action: Auto-transition after Cloudflare Worker completes all 8 steps

  ACTIVE → SUSPENDED:
    Gate: Manual only (advisor action)
    Action: Update PassKit pass status to SUSPENDED
```

---

## 3. Workflow Rule: Trigger Cloudflare Worker Enrollment

**Rule Name:** HC-WF-001 Enrollment Trigger
**Module:** HC_Enrollment
**Trigger:** On Create (when new record created in QUALIFIED status)

### Webhook Configuration:

**URL:** `https://api.hirecar.io/enroll`
**Method:** POST
**Content-Type:** application/json
**Authorization:** `Bearer {WEBHOOK_SECRET}` (see HC-CFG-014-A for secret setup)

### Webhook Payload:

```json
{
  "event": "credit_dispute_created",
  "client_name": "${HC_Enrollment.Client_Name}",
  "client_email": "${HC_Enrollment.Client_Email}",
  "client_phone": "${HC_Enrollment.Client_Phone}",
  "dispute_id": "${HC_Enrollment.Dispute_ID}",
  "score_range": "${HC_Enrollment.Score_Range}",
  "negative_items": "${HC_Enrollment.Negative_Items}",
  "advisor_name": "${HC_Enrollment.Advisor_Name}",
  "membership_tier": "${HC_Enrollment.Membership_Tier}",
  "dispute_date": "${HC_Enrollment.Dispute_Date}",
  "record_id": "${HC_Enrollment.id}"
}
```

---

## 4. Custom Function: PIN Generation

Create a Deluge custom function for collision-checked PIN generation:

**Function Name:** generateEnrollmentPIN
**Trigger:** Called by Cloudflare Worker Step 1 (or as Zoho pre-step)

```deluge
// generateEnrollmentPIN
// Generates a unique 6-digit PIN and checks for collisions

pin = "";
isUnique = false;

while(!isUnique)
{
    randomNum = (zoho.currenttime.toLong() % 900000) + 100000;
    pin = randomNum.toString();

    // Check for existing PINs
    existing = zoho.crm.searchRecords("HC_Enrollment", "(Access_PIN:equals:" + pin + ")");
    if(existing.size() == 0)
    {
        isUnique = true;
    }
}

return pin;
```

**Note:** The Cloudflare Worker enrollment chain also generates a PIN inline (Step 1). The Zoho function is a backup for direct CRM operations. The Worker uses `Math.floor(Math.random() * 900000 + 100000)` for 6-digit PINs.

---

## 5. Webhook Callback (Cloudflare Worker → Zoho)

After the enrollment chain completes, the Cloudflare Worker (Step 7) calls back to Zoho CRM to update the record:

**API Call:** `PUT /crm/v2/HC_Enrollment/{record_id}`

```json
{
  "data": [{
    "Enrollment_Status": "ACTIVE",
    "Access_PIN": "{{generated_pin}}",
    "Pass_URL": "{{passkit_pass_url}}",
    "Playbook_URL": "{{bitai_playbook_url}}"
  }]
}
```

---

## 6. Implementation Checklist

- [ ] Create HC_Enrollment custom module with all fields
- [ ] Configure pick list values (Score_Range, Membership_Tier, Enrollment_Status)
- [ ] Set up Blueprint with 4 states and transition gates
- [ ] Create Workflow Rule HC-WF-001 with webhook
- [ ] Webhook URL set: `https://api.hirecar.io/enroll` (Cloudflare Worker — see HC-CFG-014-A)
- [ ] Authorization header added: `Bearer {WEBHOOK_SECRET}`
- [ ] record_id field added to webhook payload
- [ ] Create generateEnrollmentPIN custom function
- [ ] Test: create sample record → verify webhook fires → check Cloudflare Worker receives payload
- [ ] Configure Zoho API OAuth credentials for Cloudflare Worker callback (Step 7)

---

*Document Control: HC-CFG-010-A | WS2-BOT-ENROLLMENT | 2026-03-04*
