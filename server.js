// server.js - 简化版本
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// 直接在 server.js 中定义聊天 API
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // 处理用户消息
    console.log('Received message:', message);
    
    // 这里添加你的聊天逻辑
    const reply = await processChatMessage(message);
    
    res.json({
      reply: reply,
      success: true
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: error.message });
  }
});

// 其他 API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from UK-MATH-LINGO API!' });
});

// 所有未匹配的路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function processChatMessage(message) {
  // 这里是你的聊天逻辑
  return `I received your message: "${message}". This is a test response.`;
}