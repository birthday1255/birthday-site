# Memory

## Facts
- Project: birthday-site
- A private, role-based birthday web application built with Next.js 15, Firebase, and Appwrite
- Uses Tailwind CSS and TypeScript
- Hosting: Vercel (Hobby)
- Auth: Firebase Authentication (Google sign-in)
- Database: Firebase Firestore
- File storage: Appwrite Storage
- Live at: https://www.tekutriveni.me
- Firebase Project: birthday-2026-triveni
- Version: v0.6.0 → v0.7.0 (Sprint 9 UI polish applied)

## Tasks
- Sprint 9 UI Polish — COMPLETE (all 21 files rewritten)
  - npm run typecheck ✅ 0 errors
  - npm run build ✅ exit code 0
- Next: Deploy to Vercel (push to main), verify live site visually

## Decisions
- Added Outfit font (Google Fonts) for all headings via `--font-outfit` CSS variable
- Inter font retained for body text via `--font-inter`
- Aurora background: animated shifting gradient (subtle intensity) used across all pages
- Glassmorphism design: glass-card + glass-card-vivid utility classes with blur, tint, inner shadows
- Color palette: deep dark backgrounds (#050508), violet/fuchsia/rose accent spectrum
- Confetti: multi-wave (3 bursts) with golden sparkle particles mixed in
- Countdown timer: flip-clock aesthetic with glassmorphism digit cards
- All loading states upgraded to branded aurora + floating emoji screens
- Design tokens moved to CSS custom properties, referenced in both globals.css and tailwind.config.ts

## Notes
- 21 files modified in Sprint 9: globals.css, tailwind.config.ts, layout.tsx, page.tsx, wish/page.tsx, WishForm.tsx, dashboard/page.tsx, RevealPanel.tsx, ShareLink.tsx, VisitorsTodayList.tsx, WishesList.tsx, gallery/page.tsx, experience/page.tsx, CountdownTimer.tsx, WishCard.tsx, Confetti.tsx, GallerySection.tsx, SignOutButton.tsx, WishMediaDisplay.tsx, (birthday)/layout.tsx, (guest)/layout.tsx, (organizer)/layout.tsx
- All files use "use client" where needed (unchanged from before)
- StatsCard.tsx in components/organizer/ is now unused — the stat card was inlined in dashboard/page.tsx
