/**
 * Gemini HTML 动画生成器
 * 
 * 功能：
 * - 根据学习主题生成自动播放的 HTML 动画
 * - 支持 CSS3 动画、Canvas 动画、SVG 动画
 * - 适用于过程演示、概念讲解、算法可视化
 * 
 * 与交互应用的区别：
 * - 交互应用：需要用户操作（拖拽、调参、点击）
 * - HTML 动画：自动播放，展示过程，无需交互
 * 
 * 使用模型：Gemini 3 Flash
 */

import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAw4tkBsTJYW0kYhkoGMX5RBCyt_EzJpPI';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ============ 类型定义 ============

export interface AnimationGenerationInput {
  topic: string;                       // 主题
  domain: 'SCIENCE' | 'MATH' | 'LANGUAGE' | 'LIBERAL_ARTS' | 'GENERAL';
  animationType?: 'algorithm' | 'physics' | 'chemistry' | 'biology' | 'process' | 'concept';
  context?: {
    learningLevel?: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;                 // 动画时长（秒）
    style?: 'minimalist' | 'colorful' | 'professional' | 'playful';
    keyPoints?: string[];              // 需要强调的关键点
  };
}

export interface AnimationGenerationOutput {
  title: string;                       // 动画标题（中英双语）
  html_content: string;                // 完整的 HTML 动画代码
  description: string;                 // 动画描述（中文）
  educational_purpose: string;         // 教育目的
  animation_features: string[];        // 动画特点（3-5个）
  key_frames: string[];                // 关键帧描述（3-5个）
}

// ============ 核心函数 ============

/**
 * 生成 HTML 动画
 */
