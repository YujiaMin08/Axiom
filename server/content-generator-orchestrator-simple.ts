/**
 * 内容生成协调器（简化版）
 * 
 * 统一调度所有 12 个 AI 生成器
 * 渐进式集成：先实现核心功能，后续逐步完善
 */

import { ContentJSON } from './types';
import { generateModulePlanWithGemini } from './gemini-planner.js';
import { queueAsyncMediaGeneration, createMediaPlaceholder } from './async-media-generator.js';

// ============ 类型定义 ============

export interface ModulePlan {
  type: string;
  title: string;
}

export interface GenerationContext {
  topic: string;
  domain: string;
  moduleType: string;
  userPrompt?: string;
  previousModules?: any[];
  moduleId?: string;  // 用于异步更新
  language?: 'en' | 'zh';  // 内容语言设置
}

// ============ 核心函数 ============

/**
 * 1. 使用真实的 Gemini Planner 生成模块计划
 */
export async function generateModulePlan(topic: string, domain: string, language: 'en' | 'zh' = 'en'): Promise<ModulePlan[]> {
  console.log(`📋 调用 Gemini Planner: topic="${topic}", domain="${domain}", language="${language}"`);
  
  try {
    const result = await generateModulePlanWithGemini(topic, domain, language);
    console.log(`✅ Planner 生成了 ${result.module_plan.length} 个模块`);
    
    return result.module_plan.map(m => ({
      type: m.type,
      title: m.title
    }));

  } catch (error) {
    console.error('❌ Gemini Planner 失败，使用降级方案:', error);
    return getFallbackPlan(topic, domain);
  }
}

/**
 * 2. 根据模块类型生成内容（渐进式集成）
 */
export async function generateModuleContent(context: GenerationContext): Promise<ContentJSON> {
  const { topic, domain, moduleType, userPrompt } = context;

  console.log(`🎨 生成内容: type="${moduleType}", topic="${topic}"`);

  try {
    // 优先尝试使用真实的生成器
    return await generateWithRealAI(context);
    
  } catch (error) {
    console.error(`❌ AI 生成失败 (${moduleType}):`, error);
    console.error('错误详情:', (error as Error).stack);
    
    // 降级：返回简单的文本内容
    return {
      type: 'text',
      title: `${topic} - ${moduleType}`,
      body: `**主题**: ${topic}\n\n**类型**: ${moduleType}\n\n内容生成中，请稍候..._\n\n_（AI 生成器临时不可用，已记录错误日志）_`
    };
  }
}

/**
 * 使用真实的 AI 生成器
 */
