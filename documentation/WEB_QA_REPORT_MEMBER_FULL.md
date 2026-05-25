# WIMUTISASTR Web — Full Member QA Report

**Environment:** Production — https://wimutisastr-web.vercel.app  
**Test account:** admin168@gmail.com  
**Test date:** 25 May 2026  
**Tester:** Automated QA (browser + API checks)  
**Membership status during test:** **បានអនុម័ត (Approved)**  
**Active period:** 25/05/2026 → 24/06/2026 (30 days)

---

## Executive summary

After membership approval, **core member functionality works**: member-only videos play, member-only documents open in the PDF viewer, profile shows correct dates, and paywalls are removed for locked content.

No **critical/blocking** bugs were found for approved members. Several **UX and copy issues** remain that can confuse paying users or suggest they still need to subscribe.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 5 |

---

## What was tested

### Authentication & profile
- [x] Login (session persists)
- [x] Profile page loads
- [x] Membership status = **បានអនុម័ត**
- [x] Start/end dates displayed
- [x] Nav shows **ប្រវត្តិរូប**

### Home
- [x] Featured courses (6) load after data fetch
- [x] Featured documents (5) load
- [x] Features section, hero, footer

### Law video (approved member)
- [x] `/law_video` — 6 courses listed
- [x] Member lesson playback (ID ending `…000006`) — **video player works**, no paywall
- [x] Free lesson playback (ID ending `…000001`, `…000002`) — works
- [x] Next lesson navigation — works (URL updates)
- [x] Lesson sidebar — all 6 lessons listed
- [x] Course entry from category redirects to first lesson

### Law documents (approved member)
- [x] Free document — PDF viewer, zoom, pagination
- [x] Member document (*criminal procedure code*) — opens, 4 pages, no paywall
- [x] Category list (`ក្រមច្បាប់`) — 4 documents, **អានឯកសារ** (not locked)

### Pricing & payment
- [x] `/pricing_page` — 3 plans load (after ~2–5s)
- [x] `/payment` — shows $3 monthly plan + **បង់ $3** (see issues below)

### Previously tested (guest / pending)
- Guest routes, paywalls, login gate — documented in earlier QA pass

---

## Test results — passed (approved member)

| Feature | Result | Notes |
|---------|--------|-------|
| Member video access | **Pass** | Paywall removed; `<video>` element present |
| Member PDF access | **Pass** | Full reader with page 1/4, next/prev |
| Profile membership | **Pass** | Status, approved date, start/end |
| Home content (logged in) | **Pass** | Courses + documents populate |
| Document category table | **Pass** | Member docs readable without lock icon flow |
| Video lesson navigation | **Pass** | Next/previous between lessons |
| Auth session | **Pass** | Stays logged in across routes |

---

## Issues & problems

### Medium priority

#### 1. Payment page still offers checkout when already subscribed
**Route:** `/payment`  
**Problem:** Approved member with active subscription still sees **បង់ $3** and full checkout UI. No message like “You already have an active membership until 24/06/2026.”  
**Risk:** User may pay twice or think subscription is inactive.  
**Suggestion:** If `membershipStatus === "approved"` and end date is in the future, show active-plan summary and hide/disable pay button (link to profile or renewal only when expiring).

#### 2. Course cards show “មើលឥតគិតថ្លៃ” for approved members
**Route:** `/law_video`  
**Problem:** Every course card badge and CTA can still say **មើលឥតគិតថ្លៃ** when the category has free preview videos, even when the user is fully approved.  
**Code reference:** `VideoGridClient.tsx` — badge uses `hasFree`; CTA uses `hasFree ? "មើលឥតគិតថ្លៃ" : "ចូលមើលវគ្គ"` without checking `isApproved` first.  
**Risk:** Paying members think they only have free access.  
**Suggestion:** If `isApproved`, use **ចូលមើលវគ្គ** / **បន្តសិក្សា** and hide the free-preview badge (or show **សមាជិក** / **ចូលប្រើបាន**).

