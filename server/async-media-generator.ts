/**
 * 异步多媒体生成器
 * 
 * 处理耗时的视频和图片生成
 * - 立即返回占位内容
 * - 后台异步生成
 * - 完成后更新数据库
 */

import { versionDB } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { generateVideoContent } from './gemini-video-generator.js';
import { generateImageContentAndCreate } from './gemini-image-generator.js';
import { createAndWaitForVideo } from './juxin-video-service.js';

// ============ 类型定义 ============

interface AsyncMediaTask {
  moduleId: string;
  type: 'video' | 'image';
  topic: string;
  domain: string;
  moduleType: string;
}

// 任务队列
const taskQueue: AsyncMediaTask[] = [];
let isProcessing = false;

// ============ 核心函数 ============

/**
 * 添加异步生成任务到队列
 */
export function queueAsyncMediaGeneration(task: AsyncMediaTask): void {
  console.log(`📥 添加异步任务: ${task.type} - ${task.topic}`);
  taskQueue.push(task);
  
  // 如果当前没有处理任务，启动处理循环
  if (!isProcessing) {
    processQueue();
  }
}

/**
 * 处理任务队列
 */
async function processQueue(): Promise<void> {
  if (isProcessing) return;
  if (taskQueue.length === 0) return;

  isProcessing = true;

  while (taskQueue.length > 0) {
    const task = taskQueue.shift();
    if (!task) break;

    console.log(`🔄 开始处理异步任务: ${task.type} - ${task.topic}`);

    try {
      if (task.type === 'video') {
        await generateVideoAsync(task);
      } else if (task.type === 'image') {
        await generateImageAsync(task);
      }
    } catch (error) {
      console.error(`❌ 异步任务失败 (${task.type}):`, error);
      
      // 即使失败也更新为错误状态
      await updateModuleWithError(task.moduleId, task.type, (error as Error).message);
    }
  }

  isProcessing = false;
}

/**
 * 异步生成视频
 */
async function generateVideoAsync(task: AsyncMediaTask): Promise<void> {
  console.log(`🎬 开始生成视频: ${task.topic}`);
  
  try {
    // 步骤 1: 使用 Gemini 生成视频 prompt
    const videoContent = await generateVideoContent({
      topic: task.topic,
      domain: task.domain as any,
      moduleType: task.moduleType
    });

    console.log(`  ✅ 视频 Prompt 生成成功`);
    console.log(`  📝 Prompt: ${videoContent.prompt.substring(0, 100)}...`);

    // 步骤 2: 调用聚鑫 Sora2 API 生成实际视频
    console.log(`  🎥 调用聚鑫 Sora2 API...`);
    
    const videoResult = await createAndWaitForVideo(
      {
        prompt: videoContent.prompt,
        orientation: videoContent.orientation as any,
        size: videoContent.size as any,
        duration: 10
      },
      {
        timeoutMs: 300000,  // 5 分钟超时
        intervalMs: 5000     // 每 5 秒查询一次
      }
    );

    if (videoResult.status === 'completed' && videoResult.videoUrl) {
      console.log(`  ✅ 视频生成成功！`);
      console.log(`  🔗 URL: ${videoResult.videoUrl}`);

      // 步骤 3: 更新模块内容
      const content = {
        type: 'video',
        title: videoContent.title,
        video_url: videoResult.videoUrl,
        thumbnail_url: videoResult.thumbUrl,
        description: videoContent.scene_description
      };

      const versionId = uuidv4();
      versionDB.create(
        versionId,
        task.moduleId,
        '视频生成完成',
        JSON.stringify(content)
      );

      console.log(`  💾 模块内容已更新`);

    } else {
      throw new Error(`视频生成超时或失败: ${videoResult.status}`);
    }

  } catch (error) {
    console.error(`  ❌ 视频生成失败:`, error);
    throw error;
  }
}

/**
 * 异步生成图片
 */
async function generateImageAsync(task: AsyncMediaTask): Promise<void> {
  console.log(`🖼️  开始生成图片: ${task.topic}`);
  
  try {
    // 使用 Gemini 生成图片 prompt 并调用 JUXIN API
    const { content, imageResult } = await generateImageContentAndCreate({
      topic: task.topic,
      domain: task.domain as any,
      moduleType: task.moduleType,
      context: {
        imageStyle: task.domain === 'SCIENCE' ? 'diagram' : 
                    task.domain === 'MATH' ? 'illustration' : 'photorealistic'
      }
    });

    console.log(`  ✅ 图片 Prompt 生成成功`);

    if (imageResult.success && imageResult.imageData) {
      console.log(`  ✅ 图片生成成功！大小: ${Math.round(imageResult.imageData.length / 1024)} KB`);

      // 将 Base64 图片转换为 Data URL
      const dataUrl = `data:${imageResult.mimeType};base64,${imageResult.imageData}`;

      // 更新模块内容（使用 image 类型，不显示技术细节）
      const moduleContent = {
        type: 'image',
        title: content.title,
        image_data: dataUrl,
        description: '' // 不显示描述文字，让图片自己说话
      };

      const versionId = uuidv4();
      versionDB.create(
        versionId,
        task.moduleId,
        '图片生成完成',
        JSON.stringify(moduleContent)
      );

      console.log(`  💾 模块内容已更新`);

    } else {
      throw new Error(`图片生成失败: ${imageResult.error}`);
    }

  } catch (error) {
    console.error(`  ❌ 图片生成失败:`, error);
    throw error;
  }
}

/**
 * 更新模块为错误状态
 */
async function updateModuleWithError(moduleId: string, mediaType: string, errorMessage: string): Promise<void> {
  const errorContent = {
    type: 'text',
    title: `${mediaType === 'video' ? '视频' : '图片'}生成失败`,
    body: `抱歉，${mediaType === 'video' ? '视频' : '图片'}生成遇到错误。\n\n错误信息：${errorMessage}\n\n请稍后重试或联系管理员。`
  };

  const versionId = uuidv4();
  versionDB.create(
    versionId,
    moduleId,
    `${mediaType}生成失败`,
    JSON.stringify(errorContent)
  );

  console.log(`  ⚠️  模块已更新为错误状态`);
}

/**
 * 创建占位内容（立即返回）
 */
export function createMediaPlaceholder(type: 'video' | 'image', topic: string): any {
  if (type === 'video') {
    return {
      type: 'video',
      title: `${topic} - Video`,
      video_url: '',
      thumbnail_url: '',
      description: '',
      generation_status: 'queued'  // Track status
    };
  } else {
    return {
      type: 'image',
      title: `${topic} - Illustration`,
      image_url: '',
      image_data: '',
      description: '',
      generation_status: 'queued'  // Track status
    };
  }
}

/**
 * 获取队列状态（用于调试）
 */
export function getQueueStatus(): { queueLength: number; isProcessing: boolean } {
  return {
    queueLength: taskQueue.length,
    isProcessing
  };
}

