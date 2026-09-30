# Manggahan Active

A React and Vite prototype for browsing community sports facilities, checking schedules, and making demo reservations.

## Run locally

```sh
npm ci
npm run dev
```

Run `npm run lint` to check the source. The site uses Three.js, GSAP, and Lenis for its landing-page motion; reduced-motion settings skip the 3D entrance.

## Git

This repository is prepared on the `main` branch. After creating an empty remote repository, connect and push it with:

```sh
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Generated files (`node_modules`, `dist`, and `tmp`) are ignored. See [AGENTS.md](AGENTS.md) for the project's commit rule.
