# WIMUTISASTR — Project Cost Documentation

**Last updated:** May 2026  
**Scope:** `wimutisastr_web` (member site) + `wimutisastr_admin` (internal dashboard)  
**Purpose:** Estimate monthly operating cost, explain what drives bills, and list ways to control spend.

> Prices below are **approximate** and based on public pricing pages (Vercel, Supabase, Cloudflare, Upstash, etc.). Confirm current rates before budgeting. Exchange rates (USD → KHR) are not included.

---

## Executive summary

| Phase | Typical monthly total (USD) | Notes |
|-------|----------------------------|--------|
| **Development / staging** | **$0 – $25** | Free tiers + one small paid service if needed |
| **Launch (low traffic)** | **$45 – $90** | Pro hosting + database + light storage |
| **Small production** (~500–2,000 members, moderate video) | **$90 – $250** | Vercel bandwidth often becomes the main variable |
| **Growth** (heavy video streaming) | **$250 – $600+** | Scale storage, egress, and function usage |

**Largest cost risks for this stack:**

1. **Video delivery through Vercel** — `/api/videos/serve` proxies R2 through serverless functions, so **Vercel bandwidth and function duration** scale with watch time (not just R2 storage).
2. **Vercel overages** — beyond 1 TB/month fast data transfer on Pro.
3. **Supabase MAUs** — after 100,000 monthly active users on Pro ($0.00325 per extra MAU).

**Usually low or free:** Turnstile (bot protection), Telegram notifications, domain email (if you use a separate provider).

---

## Architecture (what you pay for)

```
                    ┌─────────────────────────────────────────┐
                    │           Members & admins              │
                    └─────────────────┬───────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
   wimutisastr.com              Admin URL                 pay.baray.io
   (Vercel — web)              (Vercel — admin)            (Baray)
          │                           │
          │    Next.js API routes     │
          ├───────────┬───────────────┤
          │           │               │
          ▼           ▼               ▼
     Supabase    Cloudflare R2    Upstash Redis
     (DB+Auth)   (PDFs, videos,   (rate limits)
                  payment proofs)
          │
          ▼
     Optional: Telegram (payment alerts)
     Optional: Cloudflare Turnstile (login/register)
```

| Component | Used by | Role |
|-----------|---------|------|
| **Vercel** | Web + Admin (2 deployments) | Hosting, SSR, API routes, edge/middleware |
| **Supabase** | Both apps (shared project) | Postgres, Auth, user profiles, payments metadata |
| **Cloudflare R2** | Both apps (shared account) | Books bucket, videos bucket, payment proof uploads |
| **Upstash Redis** | Web (recommended prod) | Distributed rate limiting on API/payment routes |
| **Baray** | Web only | Online membership payments (Cambodia banks) |
| **Cloudflare Turnstile** | Web | Bot protection on login/register |
| **Telegram Bot API** | Web | Optional payment verification alerts |
| **Domain** | DNS → Vercel | e.g. `wimutisastr.com` |

---

## Monthly cost by service

### 1. Vercel (hosting) — 2 projects

You run **two** Next.js apps:

| App | Typical URL | Plan needed for commercial use |
|-----|-------------|--------------------------------|
| Member web | `wimutisastr.com` / `*.vercel.app` | **Pro** (Hobby is non-commercial only) |
| Admin panel | Separate Vercel project (not public-linked) | **Pro** or same team |

**Public pricing (2026):**

| Item | Hobby | Pro |
|------|-------|-----|
| Base | $0 | **$20 / developer seat / month** |
| Included usage credit | — | **$20 / month** (offsets overages) |
| Fast data transfer | 100 GB/mo | **1 TB / month** included |
| Edge requests | Lower limits | **10M / month** included |
| Extra bandwidth | N/A (caps) | **~$0.15 / GB** after included |

**Rough estimate:**

| Setup | Monthly (USD) |
|-------|----------------|
| 1 developer, web only on Pro | ~$20 (+ overages) |
| 1 developer, web + admin (2 projects, 1 seat) | ~$20–40 (+ overages) |
| 2 developers on team | ~$40 (+ overages) |

**Why Vercel can exceed $20 quickly:** Member videos are served via `app/api/videos/serve` (and related play routes), which **streams bytes through Vercel**. Example: 200 GB of video egress in a month ≈ **$30** overage beyond the 1 TB cap is unlikely at 200 GB, but at 1.5 TB total site traffic you pay for **500 GB × $0.15 ≈ $75** (before credits).

**Cost controls:**

