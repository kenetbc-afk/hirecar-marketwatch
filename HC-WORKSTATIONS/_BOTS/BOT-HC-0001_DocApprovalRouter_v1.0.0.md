# BOT-HC-0001: Document Approval Router

Version: v1.0.0
Context ID: CTX-HC-0001
Confidentiality: INTERNAL
Last Updated: 2026-03-04T03:11:41.256Z

## Overview

The Document Approval Router (BOT-HC-0001) is an enterprise-grade automation bot that orchestrates document classification, approval routing, and compliance tracking for HireCAR.s HC Format document management system. This bot integrates with Zoho CRM, Cloudflare Workers, and email/SMS systems to ensure all critical documents follow proper approval workflows.

## Approval Workflow States

DRAFT -> MANAGER_REVIEW -> DIRECTOR_APPROVAL -> ACTIVE -> ARCHIVED/DEPRECATED

## Document Classification

### Priority P1 - Director Approval (24-48hr SLA)

Classes requiring Director approval:
- GOV (Governance)
- PLN (Plan)
- RPT (Report)
- ARC (Architecture)

Approval Process:
1. Author submits document in DRAFT status
2. Auto-notification to assigned Manager
3. Manager reviews within 24 hours
4. Upon manager approval -> auto-route to Director
5. Director reviews within 24 hours of manager approval
6. Upon director approval -> status = ACTIVE
7. Auto-notification to document subscribers

Escalation Rules:
- No manager review within 24 hours -> escalate to director
- No director review within 48 hours of manager approval -> escalate to CEO
- Auto-escalation alert to department head

### Priority P2 - Manager Approval (24hr SLA)

Classes requiring Manager approval:
- WPK (Workspace Package)
- BDL (Bundle)
- CFG (Configuration)
- SCN (Scenario)
- BOT (Bot/Automation)

Approval Process:
1. Author submits document in DRAFT status
2. Auto-notification to assigned Manager
3. Manager reviews within 24 hours
4. Upon approval -> status = ACTIVE
5. Auto-notification to document subscribers

Escalation Rules:
- No manager review within 24 hours -> escalate to director
- Director may auto-approve if manager unavailable
- Auto-escalation alert to team lead

### Priority P3 - Auto-Approved (No Review Required)

Classes auto-approved upon creation:
- SKL (Skill)
- TMP (Template)
- REF (Reference)

## Zoho CRM Integration

The bot syncs all document states and approvals with Zoho CRM for centralized tracking and reporting.

Field Mapping:
- HC_Document_ID -> documentId
- Title -> title
- Stage -> status
- Document_Class -> class
- Approver__c -> approvedBy
- Approval_Date__c -> approvalDate

## Cloudflare Worker Integration: HIRECAR-DOC-APPROVAL-ROUTER

The bot executes via a Cloudflare Worker at api.hirecar.la with these endpoints:

1. POST /api/enroll - Listens for "document.submitted" events
2. HC Format Validator - Validates naming convention and metadata (Worker middleware)
3. Classification Router - Routes to appropriate approver path
4. Zoho CRM - Create/Update document record (API call from Worker)
5. Email Router - Sends approval request notifications via Brevo
6. SMS Router - Sends SMS for time-sensitive P1 documents via Worker /api/sms/{id}
7. Approval Processor - Processes approval/rejection responses
8. Escalation Monitor - Checks for SLA breaches (runs every 2 hours)
9. Notification Aggregator - Sends batch notifications to Slack via SLACK_WEBHOOK_URL

## Email Templates

Template: MANAGER_REVIEW_REQUEST
Subject: Action Required: Document Approval - [TITLE] (v[VERSION])

Template: DIRECTOR_APPROVAL_REQUEST
Subject: Approval Required: [TITLE] (v[VERSION]) - Manager Approved

Template: DOCUMENT_PUBLISHED
Subject: Document Published: [TITLE] (v[VERSION])

## SMS Templates

URGENT_APPROVAL_REMINDER:
"[HIRECAR] URGENT: Document [SHORT_TITLE] pending your approval (24hr SLA). Review: [SHORT_LINK]"

ESCALATION_NOTICE:
"[HIRECAR] ESCALATED: Document [SHORT_TITLE] approval overdue. Escalated to [ESCALATED_TO]. Review: [SHORT_LINK]"

## SLA Tracking

P1 Documents: Manager 24hr + Director 24hr = 48hr total SLA
P2 Documents: Manager 24hr SLA
P3 Documents: Auto-approved (0hr SLA)

Escalation Timeline:
- Level 1 (At SLA - 4 hours): Email reminder to approver, SMS if P1
- Level 2 (At SLA): Email escalation notice, SMS alert to escalated approver
- Level 3 (After SLA + 24 hours): Executive notice to CEO, daily summary report

## Revision History

Version | Date | Author | Changes
v1.0.0 | 2026-03-04 | HIRECAR Build System | Initial bot creation and HC Format integration

---

Context ID: CTX-HC-0001
Classification: INTERNAL
Bot Owner: HIRECAR Automation Team
Bot Status: ACTIVE
Worker Endpoint: https://api.hirecar.la/api/enroll
Zoho CRM Integration: Enabled
