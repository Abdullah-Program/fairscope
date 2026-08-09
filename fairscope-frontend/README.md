# FairScope Frontend

Landing page — Phase 1 of the full-stack build. Login, Signup, and Dashboard
pages come next; routes are already scaffolded in `src/App.jsx` so they slot
in without restructuring.

## Design System

- **Background:** near-black navy (`#080B12` / `#0A0E17`)
- **Cards:** `#151B2C` with `#232937` borders
- **Primary accent:** electric blue `#4A7FFF`
- **Secondary accents:** teal `#2DD4BF`, purple `#8B5CF6`, amber `#F59E0B`
- **Fonts:** Inter (display/body), IBM Plex Mono (data labels, evidence tags)
- **Signature element:** the "Verdict Orb" — a distorting 3D chrome sphere
  (React Three Fiber) orbited by particle trails, representing a model under
  judgment with SHAP feature contributions pulling at its verdict.

## Setup

```bash
cd fairscope-frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**

> First `npm install` will take a few minutes — it's pulling in
> `@react-three/fiber` and `three.js` for the 3D hero, which are sizeable
> packages. This is normal.

## What's built so far

- `/` — Landing page (Hero with 3D orb, How It Works, real Case File
  preview using our actual tested audit data, Features, Footer CTA)
- `/login`, `/signup`, `/dashboard` — placeholder routes, built next

## Folder structure

```
src/
├── components/
│   └── landing/
│       ├── VerdictOrb.jsx       # 3D hero centerpiece (R3F)
│       ├── Navbar.jsx
│       ├── Hero.jsx
│       ├── HowItWorks.jsx
│       ├── CaseFilePreview.jsx  # real audit data from our backend testing
│       ├── Features.jsx
│       └── FooterCTA.jsx
├── pages/
│   └── LandingPage.jsx
├── styles/
│   └── index.css                # Tailwind + base styles
├── App.jsx                      # routing
└── main.jsx                     # entry point
```

## Notes

- Built and reviewed without a local build step (sandboxed dev environment
  has no network access to npm). If `npm run dev` throws anything on first
  run, paste the error back and it'll get fixed fast — small chance of a
  typo slipping through without a live build check.
- Respects `prefers-reduced-motion` — animations disable automatically for
  users who've turned that on at the OS level.