- Set **spend limits / alerts** in Vercel (75% and 100% of credit).
- Long-term: serve video via **signed R2 URLs** or a CDN in front of R2 to avoid proxying large files through functions.

---

### 2. Supabase (database + authentication) — shared

Both apps use the same Supabase project (`user_profiles`, `payment_proofs`, `subscription_plans`, books/videos metadata, etc.).

**Public pricing (2026):**

| Plan | Monthly | Highlights |
|------|---------|------------|
| **Free** | $0 | 500 MB DB, 50K MAU, projects may pause; fine for dev |
| **Pro** | **from $25 / project** | 8 GB DB, **100K MAU**, 100 GB file storage, 250 GB egress, daily backups |
| **Team** | from $599 | SOC2, SSO, longer retention |

**Typical production choice:** **Pro $25/month** with spend cap enabled.

**Overages (Pro, after included quotas):**

| Resource | Approx. overage rate |
|----------|----------------------|
| Extra MAU | $0.00325 per MAU |
| Extra DB storage | ~$0.125 / GB-month |
| Extra egress | ~$0.09 / GB |
| Extra file storage | ~$0.021 / GB-month |

**Example:** 150,000 MAU on Pro → $25 + (50,000 × $0.00325) ≈ **$187.50/month** from auth alone.

**Note:** Large PDF/video **files** live in **R2**, not Supabase Storage — Supabase mostly holds rows and auth. DB size stays smaller unless you store big JSON blobs.

---

### 3. Cloudflare R2 (object storage) — shared

Buckets (from env config):

- `R2_BOOK_BUCKET_NAME` — law documents (PDF)
- `R2_VIDEO_BUCKET_NAME` — course videos
- `R2_PROOF_OF_PAYMENT_BUCKET_NAME` — manual payment screenshots

**Public pricing (2026):**

| Item | Free tier / month | Paid |
|------|-------------------|------|
| Standard storage | 10 GB | **$0.015 / GB-month** |
| Class A ops (writes) | 1M requests | $4.50 / million |
| Class B ops (reads) | 10M requests | $0.36 / million |
| **Egress to internet** | — | **$0** (no egress fee from R2) |

**Storage examples:**

| Content | Size | Monthly storage cost |
|---------|------|----------------------|
| 50 PDFs × 5 MB | ~0.25 GB | ~$0 (within free 10 GB) |
| 100 videos × 500 MB | ~50 GB | ~**$0.75** |
| 200 videos × 1 GB | ~200 GB | ~**$3.00** |

**Important:** R2 egress is free, but if the app **proxies** files through Vercel, you still pay **Vercel bandwidth**, not R2 egress.

**Admin uploads:** Large video uploads from admin use R2 presigned URLs — cost is mostly storage + Class A writes, usually small.

---

### 4. Upstash Redis (rate limiting) — web

Used by `lib/rate-limit/redis.ts` for payment, webhooks, content APIs.

**Public pricing (2026):**

| Plan | Cost | Limits |
|------|------|--------|
| **Free** | $0 | 500K commands/month, 256 MB |
| **Pay as you go** | $0.20 / 100K commands | Scales with traffic |

**Typical launch:** **$0** on free tier.  
**Busy API month:** a few dollars unless you exceed 500K commands.

---

### 5. Baray (payments) — web only

Integration: `api/payment/baray/*` (create intent, webhook, status).

| Cost type | Who sets it |
|-----------|-------------|
| **Merchant / transaction fees** | Baray + acquiring bank — **not in this repo** |
| **API usage** | Usually included in merchant agreement |

