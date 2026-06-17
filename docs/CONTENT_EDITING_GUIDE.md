# MIR Consulting — Content Editing Guide

A practical map of **where to add or change content** on the site. Two kinds of
content exist:

1. **Code-managed content** — Services & Industries copy, hero images. Edit a
   file, save, the site hot-reloads.
2. **Admin-managed content** — Blog posts, Case studies, Videos, Team members,
   Leads, Subscribers, Invoices, Site settings. Edit in the **Admin portal**
   (`/admin`), stored in MongoDB. No code changes needed.

---

## 1. Services

### List page `/services` and detail page `/services/:slug`
- **File:** `frontend/src/lib/content.js` → the `SERVICES` array.
- Each service object supports:

  | Field        | Type       | Shown where |
  |--------------|------------|-------------|
  | `slug`       | string     | URL (`/services/<slug>`) — keep unique & kebab-case |
  | `title`      | string     | List card + detail hero |
  | `tagline`    | string     | Under the title |
  | `summary`    | string     | Intro paragraph |
  | `problems`   | string[]   | "Problems we solve" |
  | `offerings`  | string[]   | "Offerings" chips |
  | `outcomes`   | string[]   | "Outcomes" |
  | `industries` | string[]   | Industry tags on the detail hero |
  | `extraSections` *(optional)* | `{ heading, body }[]` | Extra free-form blocks on the **detail** page |

### ➕ Adding more description to a service detail page
Add an `extraSections` array to that service object. Example:

```js
{
    slug: "analytics-bi",
    title: "Analytics & Business Intelligence",
    // ...existing fields...
    extraSections: [
        {
            heading: "Our approach",
            body: "We start with a data audit, then design KPIs that map to decisions, then build dashboards your team will actually open.",
        },
        {
            heading: "Typical engagement length",
            body: "4–10 weeks, depending on data maturity.",
        },
    ],
}
```
It renders automatically — see the `extraSections` block in
`frontend/src/pages/ServiceDetail.jsx` (look for the `📝 EXTRA CONTENT` marker).

### Service hero / card image
- **File:** `frontend/src/lib/content.js` → `SERVICE_HERO_IMAGES` (keyed by slug).

---

## 2. Industries

### List page `/industries` and detail page `/industries/:slug`
- **File:** `frontend/src/lib/content.js` → the `INDUSTRIES` array.
- Each industry object supports:

  | Field        | Type       | Shown where |
  |--------------|------------|-------------|
  | `slug`       | string     | URL (`/industries/<slug>`) |
  | `title`      | string     | List card + detail hero |
  | `summary`    | string     | Intro paragraph |
  | `challenges` | string[]   | "Challenges" |
  | `solutions`  | string[]   | "Our solutions" |
  | `useCases`   | string[]   | "Use cases" |
  | `extraSections` *(optional)* | `{ heading, body }[]` | Extra blocks on the **detail** page |

`extraSections` works exactly like Services (see the `📝 EXTRA CONTENT` marker in
`frontend/src/pages/IndustryDetail.jsx`).

### Industry hero / card image
- **File:** `frontend/src/lib/content.js` → `INDUSTRY_HERO_IMAGES` (keyed by slug).

---

## 3. Team members & individual profile pages `/team/:slug`

Team content is **admin-managed** — you do not edit code to change it.

- **Where to edit:** Admin portal → **Team** tab (`/admin` → Team). Add/edit a
  member and fill the fields below. The public profile page builds itself from
  these values.

  | Admin field        | Profile page section |
  |--------------------|----------------------|
  | Name, Role         | Hero |
  | Photo              | Hero portrait |
  | Headline           | One-line summary under the name |
  | Short bio          | "About" |
  | Career story       | "Career story" |
  | Achievements (one per line) | "Achievements" |
  | Expertise / Skills / Tools / Industries served | Right-column tag blocks |
  | Email, LinkedIn    | Hero contact buttons |
  | Related services / industries | Drives the "Work involving …" rail |
  | Profile URL slug   | The `/team/<slug>` URL (auto-generated from the name if left blank) |

- **Rendering code:** `frontend/src/pages/TeamProfile.jsx`
  (look for the `📝 EXTRA CONTENT` marker to see where to add a new section).
- **Data model / new fields:** `backend/models.py` → `TeamMember` &
  `TeamMemberCreate`. To add a brand-new field you must: (a) add it to both
  models, (b) add an input in `frontend/src/pages/admin/TeamPanel.jsx`, and
  (c) render it in `TeamProfile.jsx`.

---

## 4. Hero background images (per page)

All page heroes share a reusable layer component:
`frontend/src/components/sections/HeroImageLayer.jsx`.

- **Image URLs:** `frontend/src/lib/content.js` → `PAGE_HERO_IMAGES`
  (`about`, `services`, `industries`, `ourWork`, `contact`, `blog`,
  `caseStudies`). Change a URL to swap a hero background.
- **To add a hero background to another page:** import `HeroImageLayer` and
  `PAGE_HERO_IMAGES`, then drop
  `<HeroImageLayer src={PAGE_HERO_IMAGES.x} side="left|right" />`
  as the **first child** inside that page's `<Section testId="...-hero">`.

---

## 5. Blog, Case Studies, Videos

Fully **admin-managed** (`/admin` → Blog / Case Studies / Videos):
- Cover image upload, rich text body, scheduling (future "Coming soon"), and
  Related services/industries tags (which power the detail-page "Related work"
  rails). No code editing required.

---

## Quick reference

| I want to change…                         | Go here |
|-------------------------------------------|---------|
| Service copy / add a service              | `lib/content.js` → `SERVICES` |
| Industry copy / add an industry           | `lib/content.js` → `INDUSTRIES` |
| Extra paragraphs on a service/industry detail page | add `extraSections` to that object |
| A hero background image                   | `lib/content.js` → `PAGE_HERO_IMAGES` |
| A service/industry card image             | `lib/content.js` → `SERVICE_HERO_IMAGES` / `INDUSTRY_HERO_IMAGES` |
| Team member bio / story / skills          | Admin portal → Team tab |
| A blog post / case study / video          | Admin portal → Blog / Case Studies / Videos |
