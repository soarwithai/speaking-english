// /pages/api/chat.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 你的处理逻辑
      const data = req.body;
      res.status(200).json({ message: 'Success', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}