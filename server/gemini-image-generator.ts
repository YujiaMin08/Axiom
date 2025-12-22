/**
 * Gemini 图片内容生成器 (AI 提示词包装层)
 * 
 * 功能：
 * - 使用 Gemini AI 智能生成高质量的图片提示词
 * - 针对教育场景优化
 * - 支持不同领域和模块类型
 * 
 * 使用场景：
 * - 为故事生成配图
 * - 为科学概念生成示意图
 * - 为语言学习生成场景图
 */

import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ============ 类型定义 ============

export interface ImageGenerationInput {
  topic: string;                       // 主题
  domain: 'LANGUAGE' | 'SCIENCE' | 'MATH' | 'LIBERAL_ARTS' | 'GENERAL';
  moduleType?: string;                 // 模块类型（story, experiment, definition等）
  context?: {
    learningLevel?: 'beginner' | 'intermediate' | 'advanced';
    imageStyle?: 'photorealistic' | 'illustration' | 'diagram' | 'cartoon' | 'minimalist';
    focusElements?: string[];          // 需要突出的关键元素
  };
}

export interface ImageGenerationOutput {
  title: string;                       // 图片标题（中英双语）
  prompt: string;                      // 图片生成 prompt（英文，详细描述）
  aspectRatio: string;                 // 推荐的宽高比
  imageSize: '2K';                     // 推荐的清晰度（固定为2K）
  educational_purpose: string;         // 教育目的
  description: string;                 // 场景描述（中文）
  key_visual_elements: string[];       // 关键视觉元素（3-5个）
  style_keywords: string[];            // 风格关键词
}

// ============ 核心函数 ============

/**
 * 生成图片内容（仅生成 prompt，不调用图片生成API）
 */