async function generateWithRealAI(context: GenerationContext): Promise<ContentJSON> {
  const { topic, domain, moduleType, userPrompt, previousModules, language } = context;

  // 构建生成上下文，包含用户的编辑提示和语言设置
  const generatorContext = {
    ...(userPrompt ? { user_refinement: userPrompt } : {}),
    ...(language ? { language } : {})
  };

  // 根据模块类型动态导入并调用对应的生成器
  switch (moduleType) {
    // === 文本类 ===
    case 'definition':
    case 'intuition':
    case 'overview':
    case 'examples': {
      const { generateTextContent } = await import('./gemini-content-generator.js');
      const result = await generateTextContent(
        topic,
        domain,
        { type: moduleType, title: `${topic} - ${moduleType}` },
        generatorContext
      );
      return { type: 'text', title: result.title, body: result.body };
    }

    // === 故事类 ===
    case 'story': {
      const { generateStoryContent } = await import('./gemini-story-generator.js');
      const result = await generateStoryContent(
        topic,
        domain,
        { type: 'story', title: `${topic} Story` },
        generatorContext
      );
      
      // Format bilingual story with proper alignment
      let body = `## ${result.key_sentence}\n\n`;
      
      // Split both English and Chinese into sentences
      const enSentences = result.narrative_text.split('. ').filter(s => s.trim());
      const cnSentences = result.chinese_translation?.split('。').filter(s => s.trim()) || [];
      
      // Create parallel text
      for (let i = 0; i < Math.max(enSentences.length, cnSentences.length); i++) {
        if (enSentences[i]) {
          body += `${enSentences[i]}${enSentences[i].endsWith('.') ? '' : '.'}\n\n`;
        }
        if (cnSentences[i]) {
          body += `*${cnSentences[i]}${cnSentences[i].endsWith('。') ? '' : '。'}*\n\n`;
        }
        body += '\n';
      }
      
      if (result.word_highlights && result.word_highlights.length > 0) {
        body += `\n### 关键词汇\n\n${result.word_highlights.join(', ')}`;
      }
      
      return {
        type: 'text',
        title: result.title,
        body
      };
    }

    // === 交互应用类 ===
    case 'interactive_app':
    case 'experiment':
    case 'manipulation':
    case 'game': {
      const { generateSimpleInteractiveApp } = await import('./simple-interactive-generator.js');
      const result = await generateSimpleInteractiveApp(
        topic,
        domain,
        { type: moduleType === 'interactive_app' ? 'interactive_app' : moduleType, title: `${topic} ${moduleType === 'interactive_app' ? 'Interactive App' : moduleType}` },
        generatorContext
      );
      return {
        type: 'interactive_app',
        title: `${topic} - Interactive App`,
        html_content: result.html,
        description: 'Interactive learning application'
      };
    }

    // === 公式类 ===
    case 'formula':
    case 'perspective_mathematics': {
      const { generateFormulaContent } = await import('./gemini-formula-generator.js');
      const result = await generateFormulaContent(
        topic,
        domain,
        { type: moduleType, title: `${topic} Formula` },
        generatorContext
      );
      
      let body = `$$${result.main_formula}$$\n\n${result.formula_explanation || ''}\n\n## 推导步骤\n\n`;
      result.derivation_steps.forEach((step, i) => {
        body += `**步骤 ${step.step_number}**: ${step.description}\n\n$$${step.formula}$$\n\n`;
      });
      
      if (result.symbol_table && result.symbol_table.length > 0) {
        body += `\n## 符号说明\n\n`;
        result.symbol_table.forEach(sym => {
          body += `- $${sym.symbol}$: ${sym.meaning}${sym.unit ? ` (${sym.unit})` : ''}\n`;
        });
      }
      
      return { type: 'text', title: result.title, body };
    }

    // === Quiz 类 ===
    case 'quiz':
    case 'challenge': {
      const { generateQuizContent } = await import('./gemini-quiz-generator.js');
      const result = await generateQuizContent(
        topic,
        domain,
        { type: moduleType, title: `${topic} Quiz` },
        { generated_modules: previousModules || [] }  // 传递上下文
      );
      
      return {
        type: 'quiz',
        title: result.title,
        questions: result.questions.map(q => ({
          question: q.question,
          options: q.options,
          answer_index: q.answer_index,
          explanation: q.explanation
        }))
      };
    }

    // === 跨学科视角类 ===
    case 'perspective_physics':
    case 'perspective_chemistry':
    case 'perspective_biology':
    case 'perspective_history':
    case 'perspective_culture':
    case 'perspective_philosophy':
    case 'perspective_economics':
    case 'perspective_sociology': {
      const { generatePerspectiveContent } = await import('./gemini-perspective-generator.js');
      const discipline = moduleType.replace('perspective_', '');
      
      // 调用生成器，传递正确的参数
      const result = await generatePerspectiveContent(
        topic,                    // topic
        domain,                   // domain
        {                        // modulePlan
          type: moduleType,
          title: `${discipline} Perspective`
        },
        generatorContext         // context (包含用户编辑提示)
      );
      
      let body = `## ${result.lens_description}\n\n${result.main_explanation}\n\n### 关键概念\n\n`;
      result.key_concepts.forEach(c => body += `- **${c}**\n`);
      
      return { type: 'text', title: result.title, body };
    }

    // === 场景类 ===
    case 'scenario': {
      const { generateScenarioContent } = await import('./gemini-scenario-generator.js');
      
      // 调用生成器，传递正确的参数
      const result = await generateScenarioContent(
        topic,                    // topic
        {                        // modulePlan
          type: 'scenario',
          title: `${topic} Scenario`
        },
        {                        // context (可选)
          difficulty_level: 'beginner'
        }
      );
      
      // 返回实时对话格式
      return {
        type: 'interactive_app',
        title: result.title,
        app_data: {
          type: 'realtime_scenario',
          topic: topic,
          initial_setting: result.setting.location + ' - ' + result.setting.context
        },
        description: 'Real-time interactive conversation practice'
      };
    }

    // === 对比类 ===
    case 'comparison': {
      const { generateComparisonContent } = await import('./gemini-comparison-generator.js');
      
      // 调用生成器，传递正确的参数
      const result = await generateComparisonContent(
        topic,                    // topic
        domain,                   // domain
        {                        // modulePlan
          type: 'comparison',
          title: `${topic} Comparison`
        },
        {                        // context (可选)
          items_to_compare: userPrompt ? extractComparisonItems(userPrompt) : undefined
        }
      );
      
      // Return as interactive app with structured comparison data
      return { 
        type: 'interactive_app', 
        title: result.title, 
        app_data: {
          type: 'comparison_table',
          ...result
        },
        description: `对比 ${result.items_compared.join(' vs ')}`
      };
    }

    // === HTML 动画类 ===
    case 'animation':
    case 'visualization': {
      const { generateAnimation } = await import('./gemini-animation-generator.js');
      const result = await generateAnimation({
        topic,
        domain: domain as any,
        animationType: inferAnimationType(topic, domain),
        context: { 
          duration: 15, 
          style: 'colorful',
          user_refinement: userPrompt,  // 传递用户编辑提示
          language  // 传递语言设置
        }
      });
      
      return {
        type: 'html_animation',
        title: result.title,
        html_content: result.html_content,
        description: result.description
      };
    }

    // === 视频（异步生成）===
    case 'video': {
      // 立即返回占位内容
      const placeholder = createMediaPlaceholder('video', topic);
      
      // 如果提供了 moduleId，将任务加入异步队列
      if (context.moduleId) {
        console.log(`  🔄 视频任务已加入后台队列`);
        queueAsyncMediaGeneration({
          moduleId: context.moduleId,
          type: 'video',
          topic,
          domain,
          moduleType
        });
      }
      
      return placeholder;
    }

    // === 图片（异步生成）===
    case 'image':
    case 'illustration': {
      // 立即返回占位内容
      const placeholder = createMediaPlaceholder('image', topic);
      
      // 如果提供了 moduleId，将任务加入异步队列
      if (context.moduleId) {
        console.log(`  🔄 图片任务已加入后台队列`);
        queueAsyncMediaGeneration({
          moduleId: context.moduleId,
          type: 'image',
          topic,
          domain,
          moduleType
        });
      }
      
      return placeholder;
    }

    // === 默认 ===
    default: {
      const { generateTextContent } = await import('./gemini-content-generator.js');
      const result = await generateTextContent(
        topic,
        domain,
        { type: 'overview', title: `${topic} Overview` },
        generatorContext
      );
      return { type: 'text', title: result.title, body: result.body };
    }
  }
}