export async function generateAnimation(
  input: AnimationGenerationInput
): Promise<AnimationGenerationOutput> {
  const { topic, domain, animationType, context } = input;

  // 领域描述
  const domainDescriptions: Record<string, string> = {
    SCIENCE: '自然科学（物理、化学、生物）',
    MATH: '数学（算法、函数、几何）',
    LANGUAGE: '语言学习（词汇演化、语法结构）',
    LIBERAL_ARTS: '人文社科（历史演变、文化传播）',
    GENERAL: '通识知识'
  };

  // 动画类型提示
  const animationTypeHints: Record<string, string> = {
    algorithm: '算法可视化 - 排序、搜索、遍历等算法的逐步演示',
    physics: '物理过程 - 力学、光学、电磁等物理现象的动态展示',
    chemistry: '化学反应 - 分子运动、反应过程、状态变化',
    biology: '生物过程 - 细胞分裂、光合作用、血液循环',
    process: '过程演示 - 任何需要分步展示的过程',
    concept: '概念讲解 - 抽象概念的可视化'
  };

  const learningLevel = context?.learningLevel || 'intermediate';
  const duration = context?.duration || 15;  // 默认 15 秒
  const style = context?.style || 'professional';

  // 系统指令
  const systemInstruction = `你是 Axiom 的 HTML 动画生成专家，请参考雾象 AI 的电影级质量标准。

你的任务：生成电影级质量的自动播放教育动画（HTML 格式）。

【核心原则】
1. **电影级视觉** - 精美的设计、柔和的阴影、专业的配色
2. **流畅动画** - 使用 cubic-bezier 缓动、细腻的 timing
3. **完整叙事** - 开场介绍 → 过程演示 → 结束总结
4. **双语字幕** - 每个步骤都有中英文说明
5. **自包含** - 单个 HTML 文件，包含所有 CSS 和 JavaScript

【必须包含的设计元素】参考雾象 AI 风格：

1. **16:9 舞台容器**：
   - 白色卡片（background: #ffffff）
   - 圆角 24px，深度阴影
   - 装饰性背景圆圈（blur(60px)，半透明）

2. **CSS 变量配色**：
   - --primary-blue: #74c0fc（主色）
   - --active-orange: #ff8787（比较/操作中）
   - --sorted-green: #69db7c（已完成）
   - --text-main: #343a40，--text-sub: #868e96

3. **顶部标题栏**：
   - 左侧：标题 + 彩色竖条装饰（::before，8px 宽，蓝色）
   - 右侧：状态徽章（圆角 20px，灰色背景）
   - padding: 30px 40px

4. **底部字幕区**（120px 高）：
   - 渐变背景：linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)
   - 中文字幕：20px，600 字重
   - 英文字幕：14px，400 字重
   - 淡入淡出：opacity + translateY(10px) 动画

5. **底部进度条**：
   - 4px 高，蓝色，平滑动画

6. **动画技术**：
   - transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1)
   - 颜色 + 阴影 + 缩放（scale 1.05）的组合
   - 微妙的视觉反馈

技术要求：
1. **完整的 HTML 文件**：
   - <!DOCTYPE html> 开头
   - 包含 <style> 标签（所有 CSS）
   - 包含 <script> 标签（所有 JavaScript）
   - 可以使用 Tailwind CDN（如需）

2. **响应式设计**：
   - 适配不同屏幕尺寸
   - 使用相对单位（%、vw、vh、rem）

3. **动画设计**：
   - 流畅的过渡效果
   - 清晰的视觉层次
   - 适当的速度（不要太快或太慢）
   - 循环播放（infinite loop）

4. **教育元素**：
   - 清晰的标签和说明文字
   - 关键步骤的高亮显示
   - 可选的旁白文字（逐步显示）

设计风格：
- minimalist: 简洁、黑白、线条
- colorful: 鲜艳、活泼、多彩
- professional: 专业、商务、现代
- playful: 趣味、卡通、可爱

动画示例：

【叙事结构】必须包含：

**开场（2-4 句双语字幕）**：
- "欢迎！今天我们将学习..."
- 介绍核心概念
- 说明基本原理

**过程演示**（每步都有双语字幕）：
- 详细讲解每个关键步骤
- 视觉高亮 + 文字说明同步
- 适当停顿让用户理解

**结束（2-3 句）**：
- "完成！这就是..."
- 总结核心概念
- 结束语

【参考：雾象 AI 的冒泡排序风格】

必须参考这个高质量示例：
- 16:9 舞台，白色卡片，圆角 24px
- 两个模糊装饰圆（300px 蓝色，400px 橙色，blur(60px)）
- 顶部：标题（带左侧蓝色竖条）+ 状态徽章
- 柱状图：宽 60px，间距 40px，底部对齐
- 比较时：橙色（#ff8787）+ 放大（scale 1.05）+ 橙色阴影
- 交换时：平滑 translateX (0.6s cubic-bezier)
- 完成时：绿色（#69db7c）+ 透明度 0.8
- 底部字幕：渐变背景，中英文双语，淡入淡出
- 进度条：4px 蓝色
- 结束：依次跳动庆祝（translateY -20px）
- 完整的开场、过程、结束叙事

【代码模块化结构】

\`\`\`javascript
// --- 1. 配置与数据 ---
const dataset = [...];
const SPEED = { intro: 2000, swap: 800, compare: 1000, pause: 1200 };

// --- 2. 初始化函数 ---
function init() { ... }

// --- 3. 辅助工具函数 ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function say(cn, en, duration) { ... }  // 双语字幕
function setStatus(text) { ... }               // 状态更新
function highlight(idx1, idx2, type) { ... }   // 高亮
function updateProgress(percent) { ... }       // 进度条

// --- 4. 核心逻辑 ---
async function runAnimation() {
  // 开场
  await say("欢迎！...", "Welcome!...", 3000);
  
  // 过程
  for (...) {
    await say("步骤说明...", "Step description...");
    // 动画效果
  }
  
  // 结束
  await say("完成！", "Complete!", 3000);
}

// --- 启动程序 ---
window.onload = () => { init(); setTimeout(runAnimation, 1000); };
\`\`\`

【质量标准】

参考雾象 AI，代码必须包含：
✅ CSS 变量配色系统
✅ 16:9 舞台容器
✅ 装饰性背景元素（模糊圆）
✅ 顶部标题栏（带装饰）+ 状态徽章
✅ 底部字幕区（渐变背景 + 双语）
✅ 底部进度条（4px）
✅ 详细的中文注释
✅ 流畅的缓动函数（cubic-bezier）
✅ 微妙的视觉反馈（缩放、阴影）
✅ 完整的叙事结构（开场 → 过程 → 结束）
✅ 庆祝动画（结束时）

输出 JSON 格式，html_content 字段包含完整的电影级质量 HTML 代码。`;

  const userPrompt = `
请为以下主题生成一个自动播放的教育动画（HTML 格式）：

📚 主题：${topic}
🎓 领域：${domainDescriptions[domain]}
🎬 动画类型：${animationTypeHints[animationType || 'concept'] || '概念讲解'}
📊 学习水平：${learningLevel}
⏱️  动画时长：约 ${duration} 秒
🎨 视觉风格：${style}
${context?.keyPoints ? `🔍 关键点：${context.keyPoints.join(', ')}` : ''}

要求：
1. 生成完整的、自包含的 HTML 文件
2. 动画自动播放，循环展示
3. 使用合适的动画技术（CSS3/Canvas/SVG）
4. 清晰的视觉效果和教育价值
5. 响应式设计，适配移动端
6. 包含简短的文字说明（如需要）

动画设计建议：
- 明亮的背景（白色或浅色）
- 清晰的视觉层次
- 流畅的过渡效果
- 关键步骤的标注
- 循环播放，展示完整过程

示例参考：
- 算法类：用彩色条形图展示排序过程，带数字标签
- 物理类：用 Canvas 绘制运动轨迹，带矢量箭头
- 化学类：用 SVG 圆圈表示原子/分子，带连线和标签
- 生物类：用动画展示细胞过程，带颜色编码

生成 JSON 输出。
  `.trim();

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: '动画标题（中英双语）' },
      html_content: { type: Type.STRING, description: '完整的 HTML 动画代码（自包含，可直接在浏览器打开）' },
      description: { type: Type.STRING, description: '动画描述（中文，说明这个动画展示什么）' },
      educational_purpose: { type: Type.STRING, description: '教育目的（这个动画想让学生理解什么）' },
      animation_features: { type: Type.ARRAY, items: { type: Type.STRING }, description: '动画特点（3-5个，如"循环播放"、"颜色编码"等）' },
      key_frames: { type: Type.ARRAY, items: { type: Type.STRING }, description: '关键帧描述（3-5个，描述动画的主要阶段）' }
    },
    required: ['title', 'html_content', 'description', 'educational_purpose', 'animation_features', 'key_frames']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,
        maxOutputTokens: 8192,  // 增大以容纳完整的 HTML 代码
        candidateCount: 1
      },
    });

    const data = JSON.parse(response.text) as AnimationGenerationOutput;
    return data;
  } catch (error) {
    console.error('❌ 生成动画失败:', error);
    throw error;
  }
}

/**
 * 生成动画并保存为 HTML 文件
 */
export async function generateAnimationAndSave(
  input: AnimationGenerationInput,
  filename: string
): Promise<AnimationGenerationOutput> {
  const animation = await generateAnimation(input);
  
  // 保存 HTML 文件
  const fs = require('fs');
  fs.writeFileSync(filename, animation.html_content);
  console.log(`💾 动画已保存: ${filename}`);
  
  return animation;
}

/**
 * 批量生成多个动画
 */
export async function generateMultipleAnimations(
  inputs: AnimationGenerationInput[]
): Promise<AnimationGenerationOutput[]> {
  const results: AnimationGenerationOutput[] = [];

  for (const input of inputs) {
    console.log(`\n🎬 生成动画: ${input.topic}`);
    try {
      const animation = await generateAnimation(input);
      results.push(animation);
      console.log('✅ 完成');
    } catch (error) {
      console.error('❌ 失败:', error);
    }
  }

  return results;
}

