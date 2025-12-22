/**
 * Gemini 视频内容生成器
 * 
 * 功能：
 * - 根据学习主题生成视频 prompt
 * - 生成教育场景的视频描述
 * - 调用聚鑫 API 生成视频
 * 
 * 使用模型：Gemini 3 Flash + Medium Thinking
 */

import { GoogleGenAI, Type } from '@google/genai';
import { createVideoTask, createAndWaitForVideo } from './juxin-video-service.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface VideoGenerationInput {
  topic: string;
  domain: 'LANGUAGE' | 'SCIENCE' | 'GENERAL_KNOWLEDGE';
  moduleType: string;
  context?: {
    previousModules?: any[];
    learningLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface VideoGenerationOutput {
  title: string;
  prompt: string;
  orientation: 'landscape';
  size: 'small' | 'large';
  educational_purpose: string;
  scene_description: string;
  key_visual_elements: string[];
}

/**
 * 生成视频内容（生成 prompt，但不实际调用视频 API）
 */
export async function generateVideoContent(
  input: VideoGenerationInput
): Promise<VideoGenerationOutput> {
  const { topic, domain, moduleType, context } = input;

  const domainDescriptions = {
    LANGUAGE: '语言学习 - 侧重实际场景、对话、文化展示',
    SCIENCE: '科学知识 - 侧重概念可视化、实验过程、自然现象',
    GENERAL_KNOWLEDGE: '通识教育 - 侧重跨学科连接、历史场景、抽象概念'
  };

  const moduleTypeHints = {
    'experiment': '实验过程展示 - 要有具体的实验步骤和现象',
    'visualization': '概念可视化 - 将抽象概念转化为视觉画面',
    'scene': '真实场景 - 展示真实的环境和互动',
    'animation': '动画演示 - 用动画解释复杂过程',
    'demonstration': '操作演示 - 展示具体的操作步骤'
  };

  const learningLevel = context?.learningLevel || 'intermediate';

  const systemInstruction = `你是 Axiom 的视频内容生成专家。

你的任务：为教育场景生成高质量的视频 prompt。

核心原则：
1. **视觉为主**：视频是纯视觉媒体，prompt 要描述具体的画面和动作
2. **教育性**：每个视频都要有明确的教育目的
3. **简洁有力**：10秒视频要传达核心概念
4. **高质量提示词**：使用专业的视频生成术语

Prompt 写作技巧：
- ✅ 好的 prompt：
  "A single plant cell in close-up, chloroplasts visible as green oval structures, sunlight streaming through cell wall, water and CO2 molecules entering, O2 bubbles releasing, time-lapse style, cinematic lighting, educational animation"
  
- ❌ 差的 prompt：
  "photosynthesis process"

Prompt 构成要素：
1. **主体**：What (什么场景/物体)
2. **动作**：Action (发生什么/如何变化)
3. **风格**：Style (视觉风格/拍摄手法)
4. **质量**：Quality (高质量/电影级/4K)

推荐的视觉风格：
- 科学概念：micro-photography, time-lapse, 3D animation
- 历史场景：cinematic, period-accurate, documentary style
- 抽象概念：visual metaphor, symbolic imagery
- 语言学习：everyday scenes, natural lighting, realistic

**CRITICAL**: All videos MUST be landscape (横屏) orientation for optimal desktop viewing.

尺寸选择：
- small (720p)：快速生成、测试用
- large (1080p)：高质量、正式使用

输出 JSON 格式。`;

  const userPrompt = `
请为以下学习内容生成一个 10 秒教育视频的 prompt：

📚 主题：${topic}
🎓 领域：${domainDescriptions[domain]}
📦 模块类型：${moduleTypeHints[moduleType] || moduleType}
📊 学习水平：${learningLevel}

要求：
1. Prompt 必须是英文，具体描述视觉场景
2. 适合 10 秒短视频（要聚焦核心概念）
3. 包含动作/变化（静态画面不适合视频）
4. 风格要适合教育场景
5. 考虑视频的教育价值

示例参考：
- 光合作用：Close-up of a plant leaf, chloroplasts glowing green, sunlight rays visible, CO2 molecules entering through stomata, O2 bubbles releasing, time-lapse, macro photography, scientific visualization
- 牛顿第一定律：Ice hockey puck sliding on ice, smooth glide with no friction, suddenly hitting a rough surface and stopping abruptly, slow motion, cinematic physics demonstration
- 咖啡店点餐：First-person view walking into a cozy cafe, barista smiling behind counter, customer ordering coffee in English, friendly interaction, natural lighting, everyday scene

生成 JSON 输出。
  `.trim();

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: '视频标题（中英双语）'
      },
      prompt: {
        type: Type.STRING,
        description: '视频生成 prompt（英文，具体描述视觉场景）'
      },
      orientation: {
        type: Type.STRING,
        enum: ['landscape'],
        description: '视频方向：必须为 landscape (横屏)'
      },
      size: {
        type: Type.STRING,
        description: '视频尺寸：small 或 large'
      },
      educational_purpose: {
        type: Type.STRING,
        description: '教育目的（这个视频想让学生理解什么）'
      },
      scene_description: {
        type: Type.STRING,
        description: '场景描述（中文，帮助前端展示）'
      },
      key_visual_elements: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '关键视觉元素（3-5个）'
      }
    },
    required: [
      'title',
      'prompt',
      'size',
      'educational_purpose',
      'scene_description',
      'key_visual_elements'
    ]
  };

  console.log('🎬 生成视频 prompt...');
  console.log('主题:', topic);
  console.log('领域:', domain);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,
        candidateCount: 1
      },
    });

    const data = JSON.parse(response.text) as VideoGenerationOutput;

    console.log('✅ 视频 prompt 生成成功');
    console.log('标题:', data.title);
    console.log('Prompt:', data.prompt.substring(0, 100) + '...');
    console.log('方向: landscape (横屏), 尺寸:', data.size);

    // Force orientation to landscape
    return {
      ...data,
      orientation: 'landscape'
    };
  } catch (error) {
    console.error('❌ 生成视频 prompt 失败:', error);
    throw error;
  }
}

