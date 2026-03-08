---
document_id: HC-CFG-004-A
title: PassKit Access Pass — Write Link, Welcome Page & Enrollment Integration
version: 1.0
date: 2026-03-04
status: ACTIVE
classification: Internal — WS2 Bot Building
---

# PassKit Access Pass — Write Link, Welcome & Enrollment

## 1. PassKit Project Details

| Field | Value |
|-------|-------|
| **Project Name** | ACCESS PASS |
| **Project Status** | Draft (move to Live before production) |
| **Account** | hirecar1 — HIRECAR, LLC dba HIRECREDIT |
| **Webhook ID** | `2PlkkHry7o3xYlj1KDEV1w` |
| **Webhook Protocol** | MEMBERSHIP |
| **Webhook URL** | `https://www.hirecar.la/services` |
| **API Endpoint** | `https://api.pub1.passkit.io` |

---

## 2. Write Link (Enrollment URL)

The **Write Link** is the URL clients use to self-enroll for their Access Pass. PassKit generates this under **Distribution > Smart Pass Links**.

### Generate Write Link in PassKit Dashboard:
1. Go to **Distribution** tab in ACCESS PASS project
2. Click **Create Smart Pass Link**
3. Configure:
   - **Link Type:** Enrollment
   - **Pre-fill Fields:** Leave empty (populated by Make.com automation)
   - **Redirect After Add:** `https://hirecar.la/welcome-pass`
4. Copy the generated URL

### Programmatic Write (via API):
```
POST https://api.pub1.passkit.io/members/member
Authorization: Bearer {{PASSKIT_API_KEY}}
Content-Type: application/json

{
  "tierId": "{{HIRECAR_TIER_ID}}",
  "memberId": "HC-DSP-{{dispute_id}}",
  "person": {
    "displayName": "{{client_name}}",
    "emailAddress": "{{client_email}}"
  },
  "metaData": {
    "dispute_id": "{{dispute_id}}",
    "playbook_url": "{{playbook_url}}",
    "access_pin": "{{access_pin}}",
    "score_range": "{{score_range}}",
    "dispute_status": "ACTIVE",
    "advisor_name": "{{advisor_name}}",
    "membership_tier": "{{membership_tier}}",
    "negative_items": "{{negative_items}}",
    "dispute_date": "{{dispute_date}}"
  }
}
```

### Response (contains pass download URL):
```json
{
  "id": "member-uuid",
  "passUrl": "https://pub1.pskt.io/c/xxxxxxxx",
  "status": "ACTIVE"
}
```

The `passUrl` is the **download link** sent to the client via SMS.

---

## 3. Welcome Page Design

**URL:** `https://hirecar.la/welcome-pass`

This page displays after a client adds the pass to their wallet. Build on Cloudflare Pages (WS1 scope).

### Page Content:

```
WELCOME TO YOUR HIRECAR ACCESS PASS

Your Credit Dispute Playbook is ready.

✓ Pass added to your wallet
✓ Playbook access activated
✓ Your advisor has been notified

WHAT'S INSIDE YOUR PASS:

• Flip your pass to find your Playbook link and PIN
• Your personalized Credit Dispute Playbook covers:
  - Bureau dispute letters (ready to send)
  - Score optimization timeline
  - Utilization strategy
  - Recovery milestones

NEXT STEPS:
1. Open your wallet and tap your HIRECAR pass
2. Flip to the back to find your Playbook link
3. Enter your 4-digit PIN to access your playbook
4. Follow Step 1 in your playbook within 48 hours

NEED HELP?
Text "HELP" to (213) XXX-XXXX
Email: support@hirecar.la
Visit: hirecar.la/support

— HIRECAR | Auto Operator Intelligence
```

