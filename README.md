# Eren Sezer — Portfolio

Next.js 14 · Three.js · Supabase · Vercel

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 3D / Animation | Three.js (vanilla, SSR-safe) |
| Backend / DB | Supabase (Postgres + Storage) |
| Hosting | Vercel |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template
cp .env.local.example .env.local
# → fill in your Supabase URL and anon key

# 3. Start dev server
npm run dev
```

Open http://localhost:3000

> **Without Supabase configured** the site still runs — every page has static fallback content so you can review the design immediately.

---

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql` — this creates all tables, row-level security policies, and seeds your initial project data
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add these to `.env.local` (and to Vercel environment variables)

### Adding Project Images

1. In Supabase Dashboard → **Storage**, create a bucket called `project-images` and set it to **public**
2. Upload images via the dashboard or via code
3. Copy the public URL and paste it into the `cover_image` / `images` columns for each project (via the Table Editor or SQL)

---

## Vercel Deployment

```bash
# Install Vercel CLI (once)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo directly in the Vercel dashboard.

**Environment variables to add in Vercel:**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |

---

## Project Structure

```
app/
  page.tsx              ← Home / hero (Three.js wireframe)
  projects/
    page.tsx            ← Projects grid with category filter
    [slug]/page.tsx     ← Individual project detail
  about/page.tsx        ← CV, skills, experience
  awards/page.tsx       ← Awards timeline
  publications/page.tsx ← Publications & workshops
  contact/page.tsx      ← Contact form → Supabase

components/
  nav/Navbar.tsx        ← Sticky nav with mobile menu
  three/
    ArchitecturalWireframe.tsx  ← Three.js tower (swap for richer model later)
  projects/
    ProjectCard.tsx
    ProjectGrid.tsx
  ui/Footer.tsx

lib/
  supabase.ts           ← All data-fetching functions
  types.ts              ← Shared TypeScript types

supabase/
  schema.sql            ← Full schema + seed data
```

---

## Evolving the Three.js Element

The wireframe lives in `components/three/ArchitecturalWireframe.tsx` and is loaded with `next/dynamic` + `{ ssr: false }`.

When you're ready to upgrade it:
- Replace the geometry code with a GLTF model: use `THREE.GLTFLoader`
- Add orbit controls from `three/examples/jsm/controls/OrbitControls`
- Add post-processing (bloom, depth of field) with `three/examples/jsm/postprocessing/`
- Or switch to `@react-three/fiber` + `@react-three/drei` for a more React-idiomatic approach

The component's cleanup function (`useEffect` return) already handles all Three.js disposal correctly.

---

## Customisation Cheat Sheet

**Colours** — edit `tailwind.config.ts`:
```ts
salmon: '#C4705A',      // ← your accent
charcoal: '#1A1A1A',   // ← text
cream: '#F7F5F2',      // ← background surfaces
```

**Fonts** — edit `app/globals.css` Google Fonts import and `tailwind.config.ts` `fontFamily`

**Nav links** — edit the `links` array in `components/nav/Navbar.tsx`
