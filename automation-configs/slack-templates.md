---
document_id: HC-TMP-004-A
title: HIRECAR Slack Notification Templates
version: 1.0
date: 2026-03-04
channels:
  - "#hirecar (ops alerts, leads, payments, errors, SLA)"
  - "🔒 sales-talk (hot leads score≥70, payments)"
  - "#homebase (daily digest)"
---

# HIRECAR Slack Notification Templates

## Template 1 — New Lead
**Channel:** #hirecar + 🔒 sales-talk
**Trigger:** Lead Capture Pipeline receives form submission

```
:fire: *NEW LEAD*
━━━━━━━━━━━━━━━━━━
*Name:* {{name}}
*Email:* {{email}}
*Phone:* {{phone}}
*Score:* {{score}}/100
*Source:* {{source}}
*Goals:* {{goals_summary}}
*Status:* {{status}}
━━━━━━━━━━━━━━━━━━
_Submitted {{timestamp}}_
```

**Routing rules:**
- Score ≥ 70 → Post to both #hirecar-ops AND #hirecar-sales with 🔥 prefix
- Score 40–69 → Post to #hirecar-ops only with 📋 prefix
- Score < 40 → Post to #hirecar-ops only with 📝 prefix (log only)


## Template 2 — Payment Received
**Channel:** #hirecar + 🔒 sales-talk
**Trigger:** Stripe/PayPal webhook fires payment_intent.succeeded or IPN Completed

```
:moneybag: *PAYMENT RECEIVED*
━━━━━━━━━━━━━━━━━━
*Amount:* ${{amount}}
*Member:* {{member_name}}
*Email:* {{member_email}}
*Method:* {{method}} ({{provider}})
*Reference:* {{reference_id}}
*Receipt:* {{receipt_url}}
━━━━━━━━━━━━━━━━━━
_Processed {{timestamp}}_
```


## Template 3 — Service Activated
**Channel:** #hirecar
**Trigger:** Member moves to a new phase or service activates

```
:rocket: *SERVICE ACTIVATED*
━━━━━━━━━━━━━━━━━━
*Member:* {{member_name}}
*Service:* {{service_name}}
*Tier:* {{tier}}
*Phase:* {{phase}}
*Pass ID:* {{pass_id}}
━━━━━━━━━━━━━━━━━━
_Activated {{timestamp}}_
```


## Template 4 — SLA Warning
**Channel:** #hirecar
**Trigger:** Task approaches or exceeds SLA deadline

```
:warning: *SLA RISK*
━━━━━━━━━━━━━━━━━━
*Task:* {{task_name}}
*Deadline:* {{deadline}}
*Owner:* {{owner}}
*Status:* {{status}}
*Action Required:* {{action_description}}
━━━━━━━━━━━━━━━━━━
_Alert generated {{timestamp}}_
```


## Template 5 — Daily Digest
**Channel:** #hirecar
**Trigger:** Scheduled daily at 8:00 PM PST

```
:clipboard: *DAILY DIGEST — {{date}}*
━━━━━━━━━━━━━━━━━━
*New Leads:* {{lead_count}} (avg score: {{avg_score}})
*Payments:* ${{total_payments}} across {{payment_count}} transactions
*Active Members:* {{active_count}}
*Passes Issued:* {{pass_count}}
*Open SLA Risks:* {{sla_risk_count}}
━━━━━━━━━━━━━━━━━━
_Top lead: {{top_lead_name}} (score: {{top_lead_score}})_
_Largest payment: ${{largest_payment}} from {{largest_payment_member}}_
```


## Slack Notification Implementation

These templates are consumed by the **Cloudflare Worker** at `api.hirecar.la` and delivered via direct **SLACK_WEBHOOK_URL** integration (no Make.com intermediary).

**Implementation details:**

- **Delivery mechanism:** Cloudflare Worker → SLACK_WEBHOOK_URL environment variable
- **Channel routing:** Webhook posts to single channel; use Slack workflow rules for additional routing if needed
- **Formatting:** Slack uses mrkdwn (not markdown) — `*bold*`, `_italic_`, `:emoji:`
- **Block Kit alternative:** For richer messages with buttons/sections, use Block Kit JSON format instead of mrkdwn. See https://api.slack.com/block-kit for builder.
- **Rate limit:** Slack allows 1 message/second per channel. Worker batches digest messages.

**Related files:**
- Cloudflare Worker enrollment chain: `/HC-CFG-014-A`
- Slack integration config: See Worker environment variables in `wrangler.toml`
