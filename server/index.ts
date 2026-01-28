import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './db';
import canvasesRouter from './routes/canvases';
import modulesRouter from './routes/modules';
import interactRouter from './routes/interact';
import asyncStatusRouter from './routes/async-status';
import scenarioChatRouter from './routes/scenario-chat';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 - 支持生产环境
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🌐 CORS 配置:', {
  FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV
});

// ... (CORS configuration kept as is) ...

// ✅ 终极 CORS 解决方案：全局中间件拦截所有请求
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // 1. 允许所有来源（或根据需要进行过滤）
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 2. 设置其他必要的 CORS 头
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 3. 如果是 OPTIONS 预检请求，直接返回 204，不再向下执行
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 4. 非 OPTIONS 请求，继续处理
  next();
});

// 确认日志：CORS 中间件已启用
console.log('✅ CORS middleware enabled');
console.log('✅ OPTIONS preflight handler enabled');

app.use(express.json());

// 确保 data 目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据库
initDatabase();

// 路由
app.use('/api/canvases', canvasesRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/interact', interactRouter);
app.use('/api/async', asyncStatusRouter);
app.use('/api/scenario', scenarioChatRouter);

// ... (Rest of the file) ...

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Axiom API Server is running' });
});

// 启动服务器
const HOST = '0.0.0.0'; // 显式绑定到所有网络接口
app.listen(Number(PORT), HOST, () => {
  console.log(`✨ Axiom API Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 API Documentation:`);
  console.log(`   POST   /api/canvases          - 创建新 Canvas`);
  console.log(`   GET    /api/canvases/:id      - 获取 Canvas 详情`);
  console.log(`   GET    /api/canvases          - 获取所有 Canvas`);
  console.log(`   POST   /api/canvases/:id/expand - 扩展 Canvas`);
  console.log(`   POST   /api/canvases/:id/new  - 创建新 Canvas（归档旧的）`);
  console.log(`   POST   /api/modules/:id/edit  - 编辑模块`);
  console.log(`   GET    /api/modules/:id/versions - 获取模块版本历史`);
  console.log(`   DELETE /api/modules/:id        - 删除模块`);
  console.log(`   GET    /api/async/status       - 异步生成队列状态`);
  console.log(`   POST   /api/scenario/start    - 开始实时对话场景`);
  console.log(`   POST   /api/scenario/continue - 继续实时对话`);
  console.log(`   POST   /api/canvases/test     - 创建测试 Canvas（真实卡片预览）`);
});

export default app;

