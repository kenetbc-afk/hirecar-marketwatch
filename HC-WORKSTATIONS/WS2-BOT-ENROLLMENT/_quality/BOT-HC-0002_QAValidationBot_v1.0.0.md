# BOT-HC-0002: Quality Assurance Validation Bot
## Version: v1.0.0 | Date: 2026-03-04 | Approval: P2 (Manager)
## Context: CTX-HC-0001 (HIRECAR, LLC)

---

## 1. Purpose

Automated quality validation bot that scans HIRECAR deliverables against QA-HC-0001 Brand Quality Standards and reports compliance status. Runs as a pre-publish gate before any document or asset is deployed.

## 2. Trigger Conditions

| Trigger | Event | Action |
|---------|-------|--------|
| Manual | Operator invokes bot with file path | Scan single file |
| Scheduled | Daily at 06:00 PT | Scan all files in HC-WORKSTATIONS |
| Webhook | BOT-HC-0001 approval workflow completes | Scan approved document |
| CI/CD | GitHub push to main branch | Scan changed files |

## 3. Validation Rules Engine

### 3.1 Typography Checks (QA-HC-0001 Section 2)
- [ ] **FONT-001**: Heading fonts are Cormorant Garamond (check w:rFonts in .docx XML)
- [ ] **FONT-002**: Body fonts are Nunito Sans
- [ ] **FONT-003**: Code/data fonts are DM Mono
- [ ] **FONT-004**: Font sizes within approved ranges (H1: 24-36pt, H2: 18-24pt, Body: 11-12pt)
- [ ] **FONT-005**: No unicode bullet characters (scan for \u2022 outside numbering config)

### 3.2 Color Checks (QA-HC-0001 Section 3)
- [ ] **COLOR-001**: Only approved hex values used (#111820, #C9920A, #C0392B, #0F4C75 + extended)
- [ ] **COLOR-002**: No unapproved colors in document XML
- [ ] **COLOR-003**: --live-red not used for non-error/non-alert elements
- [ ] **COLOR-004**: Table headers use #D5E8F0 (ShadingType.CLEAR, not SOLID)

### 3.3 Logo Checks (QA-HC-0001 Section 4)
- [ ] **LOGO-001**: Logo image present in document header (if applicable)
- [ ] **LOGO-002**: Logo dimensions within approved ranges
- [ ] **LOGO-003**: Alt text includes "HIRECAR"
- [ ] **LOGO-004**: Logo not below minimum width (60px)

### 3.4 Structure Checks (HC Format)
- [ ] **STRUCT-001**: Filename follows {CLASS}-HC-{SEQ}_{ShortTitle}_v{VERSION}.{ext}
- [ ] **STRUCT-002**: Document header contains doc ID
- [ ] **STRUCT-003**: Footer contains CONFIDENTIAL marking
- [ ] **STRUCT-004**: Page size is US Letter (12240 x 15840 DXA)
- [ ] **STRUCT-005**: Margins are 1 inch (1440 DXA)
- [ ] **STRUCT-006**: Table widths use DXA (not percentage)

### 3.5 Content Checks
- [ ] **CONTENT-001**: No placeholder text (________, TODO, TBD, FIXME)
- [ ] **CONTENT-002**: Revision history present and version matches filename
- [ ] **CONTENT-003**: All internal cross-references (QA-HC-xxxx) resolve to existing docs

## 4. Output Format

### 4.1 Scan Report Structure
```json
{
  "botId": "BOT-HC-0002",
  "scanDate": "2026-03-04T06:00:00-08:00",
  "target": "HC-WORKSTATIONS/WS1-INFRASTRUCTURE",
  "filesScanned": 23,
  "results": {
    "passed": 21,
    "failed": 1,
    "warnings": 1
  },
  "failures": [
    {
      "file": "WPK-HC-0010_InfrastructurePaymentsPackage_v1.0.0.docx",
      "rule": "FONT-004",
      "message": "Body text size 10pt is below minimum 11pt",
      "severity": "FAIL",
      "location": "Section 3, Paragraph 12"
    }
  ],
  "warnings": [
    {
      "file": "SKL-HC-1100_api-gateway_v1.0.0.md",
      "rule": "STRUCT-001",
      "message": "Markdown files exempt from docx typography rules; verify rendering",
      "severity": "WARNING"
    }
  ],
  "overallStatus": "FAIL",
  "requiredAction": "Fix FONT-004 violation before deployment"
}
```

### 4.2 Report Delivery
- **JSON report**: Saved to `_quality/BOT-HC-0002_ScanReport_{DATE}.json`
- **Summary email**: Sent to QA Lead and WS Owner via SendGrid
- **Zoho CRM note**: Attached to project record
- **Slack notification**: Posted to #hirecar-qa channel (if configured)

## 5. Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| Cloudflare Worker | Webhook trigger | Receives scan requests from approval workflow |
| Zoho CRM | API | Logs scan results as project notes |
| SendGrid | API | Sends scan report emails |
| GitHub | Actions | Triggers scan on push to main |
| BOT-HC-0001 | Event | Receives approval completion events |
| QA-HC-0001 | Reference | Source of truth for brand rules |

## 6. Pre-Publish Alignment Confirmation

Before activating this bot in production:
- [ ] All validation rules match current QA-HC-0001 standards
- [ ] Rule IDs (FONT-xxx, COLOR-xxx, etc.) are unique and documented
- [ ] Output JSON schema validated against expected consumers
- [ ] SendGrid template configured for scan report delivery
- [ ] Cloudflare Worker webhook URL configured and tested
- [ ] Bot tested against sample files with known pass/fail cases
- [ ] Severity classifications reviewed (FAIL vs WARNING)
- [ ] Escalation path for unresolvable failures defined
- [ ] This bot spec follows HC Format naming and brand standards

## 7. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0.0 | 2026-03-04 | HIRECAR QA Team | Initial QA validation bot specification |