// ============ 辅助函数 ============

function extractComparisonItems(prompt: string): string[] | undefined {
  const vsMatch = prompt.match(/(.+)\s+vs\.?\s+(.+)/i);
  if (vsMatch) return [vsMatch[1].trim(), vsMatch[2].trim()];
  
  const andMatch = prompt.match(/(.+)\s+和\s+(.+)/);
  if (andMatch) return [andMatch[1].trim(), andMatch[2].trim()];
  
  return undefined;
}

function inferAnimationType(topic: string, domain: string): 'algorithm' | 'physics' | 'chemistry' | 'biology' | 'process' | 'concept' {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.match(/sort|search|algorithm|排序|搜索/)) return 'algorithm';
  if (lowerTopic.match(/motion|force|energy|wave|运动|力|能量/)) return 'physics';
  if (lowerTopic.match(/reaction|molecule|atom|反应|分子/)) return 'chemistry';
  if (lowerTopic.match(/cell|photosynthesis|细胞|光合/)) return 'biology';
  if (lowerTopic.match(/cycle|process|循环|过程/)) return 'process';
  
  if (domain === 'SCIENCE') return 'process';
  if (domain === 'MATH') return 'algorithm';
  
  return 'concept';
}

function getFallbackPlan(topic: string, domain: string): ModulePlan[] {
  console.log('⚠️ 使用降级方案生成模块计划');
  
  const plans: ModulePlan[] = [
    { type: 'definition', title: `什么是${topic}` },
    { type: 'intuition', title: `直觉理解${topic}` }
  ];

  if (domain === 'SCIENCE') {
    plans.push({ type: 'experiment', title: `${topic}实验` });
  } else if (domain === 'MATH') {
    plans.push({ type: 'formula', title: `${topic}公式` });
  } else if (domain === 'LANGUAGE') {
    plans.push({ type: 'story', title: `${topic}故事` });
  }

  plans.push({ type: 'quiz', title: `${topic}测验` });

  return plans;
}

export function planNewModule(prompt: string, domain: string): ModulePlan {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('quiz') || lowerPrompt.includes('测验')) {
    return { type: 'quiz', title: '知识测验' };
  }
  if (lowerPrompt.includes('story') || lowerPrompt.includes('故事')) {
    return { type: 'story', title: '相关故事' };
  }
  if (lowerPrompt.includes('experiment') || lowerPrompt.includes('实验')) {
    return { type: 'experiment', title: '互动实验' };
  }
  if (lowerPrompt.includes('formula') || lowerPrompt.includes('公式')) {
    return { type: 'formula', title: '数学公式' };
  }
  if (lowerPrompt.includes('animation') || lowerPrompt.includes('动画')) {
    return { type: 'animation', title: '动画演示' };
  }
  if (lowerPrompt.includes('比较') || lowerPrompt.includes('对比')) {
    return { type: 'comparison', title: '对比分析' };
  }

  return { type: 'overview', title: '补充说明' };
}

