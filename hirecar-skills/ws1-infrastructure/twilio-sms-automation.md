---
name: twilio-sms-automation
description: Twilio SMS automation for HIRECAR client notifications. Handles pass delivery, status updates, reminders, and TCPA-compliant messaging for the credit dispute enrollment chain.
triggers:
  - twilio
  - sms
  - text message
  - sms notification
  - sms template
  - text notification
  - client sms
---

# Twilio SMS Automation — HIRECAR

Manages SMS communications for the HIRECAR credit dispute enrollment chain via Twilio API.

## API Configuration

- **Endpoint:** `https://api.twilio.com/2010-04-01/Accounts/{{TWILIO_SID}}/Messages.json`
- **Authentication:** Basic auth (Account SID : Auth Token)
- **From Number:** +1(213)XXX-XXXX
- **Messaging Service:** HIRECAR Notifications

## Send SMS

```
POST https://api.twilio.com/2010-04-01/Accounts/{{TWILIO_SID}}/Messages.json
Authorization: Basic {{base64(SID:TOKEN)}}
Content-Type: application/x-www-form-urlencoded

To={{client_phone}}&From={{TWILIO_FROM}}&Body={{message_body}}
```

## SMS Templates

### 1. Pass Delivery (on dispute creation)
```
HIRECAR: Your Credit Dispute Playbook is ready! Add your Access Pass: {{pass_url}} PIN: {{access_pin}} Reply STOP to opt out
```

### 2. 24hr Reminder (if pass not added)
```
HIRECAR: Don't forget your Access Pass! Add it now: {{pass_url}} Your playbook has action items due in 48hrs. Reply STOP to opt out
```

### 3. Status Update
```
HIRECAR: Your dispute status updated to {{status}}. Open your wallet pass for details. Questions? hirecar.la/support Reply STOP to opt out
```

### 4. 30-Day Check-In
```
HIRECAR: Day 30 — Bureau results should be in. Pull your reports at annualcreditreport.com and update your advisor. Reply STOP to opt out
```

### 5. Score Improvement
```
HIRECAR: Great news! Your credit range updated to {{score_range}}. Check your wallet pass for details. Keep going! Reply STOP to opt out
```

## TCPA Compliance
- Consent collected at intake (Zoho CRM form checkbox)
- STOP keyword auto-handled by Twilio
- Opt-out immediately removes from messaging list
- Messages sent only during business hours (8am-8pm recipient local time)
- Maximum 1 message per event (no duplicate sends)
- All messages include "Reply STOP to opt out"

## Character Limits
- Single SMS segment: 160 characters (GSM-7) or 70 (Unicode)
- All templates designed for single segment (~140-155 chars)
- Avoid Unicode characters to stay in GSM-7 encoding

## Integration
- **Trigger:** Cloudflare Worker /api/sms/{id} endpoint in enrollment chain
- **Input:** client_phone, pass_url, access_pin from Zoho CRM
- **Error handling:** Log failures, fallback to email delivery via Brevo
