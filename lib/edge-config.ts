import { get } from '@vercel/edge-config';

// export const config = { matcher: '/welcome' };

export async function getPortfolioFromEdge() {
  try {
    const raw = await get('portfolio');
    if (!raw) return null;
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw;
  } catch (e) {
    console.warn('Edge Config SDK error', e);
    return null;
  }
}
