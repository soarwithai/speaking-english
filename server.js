// server.js 示例配置
const express = require('express');
const app = express();

// API路由
app.use('/api/hello', require('./api/hello'));
app.use('/api/chat', require('./api/chat'));

// 对于Vercel，需要导出app
module.exports = app;