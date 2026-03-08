#!/bin/bash
# ============================================================
# HIRECAR Health Check Script — WS4
# HC-WPK-004-A | Run every 15 minutes via cron or GitHub Actions
# ============================================================

set -euo pipefail

SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
SITE_URL="https://marketwatch.hirecar.la"
DASHBOARD_URL="${VERCEL_DASHBOARD_URL:-}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_ok()   { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; WARNINGS=$((WARNINGS+1)); }
log_fail() { echo -e "${RED}[FAIL]${NC}  $1"; ERRORS=$((ERRORS+1)); }

send_slack() {
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$1\"}" \
            "$SLACK_WEBHOOK" > /dev/null 2>&1
    fi
}

echo "============================================"
echo "HIRECAR Health Check — $TIMESTAMP"
echo "============================================"
echo ""

# --- 1. Site Uptime Check ---
echo "--- Site Availability ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    log_ok "Site ($SITE_URL): HTTP $HTTP_CODE"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    log_ok "Site ($SITE_URL): HTTP $HTTP_CODE (redirect)"
else
    log_fail "Site ($SITE_URL): HTTP $HTTP_CODE"
    send_slack "🔴 hirecar.la is DOWN — HTTP $HTTP_CODE at $TIMESTAMP"
fi

# Response time
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$SITE_URL" 2>/dev/null || echo "0")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "0")
if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l 2>/dev/null || echo 0) )); then
    log_warn "Response time: ${RESPONSE_MS}ms (>2000ms threshold)"
else
    log_ok "Response time: ${RESPONSE_MS}ms"
fi
echo ""

# --- 2. DNS Check ---
echo "--- DNS Resolution ---"
DNS_RESULT=$(dig +short marketwatch.hirecar.la 2>/dev/null || echo "FAIL")
if [ -n "$DNS_RESULT" ] && [ "$DNS_RESULT" != "FAIL" ]; then
    log_ok "DNS resolves: $DNS_RESULT"
else
    log_fail "DNS resolution failed for marketwatch.hirecar.la"
    send_slack "🔴 DNS resolution FAILED for marketwatch.hirecar.la at $TIMESTAMP"
fi
echo ""

# --- 3. SSL Check ---
echo "--- SSL Certificate ---"
SSL_EXPIRY=$(echo | openssl s_client -servername marketwatch.hirecar.la -connect marketwatch.hirecar.la:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "UNKNOWN")
if [ "$SSL_EXPIRY" != "UNKNOWN" ]; then
    EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$SSL_EXPIRY" +%s 2>/dev/null || echo "0")
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -lt 7 ]; then
        log_fail "SSL expires in $DAYS_LEFT days ($SSL_EXPIRY)"
        send_slack "🔴 SSL cert expires in $DAYS_LEFT days!"
    elif [ "$DAYS_LEFT" -lt 30 ]; then
        log_warn "SSL expires in $DAYS_LEFT days ($SSL_EXPIRY)"
    else
        log_ok "SSL valid for $DAYS_LEFT days (expires: $SSL_EXPIRY)"
    fi
else
    log_warn "Could not check SSL certificate"
fi
echo ""

# --- 4. Summary ---
echo "============================================"
echo "Summary: $ERRORS errors, $WARNINGS warnings"
echo "============================================"

if [ $ERRORS -gt 0 ]; then
    send_slack "🔴 HIRECAR Health Check: $ERRORS ERRORS, $WARNINGS warnings — $TIMESTAMP"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "Health check completed with warnings."
    exit 0
else
    echo "All systems healthy."
    exit 0
fi
