# TT Page Review — Design Spec

**Date:** 2026-05-25  
**Project:** ttpagereview.com  
**Status:** Approved — ready for implementation

---

## Overview

A Next.js web app where anyone can enter a TikTok username and instantly receive a scored profile report card. No accounts, no sign-in. Enter username → get results. Built by Rise Creator Network to demonstrate their expertise and capture creator leads.

---

## User Flow

1. User lands on homepage at ttpagereview.com
2. Types or pastes a TikTok username (with or without @)
3. Clicks "Analyze →" button
4. App fetches TikTok profile + recent 10–20 videos via RapidAPI
5. Server scores the profile across 6 categories using rules + AI vision
6. Results page renders scorecard with overall score, per-category breakdown, and priority fixes
7. RCN footer prompts creator to join

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Hosting:** Vercel
- **TikTok Data:** RapidAPI — "TikTok Scraper" endpoint (profile + user videos)
- **Profile Photo AI:** OpenAI GPT-4o vision — determines face vs. logo/AI art
- **Styling:** CSS Modules or plain CSS with design tokens
- **Font:** Outfit (Google Fonts)
- **No database, no auth, no sessions**

---

## Pages

### Landing Page (`/`)

**Layout:** Asymmetric split — hero text left, floating scorecard preview right

**Elements:**
- Nav: TikTok "T" logomark in yellow pill, "Join RCN →" black pill button (links to https://join.risecreatornetwork.com/)
- Hero headline: "Is your TikTok profile losing you followers?" (52px, font-weight 700, letter-spacing -0.03em)
- Sub-headline: "Enter your username to get a free profile review in seconds." (16px, muted)
- Username input: pill-shaped input with "@" prefix, placeholder "yourusername"
- CTA button: "Analyze →" black pill button (submits form)
- Right side: decorative floating scorecard preview card (static mockup, non-interactive)
- Bottom strip: "Built by Rise Creator Network" with yellow "Join RCN →" button

**Behavior:**
- Input strips leading "@" before sending to API
- On submit → navigate to `/results?username=handle`
- Loading state: skeleton shimmer on results page while fetching

### Results Page (`/results`)

**Layout:** Centered content, max-width 720px

**Elements:**
1. **Profile header:** Avatar (from TikTok), @username, follower/video counts, overall score badge (large number + colored background)
2. **Scorecard grid:** 2-column grid, 6 category cards
3. **Priority fixes list:** Top 3 items ordered by impact
4. **RCN footer:** "Want to grow faster? Rise Creator Network helps TikTok LIVE creators 3–4x their income." + yellow "Join RCN →" button

**States:**
- Loading: skeleton cards matching the layout
- Error (user not found): "We couldn't find @username. Double-check the spelling and try again."
- Error (API failure): "Something went wrong. Try again in a moment."

---

## Scoring System

### Overall Score
Weighted average of 6 category scores (0–100 each):

| Category | Weight | Data Source |
|---|---|---|
| Profile Photo | 20% | AI vision (GPT-4o) |
| Username | 15% | Rule-based |
| Bio | 20% | Rule-based |
| Video Grid | 20% | Recent video metadata |
| Engagement Rate | 15% | likes+comments / views on last 10 videos |
| Posting Consistency | 10% | Timestamps of last 20 videos |

### Score Colors
- 70–100 → green (#16A34A)
- 40–69 → amber (#D97706)
- 0–39 → red (#DC2626)

### Category Scoring Rules

**Profile Photo (0–100)**
- Scored by GPT-4o vision API
- Prompt: "Does this TikTok profile photo show a real human face clearly? Rate 0-100. 100 = face clearly visible, well-lit, close-up. 50 = partially visible or unclear. 0 = logo, AI art, text, or no face."
- Fallback if vision fails: 50

**Username (0–100)**
- 100: Short (≤12 chars), no numbers, no underscores
- 70: 13–18 chars OR 1–2 numbers OR 1 underscore
- 40: 19–24 chars OR 3+ numbers OR 2+ underscores
- 20: 25+ chars or multiple special chars

**Bio (0–100)**
- 100: Has text + CTA or link + posting schedule mention
- 70: Has text + CTA/link but no schedule
- 50: Has text but no CTA and no link
- 20: Bio is empty or under 10 chars

**Video Grid (0–100)**
- Scored from last 10 videos
- Cover art present (all have thumbnails ≠ first frame): +30
- Niche consistency (top hashtags overlap ≥ 60%): +40
- Average video count ≥ 3/week: +30
- Deductions applied proportionally based on what's missing

**Engagement Rate (0–100)**
- Formula: avg(likes + comments) / avg(views) for last 10 videos
- 8%+ → 100
- 5–8% → 80
- 3–5% → 60
- 1–3% → 40
- <1% → 20

**Posting Consistency (0–100)**
- Last 20 videos, calculate average days between posts
- ≤3 days avg gap → 100
- 4–7 days → 75
- 8–14 days → 50
- 15–30 days → 25
- >30 days → 10

### Priority Fixes Generation
After scoring, generate up to 3 priority fixes ordered by:
1. Lowest-scored category gets "HIGH PRIORITY" label
2. Second-lowest gets "MEDIUM" label
3. Any category 70–85 that has a quick fix gets "QUICK WIN" label

Fix copy is hard-coded per category based on score bucket (not AI-generated).

---

## API Route

**`GET /api/analyze?username=handle`**

**Steps:**
1. Fetch profile data from RapidAPI: `GET https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId={username}`
2. Fetch recent videos: `GET https://tiktok-api23.p.rapidapi.com/api/user/posts?uniqueId={username}&count=20`
3. Download profile photo URL, send to GPT-4o vision for photo score
4. Run all rule-based scoring
5. Compute weighted overall score
6. Generate priority fixes array
7. Return JSON response

**Response shape:**
```json
{
  "username": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "followerCount": 0,
  "videoCount": 0,
  "overallScore": 0,
  "categories": [
    {
      "id": "profilePhoto",
      "label": "Profile Photo",
      "score": 0,
      "status": "pass|partial|fail",
      "feedback": "string"
    }
  ],
  "priorityFixes": [
    {
      "priority": "high|medium|quickwin",
      "label": "string",
      "description": "string"
    }
  ]
}
```

**Error responses:**
- 404: `{ "error": "user_not_found" }`
- 500: `{ "error": "api_error" }`

---

## Design System

### Tokens
```css
--yellow: #F5C800;
--black: #0a0a0a;
--white: #fafafa;
--surface: #ffffff;
--border: rgba(0,0,0,0.08);
--muted: #6b7280;
--green: #16A34A;
--green-bg: #f0fdf4;
--amber: #D97706;
--amber-bg: #fffbeb;
--red: #DC2626;
--red-bg: #fef2f2;
--teal: #0891B2;
--teal-bg: #ecfeff;
```

### Typography
- Font: Outfit (Google Fonts, weights 400/600/700)
- Hero headline: 52px, 700, -0.03em letter-spacing
- Section headers: 24px, 700
- Body: 15px, 400, line-height 1.6, color #374151
- Labels: 11px, 600, uppercase, 0.08em letter-spacing, color #9ca3af

### Components
- **Score badge:** Large circle with score number, background tinted by score range
- **Category card:** white card, colored bottom border (3px), category name + score bar + feedback line
- **Priority fix:** Left border (3px) colored by priority, HIGH/MEDIUM/QUICK WIN label, description text
- **Input pill:** border-radius 999px, 1px solid border, @ prefix in muted color
- **CTA button:** background #0a0a0a, color #fafafa, border-radius 999px, 600 weight

### Animations (per animation-design skill)
- Page load: stagger cards with `animation-delay: calc(var(--i) * 60ms)`
- Score counter: count up from 0 to final score over 600ms on results page load
- Category bars: grow from 0 to width over 400ms, staggered
- Button `:active`: `transform: scale(0.97)`
- All transitions: `cubic-bezier(0.23, 1, 0.32, 1)`

---

## Environment Variables

```
RAPIDAPI_KEY=        # RapidAPI key for TikTok scraper
OPENAI_API_KEY=      # GPT-4o vision for profile photo scoring
```

Neither key is committed to the repository. Both set in Vercel dashboard.

---

## Project Structure

```
ttpagereview/
├── app/
│   ├── layout.tsx          # Root layout, Outfit font, meta
│   ├── page.tsx            # Landing page
│   ├── results/
│   │   └── page.tsx        # Results page (reads ?username= param)
│   └── api/
│       └── analyze/
│           └── route.ts    # API route — fetches + scores
├── components/
│   ├── UsernameInput.tsx    # Input + submit form
│   ├── ScoreCard.tsx        # Full results scorecard
│   ├── CategoryCard.tsx     # Individual category card
│   ├── PriorityFix.tsx      # Priority fix item
│   └── RCNFooter.tsx        # "Built by RCN" footer strip
├── lib/
│   ├── tiktok.ts           # RapidAPI fetch functions
│   ├── scoring.ts          # All scoring logic
│   └── vision.ts           # GPT-4o vision call
├── styles/
│   └── globals.css         # Design tokens + global styles
├── public/
│   └── ...
├── .env.local              # Local dev keys (gitignored)
├── next.config.js
└── package.json
```

---

## Out of Scope (v1)

- User accounts or saved reports
- Share/export report as image
- Comparison between two profiles
- Historical score tracking
- Monetization or paywall
- Mobile app
