/**
 * 聚鑫视频生成服务 (Sora2)
 * 
 * 功能：
 * - 创建视频生成任务
 * - 查询任务状态
 * - 轮询等待任务完成
 */

const JUXIN_BASE_URL = 'https://api.jxincm.cn';
const JUXIN_API_KEY = process.env.JUXIN_API_KEY;
if (!JUXIN_API_KEY) {
  throw new Error('JUXIN_API_KEY environment variable is required. Please set it in your .env file.');
}

interface VideoCreateParams {
  prompt: string;
  images?: string[];
  orientation?: 'portrait' | 'landscape';
  size?: 'small' | 'large';
  duration?: number;
  watermark?: boolean;
  private?: boolean;
}

interface VideoCreateResponse {
  id: string;
  status: string;
  [key: string]: any;
}

interface VideoQueryResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  detail?: {
    url?: string;
    draft_info?: {
      encodings?: {
        source?: {
          path?: string;
        };
      };
    };
  };
  [key: string]: any;
}

/**
 * 创建视频生成任务
 */
export async function createVideoTask(params: VideoCreateParams): Promise<VideoCreateResponse> {
  const {
    prompt,
    images = [],
    orientation = 'landscape',
    size = 'large',
    duration = 10,
    watermark = false,
    private: isPrivate = true
  } = params;

  const requestBody = {
    images,
    model: 'sora-2',
    orientation,
    prompt,
    size,
    duration,
    watermark,
    private: isPrivate
  };

  console.log('📹 创建视频任务...');
  console.log('提示词:', prompt);
  console.log('参数:', { orientation, size, duration });

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
    const response = await fetch(`${JUXIN_BASE_URL}/v1/video/query?id=${taskId}`, {
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
 * 从响应中提取视频 URL（多种可能的位置）
 */
function extractVideoUrl(data: VideoQueryResponse): string | null {
  // 优先级 1: data.video_url
  if (data.video_url) {
    return data.video_url;
  }

  // 优先级 2: data.detail.url
  if (data.detail?.url) {
    return data.detail.url;
  }

  // 优先级 3: data.detail.draft_info.encodings.source.path
  if (data.detail?.draft_info?.encodings?.source?.path) {
    return data.detail.draft_info.encodings.source.path;
  }

  return null;
}

/**
 * 从响应中提取缩略图 URL
 */
function extractThumbnailUrl(data: VideoQueryResponse): string | null {
  return data.thumbnail_url || null;
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
  const { intervalMs = 2000, timeoutMs = 180000 } = options; // 默认 2s 轮询，3 分钟超时

  // 1. 创建任务
  const createResult = await createVideoTask(params);
  const taskId = createResult.id;

  console.log('⏳ 开始轮询任务状态...');
  console.log(`轮询间隔: ${intervalMs}ms, 超时时间: ${timeoutMs}ms`);

  const startTime = Date.now();
  let attemptCount = 0;

  while (true) {
    attemptCount++;
    const elapsed = Date.now() - startTime;

    // 检查超时
    if (elapsed >= timeoutMs) {
      console.log('⏰ 超时！已等待', elapsed, 'ms');
      return {
        taskId,
        status: 'timeout',
        error: 'timeout'
      };
    }

    // 等待
    await new Promise(resolve => setTimeout(resolve, intervalMs));

    // 查询状态
    try {
      const queryResult = await queryVideoTask(taskId);
      console.log(`[${attemptCount}] 状态:`, queryResult.status, `(已等待 ${Math.round(elapsed / 1000)}s)`);

      if (queryResult.status === 'completed') {
        const videoUrl = extractVideoUrl(queryResult);
        const thumbUrl = extractThumbnailUrl(queryResult);

        console.log('🎉 视频生成完成！');
        console.log('视频 URL:', videoUrl);
        console.log('缩略图 URL:', thumbUrl);

        return {
          taskId,
          status: 'completed',
          videoUrl: videoUrl || undefined,
          thumbUrl: thumbUrl || undefined
        };
      }

      if (queryResult.status === 'failed') {
        console.log('❌ 任务失败');
        return {
          taskId,
          status: 'failed',
          error: 'Task failed'
        };
      }

      // 继续轮询（pending 状态）
    } catch (error) {
      console.error('查询出错:', error);
      // 继续尝试
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

  return {
    taskId,
    status: data.status,
    videoUrl: extractVideoUrl(data) || undefined,
    thumbUrl: extractThumbnailUrl(data) || undefined,
    raw: data
  };
}