/**
 * 生成视频内容并实际生成视频（完整流程）
 */
export async function generateVideoContentAndCreate(
  input: VideoGenerationInput,
  options: {
    autoGenerate?: boolean;  // 是否自动生成视频（默认 false）
    waitForCompletion?: boolean;  // 是否等待生成完成（默认 false）
    intervalMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<{
  content: VideoGenerationOutput;
  video?: {
    taskId: string;
    status: string;
    videoUrl?: string;
    thumbUrl?: string;
  };
}> {
  const {
    autoGenerate = false,
    waitForCompletion = false,
    intervalMs = 5000,
    timeoutMs = 300000
  } = options;

  // 1. 生成 prompt
  const content = await generateVideoContent(input);

  // 2. 如果不自动生成视频，只返回 prompt
  if (!autoGenerate) {
    console.log('💡 仅生成 prompt，不创建视频任务');
    return { content };
  }

  // 3. 创建视频任务
  console.log('🎥 开始创建视频...');
  
  if (waitForCompletion) {
    // 等待完成
    const videoResult = await createAndWaitForVideo(
      {
        prompt: content.prompt,
        orientation: content.orientation,
        size: content.size,
        duration: 10
      },
      { intervalMs, timeoutMs }
    );

    return {
      content,
      video: videoResult
    };
  } else {
    // 只创建任务，不等待
    const taskResult = await createVideoTask({
      prompt: content.prompt,
      orientation: content.orientation,
      size: content.size,
      duration: 10
    });

    return {
      content,
      video: {
        taskId: taskResult.id,
        status: taskResult.status
      }
    };
  }
}

/**
 * 批量生成多个视频 prompt
 */
export async function generateMultipleVideoContents(
  topics: string[],
  domain: 'LANGUAGE' | 'SCIENCE' | 'GENERAL_KNOWLEDGE',
  moduleType: string
): Promise<VideoGenerationOutput[]> {
  console.log(`📹 批量生成 ${topics.length} 个视频 prompt...`);

  const results: VideoGenerationOutput[] = [];

  for (const topic of topics) {
    try {
      const content = await generateVideoContent({
        topic,
        domain,
        moduleType
      });
      results.push(content);
    } catch (error) {
      console.error(`❌ 生成失败: ${topic}`, error);
    }
  }

  console.log(`✅ 成功生成 ${results.length}/${topics.length} 个 prompt`);
  return results;
}
