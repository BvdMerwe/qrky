# Feature: Subscription Tiers with Free/Paid Model

**Date:** 2026-03-19
**Status:** Approved by Product Owner
**Priority:** P2

---

## Problem Statement

QRky currently has no monetization strategy. Users can create unlimited URLs, QR codes, and aliases for free, which limits revenue potential and doesn't differentiate between casual users and power users. We need a tiered subscription model that:
- Converts free users to paid customers
- Provides clear value at each tier
- Scales with user needs

---

## User Stories

- **As a** casual user, **I want** to try QRky for free with basic URL shortening, **so that** I can evaluate the product before paying
- **As a** small business owner, **I want** affordable access to QR codes and custom aliases, **so that** I can brand my links professionally
- **As a** marketing agency, **I want** higher volume limits with predictable pricing, **so that** I can manage multiple client campaigns
- **As an** enterprise customer, **I want** unlimited usage with custom terms, **so that** I can scale without constraints

---

## Subscription Tiers

### Free Tier
- **Price:** €0/month
- **URLs:** 5 (hard limit)
- **QR Codes:** 0 (not available)
- **Aliases:** 0 (not available)
- **Analytics:** Included (up to 1M clicks tracked)
- **Trial:** N/A
- **Target:** Casual testers, individual users

### Basic Tier
- **Price:** €10/month
- **Annual Billing:** Configurable discount % (default: 17% = €100/year = 2 months free)
- **URLs:** 100
- **QR Codes:** 100 (1:1 with URLs)
- **Aliases:** 100 (1:1 with URLs)
- **Analytics:** Included
- **Trial:** 14 days free
- **Target:** Small businesses, solopreneurs

### Pro Tier
- **Price:** €25/month
- **Annual Billing:** Configurable discount % (default: 17% = €250/year = 2 months free)
- **URLs:** 500
- **QR Codes:** 500 (1:1 with URLs)
- **Aliases:** 500 (1:1 with URLs)
- **Analytics:** Included
- **Trial:** 14 days free
- **Target:** Marketing agencies, power users

### Enterprise Tier
- **Price:** Contact Sales (custom pricing)
- **Annual Billing:** Contact Sales
- **URLs:** Unlimited
- **QR Codes:** Unlimited
- **Aliases:** Unlimited
- **Analytics:** Included with SLA
- **Trial:** Custom (handled via sales)
- **Target:** Large organizations, high-volume users

---

## Key Constraints

### 1:1:1 Bundle Rule
Every paid tier follows a strict 1:1:1 ratio:
- Every URL includes 1 QR code and 1 alias
- Cannot have more QR codes than URLs
- Cannot have more aliases than URLs
- System enforces this at creation time

### Hard Limit Enforcement
- Users cannot exceed their tier limits
- Graceful error messages when limits reached
- Upgrade prompts displayed contextually
- No "soft" limits or overages

### Free Tier Restrictions
- No QR code generation capability
- No custom alias creation
- Can only use auto-generated short URLs
- Analytics included but capped at 1M clicks

---

## Acceptance Criteria

### Tier Assignment & Management
- [ ] Users are assigned "free" tier by default on signup
- [ ] Users can view current tier and usage in dashboard
- [ ] Users can upgrade/downgrade tiers via billing page
- [ ] Tier changes take effect immediately (prorated if needed)
- [ ] Downgrading to free: excess URLs/QRs/aliases are flagged for deletion

### Trial Period
- [ ] 14-day free trial for Basic and Pro tiers
- [ ] Trial starts on first paid feature usage (QR creation or alias assignment)
- [ ] No credit card required to start trial
- [ ] Reminder email 2 days before trial ends
- [ ] Automatic downgrade to free if no payment method added
- [ ] Trial can only be used once per user (no trial abuse)

### Limit Enforcement
- [ ] Free users cannot create QR codes (button disabled with tooltip)
- [ ] Free users cannot create aliases (field disabled with tooltip)
- [ ] Hard limit enforced at 5 URLs for free tier
- [ ] Upgrade modal shown when attempting to exceed limits
- [ ] Real-time usage counter displayed in dashboard
- [ ] Warning at 80% of tier capacity

### Annual Billing
- [ ] Configurable annual discount percentage (stored in config/admin)
- [ ] Default discount: 17% (2 months free)
- [ ] Annual billing option shown on pricing page
- [ ] Clear savings calculation displayed
- [ ] Easy toggle between monthly/annual during checkout

### Enterprise Tier
- [ ] "Contact Sales" button on pricing page
- [ ] Simple contact form (name, email, company, estimated volume)
- [ ] No self-service signup for Enterprise
- [ ] Admin manual tier assignment for Enterprise customers

### Analytics
- [ ] Analytics dashboard available in all tiers
- [ ] Free tier: up to 1M clicks tracked per URL
- [ ] Paid tiers: unlimited click tracking
- [ ] Basic metrics: clicks, referrers, geographic data
- [ ] Data retention: 1 year for all tiers

---

## Success Metrics

- **Conversion Rate:** 5%+ of free users upgrade to paid within 30 days
- **Trial Conversion:** 20%+ of trial users convert to paid
- **Churn Rate:** <5% monthly churn for paid tiers
- **Upgrade Rate:** 15%+ of Basic users upgrade to Pro within 6 months
- **Enterprise Pipeline:** 5+ qualified leads per month

---

## Out of Scope

- Overages or pay-per-use beyond tier limits
- Team/organization accounts (single user only for now)
- Multiple payment methods per account
- Usage-based billing
- Custom domain support (future feature)
- API rate limiting by tier (future consideration)
- White-label options
- Affiliate/referral program

---

## Dependencies

- Payment processor integration (Stripe recommended)
- User authentication system (existing Supabase Auth)
- Database schema updates for tier tracking
- Email service for trial reminders

---

## Notes for Tech Lead

1. **Database Schema:** Need to track user tier, trial status, trial end date
2. **Enforcement Points:** URL creation, QR generation, alias assignment
3. **Stripe Integration:** Recommended for payment processing
4. **Trial Tracking:** Need mechanism to prevent trial abuse (email-based?)
5. **Downgrade Handling:** What happens to excess resources when downgrading?
6. **Enterprise Workflow:** Manual process for now, automate later

---

## Related Documents

- Project: QRky URL Shortener
- Tech Stack: Next.js 15 + React 19 + Supabase + TypeScript
- Target Launch: TBD (set by TL)

---

**Approved by:** Product Owner
**Date:** 2026-03-19
**Next Step:** Technical review and breakdown by Tech Lead
