# Dasketball

An original arcade basketball career game: custom avatars, 1v1 Phaser gameplay, progression, shop, and playoffs.

## Run locally

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3001` and creates `server/data/dasketball.db` automatically.

## Deploy to Vercel

The repository is configured as one Vercel project: Vite is built to `client/dist`, SPA routes fall back to `index.html`, and `/api/*` is handled by the Express Vercel Function. Production uses Turso/libSQL because Vercel Functions do not provide a persistent local filesystem.

1. Create a Turso database and copy its database URL and auth token.
2. Import this repository into Vercel with `Dasketball` as the project root.
3. Add these Production, Preview, and Development environment variables:

   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET` — use a long random value

4. Deploy. Vercel reads `vercel.json` and runs `npm run vercel-build` automatically.

No `VITE_API_URL` is needed for the same-origin Vercel deployment. For a separately hosted API, set it to that API's public `/api` URL.

For local development, the database defaults to `dasketball.db` in the project directory; Turso variables are optional. Use `.env.example` as the production variable checklist. Never commit real tokens.
