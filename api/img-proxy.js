// /api/img-proxy  ->  https://<your-vercel>.vercel.app/api/img-proxy?u=<原图URL>
export default async function handler(req, res) {
  try {
    const { u, b } = req.query;
    let target = u;
    if (!target && b) target = Buffer.from(b, 'base64').toString('utf-8');
    if (!target) return res.status(400).send('missing u or b');

    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124 Safari/537.36' }
    });
    if (!upstream.ok) return res.status(upstream.status).send(`fetch fail ${upstream.status}`);

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buf);
  } catch (e) {
    console.error(e);
    return res.status(500).send('proxy error');
  }
}
