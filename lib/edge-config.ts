import { createClient } from '@vercel/edge-config';

let client: any = null;

export function getEdgeClient() {
  if (client) return client;
  const EDGE_URL = process.env.EDGE_CONFIG_URL;
  const EDGE_TOKEN = process.env.EDGE_CONFIG_TOKEN;
  if (!EDGE_URL && !EDGE_TOKEN) return null;
  // createClient typings may vary between SDK versions; use a safe any-cast
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  client = (createClient as any)({ url: EDGE_URL, token: EDGE_TOKEN });
  return client;
}

export async function getPortfolioFromEdge() {
  const c = getEdgeClient();
  if (!c) return null;
  try {
    const raw = await c.get('portfolio');
    if (!raw) return null;
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw;
  } catch (e) {
    console.warn('Edge Config SDK error', e);
    return null;
  }
}
