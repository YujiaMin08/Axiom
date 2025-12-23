/**
 * 异步生成状态查询 API
 */

import { Router } from 'express';
import { getQueueStatus } from '../async-media-generator.js';

const router = Router();

/**
 * GET /async/status
 * 获取异步生成队列状态
 */
router.get('/status', (req, res) => {
  const status = getQueueStatus();
  res.json(status);
});

export default router;




