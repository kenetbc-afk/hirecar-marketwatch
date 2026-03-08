---
document_id: HC-TMP-003-A
title: HIRECAR SMS Templates — Twilio
version: 1.0
date: 2026-03-04
---

# HIRECAR SMS Templates

## 1. Pass Delivery (Primary — sent on dispute creation)
```
HIRECAR: Your Credit Dispute Playbook is ready! Add your Access Pass: {{pass_url}} PIN: {{access_pin}} Reply STOP to opt out
```
**Characters:** ~145 (single segment)

## 2. Reminder (24hr if pass not added)
```
HIRECAR: Don't forget your Access Pass! Add it now: {{pass_url}} Your playbook has action items due in 48hrs. Reply STOP to opt out
```
**Characters:** ~140

## 3. Status Update (triggered by pass field update)
```
HIRECAR: Your dispute status updated to {{dispute_status}}. Open your wallet pass for details. Questions? hirecar.la/support Reply STOP to opt out
```
**Characters:** ~148

## 4. 30-Day Check-In
```
HIRECAR: Day 30 — Bureau results should be in. Pull your reports at annualcreditreport.com and update your advisor. Reply STOP to opt out
```
**Characters:** ~142

## 5. Score Improvement Notification
```
HIRECAR: Great news! Your credit range updated to {{score_range}}. Check your wallet pass for details. Keep going! Reply STOP to opt out
```
**Characters:** ~138

## Twilio Configuration
- **Messaging Service:** HIRECAR Notifications
- **From Number:** +1(213)XXX-XXXX (or toll-free)
- **Opt-out:** STOP keyword auto-handled by Twilio
- **Compliance:** TCPA consent collected at intake via Zoho CRM form
