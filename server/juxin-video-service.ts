/**
 * 聚鑫视频生成服务 (veo3.1-fast)
 * 
 * API 端点：
 * - 创建任务: POST https://api.jxincm.cn/v1/video/create
 * - 查询任务: GET  https://api.jxincm.cn/v1/video/query?id=xxx
 */

const JUXIN_BASE_URL = 'https://api.jxincm.cn';
const JUXIN_API_KEY = process.env.JUXIN_API_KEY;
if (!JUXIN_API_KEY) {
  throw new Error('JUXIN_API_KEY environment variable is required. Please set it in your .env file.');
}

interface VideoCreateParams {
  prompt: string;
  images?: string[];
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  enhance_prompt?: boolean;
  enable_upsample?: boolean;
}

interface VideoCreateResponse {
  id: string;
  status: string;
  [key: string]: any;
}

interface VideoQueryResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  detail?: {
    status?: string;
    video_url?: string;
    url?: string;
    error_message?: string;
  };
  [key: string]: any;
}

/**
 * 创建视频生成任务
 */
export async function createVideoTask(params: VideoCreateParams): Promise<VideoCreateResponse> {
  const {
    prompt,
    images,
    aspect_ratio = '16:9',
    enhance_prompt = true,
    enable_upsample = true
  } = params;

  const requestBody: any = {
    model: 'veo3.1-fast',
    prompt,
    aspect_ratio,
    enhance_prompt,
    enable_upsample
  };

  if (images && images.length > 0) {
    requestBody.images = images;
  }

  console.log('📹 创建视频任务 (veo3.1-fast)...');
  console.log('提示词:', prompt);
  console.log('参数:', { aspect_ratio, enhance_prompt, enable_upsample });

  try {
    const response = await fetch(`${JUXIN_BASE_URL}/v1/video/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${JUXIN_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (errorText.includes('当前分组上游负载已饱和')) {
        throw new Error('VIDEO_SERVICE_BUSY: 视频生成服务当前正忙，请稍后再试。');
      }
      
      throw new Error(`视频任务创建失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 任务创建成功:', data.id);
    
    return data;
  } catch (error) {
    console.error('❌ 创建视频任务失败:', error);
    throw error;
  }
}

/**
 * 查询视频任务状态
 */
export async function queryVideoTask(taskId: string): Promise<VideoQueryResponse> {
  try {
    const response = await fetch(`${JUXIN_BASE_URL}/v1/video/query?id=${encodeURIComponent(taskId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${JUXIN_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`查询任务失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ 查询任务失败:', error);
    throw error;
  }
}

/**
 * 从响应中提取视频 URL
 */
function extractVideoUrl(data: VideoQueryResponse): string | null {
  if (data.video_url) return data.video_url;
  
  const detail = data.detail || data;
  if ((detail as any).video_url) return (detail as any).video_url;
  if ((detail as any).url) return (detail as any).url;

  return null;
}

/**
 * 轮询等待视频生成完成
 */
export async function createAndWaitForVideo(
  params: VideoCreateParams,
  options: {
    intervalMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<{
  taskId: string;
  status: string;
  videoUrl?: string;
  thumbUrl?: string;
  error?: string;
}> {
  const { intervalMs = 5000, timeoutMs = 300000 } = options; // 5s 轮询, 5 分钟超时

  const createResult = await createVideoTask(params);
  const taskId = createResult.id;

  if (!taskId) {
    throw new Error('No task id returned from API');
  }

  console.log('⏳ 开始轮询任务状态...');
  console.log(`任务 ID: ${taskId}`);
  console.log(`轮询间隔: ${intervalMs}ms, 超时时间: ${timeoutMs}ms`);

  const startTime = Date.now();
  let attemptCount = 0;

  while (true) {
    attemptCount++;
    const elapsed = Date.now() - startTime;

    if (elapsed >= timeoutMs) {
      console.log('⏰ 超时！已等待', elapsed, 'ms');
      return { taskId, status: 'timeout', error: 'timeout' };
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));

    try {
      const queryResult = await queryVideoTask(taskId);
      const detail = queryResult.detail || queryResult;
      const status = (detail as any).status || queryResult.status;
      
      console.log(`[${attemptCount}] 状态: ${status} (已等待 ${Math.round(elapsed / 1000)}s)`);

      if (status === 'completed') {
        const videoUrl = extractVideoUrl(queryResult);

        console.log('🎉 视频生成完成！');
        console.log('视频 URL:', videoUrl);

        return {
          taskId,
          status: 'completed',
          videoUrl: videoUrl || undefined,
          thumbUrl: queryResult.thumbnail_url || undefined
        };
      }

      if (status === 'failed') {
        const errorMsg = (detail as any).error_message || queryResult.error_message || 'Task failed';
        console.log('❌ 任务失败:', errorMsg);
        return { taskId, status: 'failed', error: errorMsg };
      }
    } catch (error) {
      console.error(`[${attemptCount}] 查询出错:`, error);
    }
  }
}

/**
 * 获取视频状态（单次查询）
 */
export async function getVideoStatus(taskId: string): Promise<{
  taskId: string;
  status: string;
  videoUrl?: string;
  thumbUrl?: string;
  raw?: any;
}> {
  const data = await queryVideoTask(taskId);
  const detail = data.detail || data;
  const status = (detail as any).status || data.status;

  return {
    taskId,
    status,
    videoUrl: extractVideoUrl(data) || undefined,
    thumbUrl: data.thumbnail_url || undefined,
    raw: data
  };
}
