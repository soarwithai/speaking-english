# Vercel 部署配置 - Pages API

## ✅ 已完成的配置

### 1. 创建了 Pages API 结构

```
/pages
  /api
    ├── chat.js      # 主要的 AI 对话 API
    ├── tts.js       # 文字转语音 API
    └── hello.js     # 测试用的 Hello World API
```

### 2. API 端点

部署到 Vercel 后，可以通过以下 URL 访问：

- **聊天 API**: `https://your-domain.vercel.app/api/chat`
- **TTS API**: `https://your-domain.vercel.app/api/tts`
- **测试 API**: `https://your-domain.vercel.app/api/hello`

### 3. Vercel 配置 (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "pages/api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/pages/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 🚀 部署步骤

### 1. 提交代码到 Git

```bash
git add .
git commit -m "配置 Vercel Pages API 结构"
git push origin main
```

### 2. Vercel 环境变量设置

在 Vercel 仪表板中设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | 你的 Google Gemini API 密钥 | 必需 |

### 3. 部署验证

部署完成后，测试以下端点：

#### 测试 Hello API
```bash
curl https://your-domain.vercel.app/api/hello
```

应该返回：
```json
{
  "message": "Hello from Vercel Serverless Functions!",
  "timestamp": "2025-12-28T..."
}
```

#### 测试 Chat API
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"task": "free-talk", "input": "你好"}'
```

## 📁 项目目录结构

```
uk-math-lingo-&-culture-coach/
├── pages/                      # Vercel Serverless Functions
│   └── api/
│       ├── chat.js            # AI 对话 API
│       ├── tts.js             # 文字转语音 API
│       └── hello.js           # 测试 API
├── src/                        # 前端源代码
│   ├── components/            # React 组件
│   ├── services/              # API 服务层
│   ├── App.tsx                # 主应用
│   ├── index.tsx              # 入口文件
│   ├── index.css              # Tailwind CSS
│   └── types.ts               # TypeScript 类型
├── dist/                       # 构建输出（由 Vite 生成）
├── index.html                  # HTML 模板
├── package.json                # 依赖配置
├── vercel.json                 # Vercel 部署配置
├── vite.config.ts              # Vite 配置
└── tailwind.config.js          # Tailwind 配置
```

## 🔍 故障排查

### 问题：API 返回 404

**原因**：路由配置不正确

**解决**：确保 `vercel.json` 中的路由配置正确：
```json
{
  "src": "/api/(.*)",
  "dest": "/pages/api/$1"
}
```

### 问题：API 返回 500 错误

**原因**：环境变量未设置或 API 代码错误

**解决**：
1. 检查 Vercel 仪表板中是否设置了 `GEMINI_API_KEY`
2. 查看 Vercel 函数日志

### 问题：前端页面空白

**原因**：静态文件构建或路由问题

**解决**：
1. 确保 `npm run build` 成功
2. 检查 `dist/` 目录是否生成
3. 查看浏览器控制台错误

## ✅ 验证清单

部署前检查：

- [x] `pages/api/` 目录已创建
- [x] API 文件已放置在 `pages/api/` 中
- [x] `vercel.json` 配置正确
- [x] 本地构建成功（`npm run build`）
- [x] 环境变量配置文档已准备
- [x] Git 提交已完成

部署后检查：

- [ ] Hello API 可以访问
- [ ] Chat API 可以正常工作
- [ ] TTS API 可以正常工作
- [ ] 前端页面正常显示
- [ ] 登录功能正常（密码：naonao）
- [ ] Free Talk 功能正常
- [ ] Scenario Practice 功能正常

## 📞 支持

如果遇到问题：

1. 查看 Vercel 部署日志
2. 查看 Vercel 函数日志（Runtime Logs）
3. 检查浏览器控制台错误
4. 确认环境变量已正确设置

---

✅ **配置完成！现在可以部署到 Vercel 了。**

### 下一步：

```bash
git add .
git commit -m "配置 Vercel Pages API 结构"
git push origin main
```

然后在 Vercel 仪表板查看部署进度。
