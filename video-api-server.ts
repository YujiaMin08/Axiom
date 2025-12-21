/**
 * 视频生成 API 测试服务器
 * 
 * 端点：
 * - POST /health
 * - POST /video/create
 * - GET /video/status?taskId=xxx
 * - POST /video/create-and-wait
 * 
 * 启动：npx tsx video-api-server.ts
 */

import express from 'express';
import {
  createVideoTask,
  getVideoStatus,
  createAndWaitForVideo
} from './server/juxin-video-service.js';

const app = express();
const PORT = 3002;

app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * 1. Health Check
 */
app.post('/health', (req, res) => {
  res.json({ ok: true });
});

/**
 * 2. 创建视频任务
 */
app.post('/video/create', async (req, res) => {
  try {
    const {
      prompt,
      images,
      orientation,
      size,
      duration,
      watermark,
      private: isPrivate
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const result = await createVideoTask({
      prompt,
      images,
      orientation,
      size,
      duration,
      watermark,
      private: isPrivate
    });

    res.json({
      taskId: result.id,
      status: result.status
    });
  } catch (error: any) {
    console.error('创建任务失败:', error);
    res.status(500).json({
      error: error.message || 'Failed to create video task'
    });
  }
});

/**
 * 3. 查询任务状态
 */
app.get('/video/status', async (req, res) => {
  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'taskId is required' });
    }

    const result = await getVideoStatus(taskId);
    res.json(result);
  } catch (error: any) {
    console.error('查询任务失败:', error);
    res.status(500).json({
      error: error.message || 'Failed to query video task'
    });
  }
});

/**
 * 4. 创建并等待视频生成完成
 */
app.post('/video/create-and-wait', async (req, res) => {
  try {
    const {
      prompt,
      images,
      orientation,
      size,
      duration,
      watermark,
      private: isPrivate,
      intervalMs,
      timeoutMs
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const result = await createAndWaitForVideo(
      {
        prompt,
        images,
        orientation,
        size,
        duration,
        watermark,
        private: isPrivate
      },
      {
        intervalMs: intervalMs || 2000,
        timeoutMs: timeoutMs || 180000
      }
    );

    if (result.error === 'timeout') {
      return res.status(504).json(result);
    }

    if (result.status === 'failed') {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('创建并等待视频失败:', error);
    res.status(500).json({
      error: error.message || 'Failed to create and wait for video'
    });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🎬 视频生成 API 服务器启动成功！');
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log('\n可用端点:');
  console.log('  POST   /health');
  console.log('  POST   /video/create');
  console.log('  GET    /video/status?taskId=xxx');
  console.log('  POST   /video/create-and-wait');
  console.log('\n示例命令:');
  console.log(`  curl -X POST http://localhost:${PORT}/health`);
  console.log(`  curl -X POST http://localhost:${PORT}/video/create -H "Content-Type: application/json" -d '{"prompt":"A cat playing piano"}'`);
});