export async function generateImageContent(
  input: ImageGenerationInput
): Promise<ImageGenerationOutput> {
  const { topic, domain, moduleType, context } = input;

  // 领域描述
  const domainDescriptions: Record<string, string> = {
    LANGUAGE: '语言学习（词汇、语法、场景对话）',
    SCIENCE: '自然科学（物理、化学、生物）',
    MATH: '数学（概念、公式、图形）',
    LIBERAL_ARTS: '人文社科（历史、文化、艺术）',
    GENERAL: '通识知识'
  };

  // 模块类型提示
  const moduleTypeHints: Record<string, string> = {
    story: '故事插图 - 需要生动、有情节感的场景',
    experiment: '实验/互动 - 需要清晰的操作步骤或过程展示',
    definition: '定义 - 需要简洁的视觉表达',
    intuition: '直觉理解 - 需要隐喻性的视觉比喻',
    overview: '概览 - 需要宏观的全景视角',
    examples: '示例 - 需要具体的实例展示',
    formula: '公式 - 需要图形化的数学表示',
    perspective_physics: '物理视角 - 需要物理过程的可视化',
    perspective_chemistry: '化学视角 - 需要分子/反应的可视化',
    perspective_biology: '生物视角 - 需要生物结构/过程的可视化'
  };

  // 学习水平
  const learningLevel = context?.learningLevel || 'intermediate';

  // 系统指令
  const systemInstruction = `你是 Axiom 的图片内容生成专家。

你的任务：为教育场景生成高质量的图片 prompt。

核心原则：
1. **教育性优先**：每张图片都要有明确的教育目的
2. **视觉清晰**：描述要具体、可视化、易理解
3. **风格适配**：根据内容选择合适的视觉风格
4. **高质量提示词**：使用专业的图片生成术语

Prompt 写作技巧：
- ✅ 好的 prompt：
  "A detailed cross-section illustration of a plant leaf showing the process of photosynthesis, 
   with labeled chloroplasts in green, sunlight rays entering from top, CO2 molecules shown as 
   blue dots entering through stomata, O2 bubbles releasing, educational diagram style, 
   clear scientific illustration, high detail, white background"
  
- ❌ 差的 prompt：
  "photosynthesis"

Prompt 构成要素：
1. **主体**：What（描述什么内容）
2. **细节**：Details（具体的视觉特征、颜色、形状）
3. **风格**：Style（视觉风格、艺术手法）
4. **质量**：Quality（高质量、专业、清晰等）

推荐的视觉风格：
- 科学概念：scientific illustration, cross-section view, labeled diagram
- 故事场景：storybook illustration, colorful, narrative scene
- 真实照片：photorealistic, natural lighting, high quality photography
- 抽象概念：symbolic imagery, minimalist design, conceptual art
- 语言学习：everyday scene, realistic, clear context

宽高比选择：
- 16:9 (横屏)：风景、全景、多对象场景
- 4:3：传统插图、教育图表
- 1:1：单一对象、图标、头像
- 9:16 (竖屏)：人物、建筑、移动设备展示

清晰度：
- 统一使用 2K（约2048px）作为标准清晰度
- 平衡质量和生成速度，适合教育场景

输出 JSON 格式。`;

  const userPrompt = `
请为以下学习内容生成一张教育图片的 prompt：

📚 主题：${topic}
🎓 领域：${domainDescriptions[domain]}
📦 模块类型：${moduleTypeHints[moduleType || ''] || moduleType || '通用'}
📊 学习水平：${learningLevel}
${context?.imageStyle ? `🎨 风格偏好：${context.imageStyle}` : ''}
${context?.focusElements ? `🔍 重点元素：${context.focusElements.join(', ')}` : ''}

要求：
1. Prompt 必须是英文，具体描述视觉内容
2. 适合教育场景（清晰、准确、易理解）
3. 包含足够的细节（颜色、布局、元素位置）
4. 风格要适合学习内容
5. 考虑图片的教育价值

示例参考：
- 光合作用：A detailed botanical illustration showing a plant leaf cross-section during photosynthesis, 
  chloroplasts visible as green oval structures containing grana stacks, sunlight rays shown as yellow 
  arrows entering the leaf, CO2 molecules as small blue circles entering through stomata pores, 
  glucose molecules forming inside chloroplasts, O2 bubbles releasing, educational scientific diagram, 
  clear labels, soft colors, white background, high detail
  
- 咖啡店场景：A cozy cafe interior scene, wooden counter in foreground, friendly barista with apron 
  standing behind espresso machine, customer approaching with a smile, natural lighting through 
  large windows, warm atmosphere, realistic photography style, clear details, modern cafe design
  
- 牛顿第一定律：A split-screen illustration showing Newton's first law, left side: ice hockey puck 
  gliding smoothly on frictionless ice surface with motion lines, right side: same puck suddenly 
  stopped by rough surface friction, educational physics diagram, clear arrows indicating forces, 
  simple colors, clean design

生成 JSON 输出。
  `.trim();

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: '图片标题（中英双语）' },
      prompt: { type: Type.STRING, description: '图片生成 prompt（英文，具体描述视觉内容）' },
      aspectRatio: { type: Type.STRING, description: '推荐的宽高比：1:1, 4:3, 16:9, 9:16 等' },
      imageSize: { type: Type.STRING, description: '清晰度：固定为 2K', enum: ['2K'] },
      educational_purpose: { type: Type.STRING, description: '教育目的（这张图片想让学生理解什么）' },
      description: { type: Type.STRING, description: '场景描述（中文，帮助前端展示）' },
      key_visual_elements: { type: Type.ARRAY, items: { type: Type.STRING }, description: '关键视觉元素（3-5个）' },
      style_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: '风格关键词（3-5个）' }
    },
    required: ['title', 'prompt', 'aspectRatio', 'imageSize', 'educational_purpose', 'description', 'key_visual_elements', 'style_keywords']
  };

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

    const data = JSON.parse(response.text) as ImageGenerationOutput;
    return data;
  } catch (error) {
    console.error('❌ 生成图片 prompt 失败:', error);
    throw error;
  }
}

/**
 * 生成图片内容并调用 JUXIN API 创建图片
 */
export async function generateImageContentAndCreate(
  input: ImageGenerationInput
): Promise<{ content: ImageGenerationOutput; imageResult: any }> {
  const { generateImage } = await import('./juxin-image-service.js');

  // 步骤 1: 生成 prompt
  const content = await generateImageContent(input);

  // 步骤 2: 调用图片生成 API
  const imageResult = await generateImage({
    prompt: content.prompt,
    aspectRatio: content.aspectRatio,
    imageSize: content.imageSize
  });

  return { content, imageResult };
}

/**
 * 批量生成多个图片内容
 */
export async function generateMultipleImageContents(
  inputs: ImageGenerationInput[]
): Promise<ImageGenerationOutput[]> {
  const results: ImageGenerationOutput[] = [];

  for (const input of inputs) {
    console.log(`\n📸 生成图片 prompt: ${input.topic}`);
    try {
      const content = await generateImageContent(input);
      results.push(content);
      console.log('✅ 完成');
    } catch (error) {
      console.error('❌ 失败:', error);
    }
  }

  return results;
}