### Technical Specs:
- **Stack:** Static HTML on Cloudflare Pages
- **Design:** Dark background (#111820), gold accents (#C9920A)
- **Fonts:** Cormorant Garamond headings, Nunito Sans body
- **Mobile-first:** 90%+ of wallet users are on mobile
- **No login required:** This is a public landing page
- **Analytics:** Track page loads as "pass_added" conversion event

---

## 4. SMS Welcome Message

Sent via Twilio immediately after pass creation:

```
HIRECAR: Your Credit Dispute Playbook is ready!
Add your Access Pass to your wallet: {{passUrl}}
Your PIN: {{access_pin}}
Reply STOP to opt out
```

**Character count:** ~155 (single SMS segment)

---

## 5. Email Welcome Template (SendGrid)

**Subject:** Your HIRECAR Access Pass is Ready — {{client_name}}
**From:** HIRECAR <noreply@hirecar.la>

```html
<!-- SendGrid Dynamic Template -->
Hi {{client_name}},

Your Credit Dispute Playbook has been created and your digital Access Pass is ready.

ADD YOUR PASS TO WALLET
{{passUrl}}

YOUR PLAYBOOK ACCESS:
• Playbook PIN: {{access_pin}}
• Dispute ID: {{dispute_id}}
• Filed: {{dispute_date}}
• Items Under Review: {{negative_items}}

WHAT HAPPENS NEXT:
1. Add your Access Pass to Apple Wallet or Google Wallet
2. Your pass contains a QR code linking to your playbook
3. Use your PIN ({{access_pin}}) to unlock your playbook
4. Complete Step 1 within 48 hours for fastest results

Your advisor {{advisor_name}} is monitoring your case. You'll receive push notifications on your pass when your dispute status changes.

Questions? Reply to this email or visit hirecar.la/support.

— HIRECAR | Auto Operator Intelligence
HIRECAR, LLC dba HIRECREDIT
hirecar.la | @hirecar.la
```

---

## 6. Enrollment Flow Integration (Cloudflare Worker)

### Trigger: New Credit Dispute Created (Zoho CRM)

**Current Implementation:** Cloudflare Worker (replaces legacy Make.com scenario)

```
ZOHO CRM → Webhook → Cloudflare Worker at api.hirecar.la/enroll → [7 actions]:

Action 1: Webhook Trigger (receives dispute data from Zoho)
Action 2: Generate 4-digit PIN (Math.floor(1000 + Math.random() * 9000))
Action 3: Create Bit.ai Playbook (POST /v1/documents with template + merge vars)
Action 4: Set Playbook Password (PUT /v1/documents/{{doc_id}}/password)
Action 5: Create PassKit Pass (POST /members/member with playbook URL + PIN)
Action 6: Send Email (Brevo API with transactional template with pass URL + PIN)
Action 7: Send SMS (Twilio with pass download URL + PIN)
```

**Note:** Make.com scenario (HC-SCN-001) is deprecated. Direct Worker implementation eliminates Make.com ops overhead and provides native Cloudflare platform benefits.

### Webhook Payload (from Zoho CRM):
```json
{
  "event": "credit_dispute_created",
  "client_name": "John Smith",
  "client_email": "john@example.com",
  "client_phone": "+12135551234",
  "dispute_id": "DSP-2026-0042",
  "score_range": "580-669",
  "negative_items": "3 collections, 1 late payment",
  "advisor_name": "Ken Eckman",
  "membership_tier": "Standard",
  "dispute_date": "2026-03-04"
}
```

---

## 7. Moving to Production

### Before going live:
1. **Upgrade PassKit project** from Draft → Live (Settings > Program Settings)
2. **Upload logo assets** to PassKit Designs tab
3. **Configure SendGrid** domain authentication for hirecar.la
4. **Verify Twilio** phone number and messaging service
5. **Test end-to-end** with a test dispute in Zoho CRM
6. **Rotate API keys** after testing session

### PassKit Draft Limitations (current):
- Passes expire after 48 hours
- Cannot carry over to Live Projects
- Must not be distributed commercially

---

*Document Control: HC-CFG-004-A | Classification: Internal | Generated: 2026-03-04*
