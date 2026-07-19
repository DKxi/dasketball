import app from '../server/src/index.js';

export const config = {
  runtime: 'nodejs',
};

function normalizeUrl(req: { url?: string }) {
  const url = req.url ?? '/';
  if (url === '/api') return '/';
  if (url.startsWith('/api/')) return url.slice(4) || '/';
  return url;
}

export default function handler(req: any, res: any) {
  req.url = normalizeUrl(req);
  req.originalUrl = req.url;
  return app(req as any, res as any);
}
