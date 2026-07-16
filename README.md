# Dasketball

An original arcade basketball career game: custom avatars, 1v1 Phaser gameplay, progression, shop, and playoffs.

## Run locally

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3001` and creates `server/data/dasketball.db` automatically.

## Production

Build with `npm run build`. Set `VITE_API_URL` to the deployed API URL. The server can serve the client build when both are deployed together. SQLite requires a persistent writable disk, so deploy the server to a Node host with persistent storage; Vercel is suitable for the frontend but not persistent local SQLite.
