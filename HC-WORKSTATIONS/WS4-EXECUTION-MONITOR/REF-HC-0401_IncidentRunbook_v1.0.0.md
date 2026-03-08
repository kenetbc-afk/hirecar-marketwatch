# HIRECAR Incident Response Runbook

**HC-WPK-004-A** | WS4 — Execution & Monitoring

---

## Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **CRITICAL** | Revenue flow broken, site down, data loss | Immediate | Owner + all WS leads |
| **ERROR** | Single integration failure, degraded service | 15 min | WS lead responsible |
| **WARN** | Performance degraded, approaching limits | 1 hour | Monitor & track |
| **INFO** | Notable event, no action needed | Log only | — |

---

## Incident #1: Enrollment Chain Failure

**Severity:** CRITICAL
**Impact:** New members cannot enroll
**Detection:** Cloudflare Worker error at /api/enroll endpoint, Slack alert triggered

### Triage Steps

1. Check Slack #hirecar-ops channel for enrollment failure alert
2. Visit Cloudflare Worker dashboard → https://api.hirecar.la/health
3. Review Worker logs for failed requests to /api/enroll

### Resolution by Endpoint

**If /api/enroll fails:**
- Check Cloudflare Worker logs for error details
- Verify all required environment variables are set (STRIPE_KEY, DATABASE_URL, etc.)
- Check downstream service connectivity (Stripe, database)
- Test: Make manual POST to /api/enroll with test data
- Fallback: Use Stripe webhook directly if database unavailable

**If email delivery fails (Brevo):**
- Verify Brevo API credentials in Worker environment
- Check email template configuration
- Test: Verify SendGrid/Brevo connection status
- Fallback: Send welcome email manually via Zoho Mail

**If SMS notification fails (Twilio):**
- Check Twilio account balance (prepaid, may be $0)
- Verify phone number is active
- Check message log for specific error codes
- Fallback: Skip SMS, rely on email notification

**If Slack notification fails:**
- Verify SLACK_WEBHOOK_URL environment variable is set
- Test webhook URL manually with curl
- Check Slack channel permissions (#hirecar-ops)
- Fallback: Check CloudFlare logs directly

### Post-Resolution
- Verify Cloudflare Worker health at /health endpoint
- Confirm member record was created in database
- Send manual welcome communication if auto-send failed
- Review Slack #hirecar-ops for incident summary

---

## Incident #2: Site Down (hirecar.la / marketwatch.hirecar.la)

**Severity:** CRITICAL
**Detection:** Health check fails, Cloudflare alerts

### Triage Steps

1. Check [Cloudflare Status](https://www.cloudflarestatus.com/) for global outage
2. Check DNS: `dig +short marketwatch.hirecar.la`
3. Check Cloudflare dashboard → Analytics → HTTP requests
4. Check GitHub Pages / Cloudflare Pages deployment status

### Resolution

**If Cloudflare global outage:**
- Wait for Cloudflare resolution
- Monitor status page
- Post notice to #hirecar-ops

**If DNS not resolving:**
- Log into GoDaddy → DNS Management
- Verify CNAME record: `marketwatch` → Cloudflare Pages URL
- DNS changes take 1-4 hours to propagate
- Use `whatsmydns.net` to check global propagation

**If deployment failed:**
- Check GitHub Actions → Deploy Public Site workflow
- Look at the most recent run for error details
- Try manual redeploy: Actions → Run workflow
- If persistent: deploy directly via `wrangler pages deploy`

**If Vercel dashboard down:**
- Check Vercel status page
- Check build logs in Vercel dashboard
- Try redeployment from Vercel UI
- Fallback: dashboard is P2, not critical for operations

---

## Incident #3: Stripe Payment Failure

**Severity:** ERROR
**Detection:** Slack alert from Cloudflare Worker webhook handler

### Triage Steps

1. Open Stripe Dashboard → Payments → filter by Failed
2. Check the failure reason code
3. Review Cloudflare Worker logs at /webhooks/stripe endpoint

### Common Failures

**Card declined:**
- Not a system issue — customer's card problem
- Brevo should auto-send "payment failed" email
- No action needed unless recurring

**Webhook not firing:**
- Stripe Dashboard → Developers → Webhooks
- Check endpoint URL is correct (must be https://api.hirecar.la/webhooks/stripe)
- Check webhook signing secret matches Worker configuration
- Test: Send test webhook from Stripe Dashboard

**Worker not processing webhook:**
- Check Worker is deployed and active in Cloudflare dashboard
- Review Worker logs for webhook delivery errors
- Verify STRIPE_WEBHOOK_SECRET matches Stripe configuration
- Test: Trigger test payment in Stripe test mode

---

## Incident #4: Cloudflare Worker CPU Usage High

**Severity:** WARN → CRITICAL at 95%+
**Detection:** Worker CPU usage monitoring alert

### At 80% CPU (WARNING)

1. Review Cloudflare Worker dashboard for CPU metrics
2. Identify which endpoints are consuming most CPU
3. Analyze logs for slow database queries or external API calls
4. Plan optimization improvements

### At 95% CPU (CRITICAL)

1. **Decision point:** Optimize Worker code or request CPU increase
2. Check for N+1 queries, missing database indexes, or inefficient loops
3. Consider implementing caching or request batching
4. Notify owner immediately

### Optimization Strategies

- Database query optimization: Add indexes, reduce round-trips
- Request batching: Combine multiple API calls into single batch
- Caching: Use Cloudflare Cache API for frequently accessed data
- Rate limiting: Implement to prevent abuse and excessive CPU usage

---

## Incident #5: Email Delivery Rate Drop

**Severity:** WARN
**Detection:** SendGrid stats show < 90% delivery rate

### Triage Steps

1. SendGrid → Activity → filter by Bounced, Blocked, Deferred
2. Check if specific domains are bouncing (ISP blocking)
3. Review domain authentication status

### Resolution

- If domain auth expired: Re-verify in SendGrid
- If IP reputation low: Review content for spam triggers
- If specific ISP blocking: Check blocklist status at mxtoolbox.com
- If template causing bounces: Review HTML, remove suspicious links

---

## General Incident Protocol

### Communication Template

```
🔴 INCIDENT — [Title]
Severity: [CRITICAL/ERROR/WARN]
Time detected: [timestamp]
Impact: [what's broken]
Status: [investigating/identified/fixing/resolved]
ETA: [estimated resolution time]
```

### Post-Incident

1. Document what happened (root cause)
2. Document what was done (resolution)
3. Document what to change (prevention)
4. Update this runbook if new failure mode discovered
5. Add new alert rule if detection was slow
