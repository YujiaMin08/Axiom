/**
 * 图片生成 API 服务器
 * 
 * 独立的 Express 服务器，提供图片生成 API
 * 端口：3003
 * 
 * 可用端点：
 * - POST /health
 * - POST /image/generate
 * 
 * 运行：npx tsx image-api-server.ts
 */

import express from 'express';
import {
  generateImage,
  ImageGenerateParams,
  ImageResult
} from './server/juxin-image-service.js';

const app = express();
const PORT = 3003;

app.use(express.json({ limit: '50mb' })); // 支持大型base64图片

// ============ API 端点 ============

/**
 * 健康检查
 */
app.post('/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /health`);
  res.json({ ok: true, service: 'image-generation', model: 'gemini-3-pro-image-preview' });
});

/**
 * 生成图片
 * 
 * 请求体：
 * {
 *   "prompt": "A beautiful sunset over mountains",
 *   "aspectRatio": "16:9",     // 可选，默认 16:9
 *   "imageSize": "2K",         // 固定为 2K（禁止4K）
 *   "baseImage": {             // 可选，用于图片编辑
 *     "mimeType": "image/jpeg",
 *     "data": "base64string..."
 *   }
 * }
 * 
 * 响应：
 * {
 *   "success": true,
 *   "imageData": "base64string...",
 *   "mimeType": "image/jpeg",
 *   "text": "AI生成的图片说明",
 *   "dataUrl": "data:image/jpeg;base64,..."
 * }
 */
app.post('/image/generate', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /image/generate`);
  
  try {
    const { prompt, aspectRatio, imageSize, baseImage } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: prompt'
      });
    }

    console.log('📸 生成图片...');
    console.log('提示词:', prompt);
    console.log('参数:', { aspectRatio, imageSize: imageSize || '2K (默认)' });

    // 强制限制为2K
    const finalImageSize: '2K' = '2K';

    const params: ImageGenerateParams = {
      prompt,
      aspectRatio,
      imageSize: finalImageSize,
      baseImage
    };

    const result = await generateImage(params);

    if (result.success && result.imageData) {
      // 添加 Data URL 方便前端直接使用
      const dataUrl = `data:${result.mimeType};base64,${result.imageData}`;
      
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        text: result.text,
        dataUrl
      });
    } else {
      res.status(500).json(result);
    }

  } catch (error: any) {
    console.error('❌ 生成图片时出错:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log('🎨 图片生成 API 服务器启动成功！');
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log('');
  console.log('可用端点:');
  console.log('  POST   /health');
  console.log('  POST   /image/generate');
  console.log('');
  console.log('示例命令:');
  console.log('  curl -X POST http://localhost:3003/health');
  console.log('  curl -X POST http://localhost:3003/image/generate -H "Content-Type: application/json" -d \'{"prompt":"A cute cat"}\'');
  console.log('');
  console.log('模型: gemini-3-pro-image-preview (Nano Banana)');
  console.log('清晰度: 2K (固定，已禁用4K以控制成本)');
  console.log('支持: 自定义宽高比，图片编辑');
  console.log('');
});

