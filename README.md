# rrshamaut.co.il

Create a new project named "rrshamaut.co.il".

This is a WordPress-to-Lovable migration of a Hebrew, RTL insurance loss-adjuster / property-damage appraiser service site ("רפאל שמאות רכוש | RR"). I will drive the build phase-by-phase with precise instructions, so keep this first step minimal and foundational.

Requirements for the scaffold:
1. Stack: TanStack Start + TypeScript + Tailwind CSS + shadcn/ui, with the `@/` path alias and lucide-react. This MUST be server-rendered (SSR) — article/page content must appear in the raw server HTML (view-source), not client-injected only.
2. Set the document to Hebrew RTL globally: `<html lang="he" dir="rtl">`. Force this in the root route.
3. Enable Supabase (database + auth + storage) for this project — I will define the exact schema in my next message, so just set up the Supabase connection now; do NOT invent tables yet.
4. Design tokens as HSL CSS variables in index.css — no hardcoded colors. A polished final design (Claude Design, 1:1 of the original site) will be provided later; for now a clean neutral RTL placeholder is fine.
5. A simple placeholder home page that says the site is under construction in Hebrew.

Do NOT build any pages, importers, CMS, or content logic yet. Just the scaffold, RTL, and the Supabase connection. Confirm the Supabase project is connected when done.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rrshamaut-rtl-scaffold.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/30168f1f-77dd-43b7-87c9-422811492dab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