**Action:** Check [dash.baray.io](https://dash.baray.io) for your fee schedule (percentage + fixed fee per transaction). Model separately from infrastructure.

**Example (illustrative only):** 100 members × $3/month = $300 revenue; if Baray fee were 2.5%, ≈ **$7.50** in payment fees (confirm with Baray).

---

### 6. Cloudflare Turnstile — web

Used on login/register.

| Tier | Cost |
|------|------|
| Free | **$0** for most sites (unlimited challenges on free plan per Cloudflare) |

Treat as **$0** unless you move to enterprise features.

---

### 7. Telegram notifications — web (optional)

`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` for payment alerts.

| Item | Cost |
|------|------|
| Bot API | **$0** for standard message volume |

---

### 8. Domain & DNS

| Item | Typical annual | Monthly equivalent |
|------|----------------|-------------------|
| `.com` domain | $10 – $15 / year | ~$1 |
| Privacy / WHOIS | Often included | — |

Point DNS to Vercel; no extra hosting fee for DNS if using Vercel + registrar DNS or Cloudflare DNS (free plan).

---

## Scenario estimates (USD / month)

### A. Development only

| Service | Cost |
|---------|------|
| Vercel Hobby (non-commercial) | $0 |
| Supabase Free | $0 |
| R2 (under 10 GB) | $0 |
| Upstash Free | $0 |
| **Total** | **~$0** |

---

### B. Production launch (recommended minimum)

| Service | Cost |
|---------|------|
| Vercel Pro (1 seat, 2 projects) | $20 |
| Supabase Pro | $25 |
| R2 (~20–50 GB videos + PDFs) | $0 – $1 |
| Upstash Free | $0 |
| Turnstile / Telegram | $0 |
| Domain (amortized) | ~$1 |
| Baray fees | Per transaction (variable) |
| Vercel overages | $0 – $20 if traffic is modest |
| **Infrastructure subtotal** | **~$46 – $70** |

---

### C. Small active membership (~1,000 MAU, regular video use)

| Service | Cost |
|---------|------|
| Vercel Pro + bandwidth (~300–600 GB/mo) | $20 – $50 |
| Supabase Pro | $25 |
| R2 (~80 GB stored) | ~$1 – $2 |
| Upstash | $0 – $5 |
| **Infrastructure subtotal** | **~$50 – $85** |

If many members watch long videos daily, add **$50 – $150+** for Vercel transfer and function time.

---

### D. Growth (~5,000 MAU, heavy video)

| Service | Cost |
|---------|------|
| Vercel Pro + high bandwidth (1 TB+) | $80 – $200+ |
| Supabase Pro (+ possible MAU/storage overages) | $25 – $80 |
| R2 (200+ GB) | $3 – $15 |
| Upstash pay-as-you-go | $5 – $20 |
| **Infrastructure subtotal** | **~$120 – $300+** |

---

## One-time & annual costs

| Item | Estimate |
|------|----------|
| Domain registration | $10 – $15 / year |
| SSL certificates | $0 (included on Vercel) |
| Apple/Google developer accounts | N/A (web-only product) |
| Legal / compliance | Outside scope |
| Content production (videos, PDFs) | Your internal cost |

---

## Cost optimization checklist

1. **Video delivery** — Highest impact. Prefer direct R2/CDN delivery with short-lived signed URLs instead of streaming entire files through `/api/videos/serve` when traffic grows.
2. **Vercel** — Enable spend caps; monitor **Fast Data Transfer** and **Serverless Function** duration in the dashboard.
3. **Supabase** — Keep binaries in R2; use DB for metadata only; enable **spend cap** on Pro.
4. **R2** — Compress videos at upload (admin already supports compression); use efficient codecs (H.264/MP4).
5. **Caching** — Home/pricing data uses revalidation; avoid unnecessary `no-store` on public reads.
6. **Admin** — Host on a separate Vercel project; restrict access (no public links) to avoid abuse traffic.
7. **Upstash** — Stay on free tier until command volume exceeds 500K/month.

---

## Monitoring & budgets

| Platform | What to watch |
|----------|----------------|
| **Vercel** | Bandwidth, serverless execution, edge requests — set billing alerts |
| **Supabase** | MAU, DB size, egress — dashboard → Usage |
| **Cloudflare** | R2 storage GB-month, Class A/B operations |
| **Upstash** | Commands/month |
| **Baray** | Settlement reports vs. expected membership revenue |

Review monthly until traffic patterns stabilize.

---

## Environment variables tied to billing

Configured in `.env` (see `.env.example`):

| Variable | Service billed |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `R2_*` | Cloudflare R2 |
| `UPSTASH_REDIS_*` | Upstash |
| `BARAY_*` | Baray (merchant fees) |
| `NEXT_PUBLIC_APP_URL`, `ALLOWED_ORIGINS` | Indirect (correct domain avoids rework) |
| `TELEGRAM_*` | Free tier |
| `NEXT_PUBLIC_TURNSTILE_*`, `TURNSTILE_SECRET_KEY` | Free tier |
| `CONTENT_TOKEN_SECRET` | N/A (security, not a vendor) |

Admin (`wimutisastr_admin`) shares Supabase + R2; no separate Baray keys.

---

## References

- Vercel pricing: https://vercel.com/pricing  
- Supabase pricing: https://supabase.com/pricing  
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/  
- Upstash pricing: https://upstash.com/pricing  
- Baray: https://baray.io / https://dash.baray.io  

---

## Disclaimer

This document is an **internal planning guide**, not financial or tax advice. Vendor pricing and your merchant agreement with Baray can change. Reconcile estimates with actual invoices each month after launch.