#### 3. Lesson list still labels items “សមាជិកភាព” when user is approved
**Route:** `/law_video/[courseId]/watch/[videoId]`  
**Problem:** Sidebar still shows amber **សមាជិកភាព** on member lessons after approval.  
**Risk:** Cosmetic confusion only; playback works.  
**Suggestion:** For approved users, show **ចូលប្រើបាន** or hide the badge.

---

### Low priority

#### 4. Home page brief empty state on first load
**Route:** `/`  
**Problem:** Featured sections can show “មិនទាន់មានវគ្គ…” until API returns; scroll-animation blocks use `opacity-0` initially.  
**Impact:** First visit looks empty for ~1–2 seconds.  
**Suggestion:** Skeleton loaders or `rescanScrollAnimations()` on data load (partially implemented).

#### 5. Pricing page slow load
**Route:** `/pricing_page`  
**Problem:** **កំពុងផ្ទុកគម្រោង…** visible for several seconds.  
**Suggestion:** Cache plans or SSR; skeleton cards.

#### 6. Typo: “ពេញអេកran” (fullscreen)
**Route:** Document reader  
**Problem:** Mixed Khmer + Latin — **ពេញអេកran** instead of proper Khmer (e.g. **ពេញអេក្រង់**).  
**File:** `app/law_documents/[categoryId]/read/[bookId]/page.tsx`

#### 7. Footer still lists “ចូលគណនី / ចុះឈ្មោះ” when logged in
**Route:** All pages (footer)  
**Problem:** Header has profile; footer still shows guest account links.  
**Impact:** Minor inconsistency.

#### 8. Wrong document category URL shows “រកមិនឃើញឯកសារ”
**Route:** `/law_documents/{wrongCategoryId}/read/{bookId}`  
**Problem:** Not a bug — book must belong to category. Users/bookmarks with wrong category see not-found instead of redirect.  
**Suggestion:** Redirect to correct category from book metadata.

---

## Comparison: before vs after approval

| Scenario | Pending member | Approved member |
|----------|----------------|-----------------|
| Member video | Paywall **ត្រូវការសមាជិកភាព** | Video plays |
| Member PDF | Paywall | PDF reader (4 pages) |
| Profile status | កំពុងរង់ចាំពិនិត្យ | បានអនុម័ត |
| Free content | Works | Works |
| Payment page | Pay $3 | Still shows Pay $3 (issue #1) |

---

## Functionality matrix (approved member)

| Module | Login | Browse | Consume content | Pay / renew |
|--------|-------|--------|-----------------|-------------|
| Home | — | OK | OK (links) | Link to pricing |
| Law video | — | OK | OK (all lessons) | N/A if approved |
| Law documents | — | OK | OK (free + member) | N/A if approved |
| Profile | — | OK | View/edit info | Links to payment |
| Pricing | — | OK (slow) | — | Can still start payment |
| Payment | Required | OK | — | Duplicate risk (issue #1) |
| About / Contact | — | OK | Form not submitted in QA | — |

---

## Recommended fix order

1. **Payment page** — detect active subscription (Medium #1)  
2. **Course card copy/badges** for `isApproved` (Medium #2)  
3. **Fullscreen Khmer typo** (Low #6)  
4. Loading skeletons for home/pricing (Low #4, #5)  
5. Footer auth-aware links (Low #7)

---

## Test plan for next release

- [ ] Approve member → verify video + PDF within 5 minutes (cache refresh)
- [ ] Expired member → paywall returns after end date
- [ ] Renew / extend membership from admin → dates update on profile
- [ ] Complete one real Baray test payment on staging (not run in this pass)
- [ ] Mobile Safari: video playback + PDF pinch-zoom
- [ ] Logout → member URLs redirect to login or paywall

---

## Sign-off

**Approved-member core flows:** Suitable for production use.  
**Before marketing to members:** Fix payment duplicate UX (#1) and course card labeling (#2).

---

*Generated from QA session on production. Re-test after deploying fixes.*
