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

// 定义统一的 CORS 配置对象，确保普通请求和 OPTIONS 请求一致
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 1. 允许无 origin 的请求（Postman、curl、file://）
    if (!origin) {
      return callback(null, true);
    }
    
    // 2. 检查是否在白名单中
    const isAllowed = 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      origin.endsWith('.vercel.app') || 
      origin === FRONTEND_URL;
      
    if (isAllowed) {
      // console.log('✅ CORS 允许:', origin);
      return callback(null, true);
    }
    
    // 3. 紧急修复：对于调试阶段，记录警告但暂时允许通过
    // 这样可以排除是 origin 字符串匹配微小差异导致的问题
    console.warn('⚠️ CORS 非白名单来源 (暂时允许):', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 应用 CORS 配置
app.use(cors(corsOptions));

// ✅ 强制手动处理所有 OPTIONS 请求 (放在所有路由之前)
app.options('*', (req, res) => {
  // 手动设置 CORS 头，确保万无一失
  const origin = req.headers.origin;
  if (origin && (
    origin.includes('localhost') || 
    origin.includes('127.0.0.1') || 
    origin.endsWith('.vercel.app') || 
    origin === FRONTEND_URL
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // 允许所有来源 (调试模式)
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
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

