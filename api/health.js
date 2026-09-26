'use strict';
/* Fungsi serverless Vercel: GET /api/health. */
module.exports = async function handler(req, res) {
  const apiKey = process.env.OPENCODE_API_KEY || '';
  const model = process.env.JEV_MODEL || 'jev-1.13-free';
  res.status(200).json({ ok: true, mode: apiKey ? 'live-ready' : 'demo', model });
};
