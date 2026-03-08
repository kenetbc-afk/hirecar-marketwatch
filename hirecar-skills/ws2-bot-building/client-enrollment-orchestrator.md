---
name: client-enrollment-orchestrator
description: End-to-end client enrollment automation for HIRECAR. Orchestrates the full intake-to-delivery chain — Zoho CRM intake, credit dispute filing, Bit.ai playbook generation, PassKit pass creation, email/SMS notifications, and membership tier assignment.
triggers:
  - enrollment
  - client enrollment
  - new client
  - intake process
  - onboarding
  - client onboarding
  - enrollment automation
  - intake automation
  - new member
---

# Client Enrollment Orchestrator — HIRECAR

Master orchestration skill for the complete client enrollment process. Coordinates across all services (Zoho CRM, Bit.ai, PassKit, SendGrid, Twilio) to automate the journey from intake form to wallet pass delivery.

## Enrollment Flow (6 Steps)

### Step 1: Client Intake (Zoho CRM)
**Trigger:** New lead submitted via hirecar.la intake form or direct CRM entry

**Data Collected:**
- Full name, email, phone (E.164 format)
- Current credit score range (self-reported or pulled)
- Number and type of negative items
- Vehicle financing goals
- Rideshare platform(s) (Uber, Lyft, both)

**Zoho CRM Actions:**
1. Create Contact record
2. Create Credit Dispute record (linked to Contact)
3. Assign advisor based on availability/specialization
4. Generate Dispute ID (format: DSP-YYYY-NNNN)
5. Set initial membership tier (Standard)
6. Calculate initial CRI score
7. Fire webhook to Cloudflare Worker /api/enroll

### Step 2: Generate PIN & Create Playbook
**Service:** Cloudflare Worker → Bit.ai API

1. Worker /api/enroll receives dispute data from Zoho webhook
2. Generate 4-digit random PIN: `Math.floor(1000 + Math.random() * 9000)`
3. Create Bit.ai document from template (HC-TMP-001-A)
4. Replace all merge variables with client data
5. Set document password = generated PIN
6. Capture document `shareUrl`

### Step 3: Create Access Pass
**Service:** Cloudflare Worker → PassKit API

1. Create new member pass with playbook URL and PIN in metaData
2. Set pass fields (name, dispute ID, tier, score range, advisor)
3. Configure QR code to encode `{{playbook_url}}?pin={{access_pin}}`
4. Capture `passUrl` (wallet download link)

### Step 4: Send Welcome Email
**Service:** Cloudflare Worker → Brevo API

1. Use dynamic template (HC-TMP-002-A)
2. Include: pass download button, PIN, dispute details, next steps
3. From: noreply@hirecar.la / HIRECAR
4. Subject: "Your HIRECAR Access Pass is Ready — {{client_name}}"

### Step 5: Send SMS with Pass Link
**Service:** Cloudflare Worker → Twilio API

1. Message: "HIRECAR: Your Credit Dispute Playbook is ready! Add your Access Pass: {{passUrl}} PIN: {{access_pin}} Reply STOP to opt out"
2. Single SMS segment (~145 characters)
3. TCPA compliance: consent collected at intake

### Step 6: Post-Enrollment Monitoring
**Ongoing automations:**
- Zoho CRM status changes → PassKit pass updates → Push notifications
- 24hr reminder SMS if pass not installed
- 30-day bureau results check-in SMS
- Score improvement notifications
- Tier advancement review triggers

## Operations Budget (Cloudflare Workers Free Plan)

| Operation | CPU Ms Used | Frequency |
|-----------|----------|-----------|
| Per enrollment | ~100-150 ms | Per new dispute |
| Monthly capacity | 10M requests | Total free tier |
| Max enrollments/month | Unlimited | No per-op limits |

## Service Dependencies

| Service | Plan | Key Config |
|---------|------|------------|
| Zoho CRM | Free | Webhook workflow rule |
| Cloudflare Workers | Free | api.hirecar.la domain + KV storage |
| Bit.ai | Free/Pro | Workspace + folder for playbooks |
| PassKit | Draft → Live | API key, tier ID, webhook URL |
| Brevo | Free | Transactional email template |
| Twilio | Pay-as-you-go | Messaging service + phone number |

## Error Handling

| Failure Point | Handling |
|---------------|----------|
| Bit.ai API down | Retry 3x with 30s delay. If fails, email advisor with client data for manual creation. |
| PassKit API error | Log error, continue to email/SMS with playbook URL only (no pass). Alert via Slack SLACK_WEBHOOK_URL. |
| Brevo failure | Retry 2x. If fails, log and trigger Twilio SMS as primary. |
| Twilio SMS failure | Log error, email takes priority. Manual follow-up by advisor. |
| Invalid phone number | Skip SMS, proceed with email only. Flag in CRM for advisor review. |

## Related Skills
- `credit-repair-strategist` — Credit advice logic for playbook content
- `passkit-enrollment-automation` — PassKit API operations
- `bitai-playbook-generator` — Bit.ai document operations
- `stripe-integration` — Payment processing for upgraded tiers
- `zoho-crm-automation` — CRM workflow configuration
- `sendgrid-automation` — Email template management
