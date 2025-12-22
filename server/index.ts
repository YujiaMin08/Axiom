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

// 构建允许的来源列表
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    FRONTEND_URL
  ].filter(Boolean);
  
  // 如果 FRONTEND_URL 是 vercel.app，添加通配符支持
  if (FRONTEND_URL && FRONTEND_URL.includes('vercel.app')) {
    // 提取基础域名（例如：axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app）
    // 但 cors 库不支持通配符，所以我们需要动态检查
    origins.push(FRONTEND_URL);
  }
  
  return [...new Set(origins)]; // 去重
};

const ALLOWED_ORIGINS = getAllowedOrigins();

console.log('🌐 CORS 配置:', {
  FRONTEND_URL,
  ALLOWED_ORIGINS,
  NODE_ENV: process.env.NODE_ENV
});

app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如 Postman、curl）
    if (!origin) {
      return callback(null, true);
    }
    
    // 开发环境：允许所有 localhost
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // 生产环境：检查是否在允许列表中
    const isAllowed = ALLOWED_ORIGINS.some(allowed => origin === allowed);
    
    // 额外检查：如果是 vercel.app 域名，也允许（支持预览 URL）
    const isVercelApp = origin.includes('.vercel.app');
    
    if (isAllowed || isVercelApp) {
      console.log('✅ CORS 允许来源:', origin);
      callback(null, true);
    } else {
      console.warn('⚠️ CORS 阻止来源:', origin);
      console.warn('   允许的来源:', ALLOWED_ORIGINS);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400 // 24 小时
}));

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Axiom API Server is running' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✨ Axiom API Server is running on http://localhost:${PORT}`);
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

