// Replace the old require() line with this:
export default async function handler(req, res) {
  const server = await import('../server/src/index.ts');
  
  // If your server exports a default handler, invoke it like this:
  return server.default(req, res);
}

