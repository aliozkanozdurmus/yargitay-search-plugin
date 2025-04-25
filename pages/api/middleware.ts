import { NextApiRequest, NextApiResponse } from 'next';

export function runMiddleware(req: NextApiRequest, res: NextApiResponse) {
  // CORS başlıklarını ayarla
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS isteğine yanıt ver
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
} 