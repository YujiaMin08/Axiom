import { ContentJSON } from './types';

// 假的 Planner - 用 hardcode 规则引擎先把流程跑通
// 后续会替换成真正的 Gemini 3 Flash Planner

export interface ModulePlan {
  type: string;
  title: string;
}

/**
 * 意图识别结果
 */
export interface IntentAnalysis {
  action: 'NEW_CANVAS' | 'EXPAND_CANVAS';
  topic?: string; // 如果是新 Canvas，提取出的主题
  moduleType?: string; // 如果是扩展，建议的模块类型
}

/**
 * 模拟 AI 判断用户意图
 */
export function analyzeIntent(prompt: string, currentTopic: string): IntentAnalysis {
  const p = prompt.toLowerCase();
  
  // 1. 判断是否想开启新话题
  // 关键词：新、new、switch、about、learn
  if (
    p.includes('新') || 
    p.includes('new') || 
    p.includes('switch') || 
    p.startsWith('about ') ||
    p.startsWith('learn ') ||
    p.length < 5 // 输入很短通常是新主题，如 "apple"
  ) {
    // 提取新主题 (简单的处理：去掉关键词)
    let newTopic = prompt
      .replace(/new canvas/i, '')
      .replace(/new topic/i, '')
      .replace(/switch to/i, '')
      .replace(/learn about/i, '')
      .replace(/新话题/i, '')
      .replace(/关于/i, '')
      .trim();
      
    if (!newTopic) newTopic = prompt; // 如果没提取到，就用原输入

    return {
      action: 'NEW_CANVAS',
      topic: newTopic
    };
  }

  // 2. 默认为扩展当前 Canvas
  return {
    action: 'EXPAND_CANVAS',
    moduleType: planNewModule(prompt, '').type // 复用之前的逻辑
  };
}

/**
 * 根据主题和领域，生成一个模块计划列表
 */
export function generateModulePlan(topic: string, domain: string): ModulePlan[] {
  switch (domain) {
    case 'LANGUAGE':
      return [
        { type: 'definition', title: '定义与发音' },
        { type: 'examples', title: '用法示例' },
        { type: 'story', title: '词汇故事' },
        { type: 'quiz', title: '理解测验' }
      ];

    case 'SCIENCE':
      return [
        { type: 'intuition', title: '概念直觉' },
        { type: 'experiment', title: '交互式实验' },
        { type: 'formula', title: '数学表达' },
        { type: 'scenarios', title: '应用场景' }
      ];

    case 'LIBERAL_ARTS':
      return [
        { type: 'overview', title: '概述' },
        { type: 'perspective_history', title: '历史视角' },
        { type: 'perspective_culture', title: '文化视角' },
        { type: 'perspective_philosophy', title: '哲学视角' }
      ];

    default:
      return [
        { type: 'definition', title: '定义' },
        { type: 'explanation', title: '解释' }
      ];
  }
}

/**
 * 生成单个模块的内容（假数据）
 * 后续会替换成真正的 Gemini 生成
 */
export function generateModuleContent(
  topic: string,
  domain: string,
  moduleType: string,
  userPrompt?: string
): ContentJSON {
  // 如果有用户提示，在标题中体现
  const promptSuffix = userPrompt ? ` (根据: ${userPrompt})` : '';

  switch (moduleType) {
    case 'definition':
      return {
        type: 'text',
        title: `定义：${topic}${promptSuffix}`,
        body: `${topic} 是一个重要的概念，它的核心含义是...\n\n【注：这是假数据，后续会接入真正的 Gemini 生成】`
      };

    case 'examples':
      return {
        type: 'text',
        title: `用法示例${promptSuffix}`,
        body: `以下是 ${topic} 的几个典型用法：\n\n1. 示例一...\n2. 示例二...\n3. 示例三...\n\n【注：这是假数据】`
      };

    case 'story':
      return {
        type: 'text',
        title: `词汇故事${promptSuffix}`,
        body: `从前有一个关于 ${topic} 的故事...\n\n【注：这是假数据，后续会生成完整故事】`
      };

    case 'quiz':
      return {
        type: 'quiz',
        title: `理解测验${promptSuffix}`,
        questions: [
          {
            question: `下列哪个最能描述 ${topic} 的含义？`,
            options: ['选项 A', '选项 B', '选项 C', '选项 D'],
            answer_index: 1,
            explanation: '【假数据】正确答案是 B，因为...'
          }
        ]
      };

    case 'intuition':
      return {
        type: 'text',
        title: `${topic} - 概念直觉${promptSuffix}`,
        body: `简单来说，${topic} 就是...\n\n想象一下这样的场景：...\n\n【注：这是假数据】`
      };

    case 'experiment':
      return {
        type: 'interactive_app',
        title: `交互式实验${promptSuffix}`,
        app_data: {
          experiment_type: 'simulation',
          description: `这是一个关于 ${topic} 的交互实验`,
          variables: [
            { name: 'var1', label: '变量1', min: 0, max: 100, current: 50 }
          ]
        },
        description: '【注：这是假数据，后续会生成真实的交互实验】'
      };

    case 'formula':
      return {
        type: 'text',
        title: `数学表达${promptSuffix}`,
        body: `${topic} 的数学表达式为：\n\nF = ma\n\n【注：这是假数据】`
      };

    case 'scenarios':
      return {
        type: 'text',
        title: `应用场景${promptSuffix}`,
        body: `${topic} 在以下场景中有重要应用：\n\n1. 场景一\n2. 场景二\n\n【注：这是假数据】`
      };

    case 'overview':
      return {
        type: 'text',
        title: `${topic} - 概述${promptSuffix}`,
        body: `${topic} 是一个重要的主题，涉及多个领域...\n\n【注：这是假数据】`
      };

    case 'perspective_history':
      return {
        type: 'text',
        title: `历史视角${promptSuffix}`,
        body: `从历史角度看，${topic} 的发展经历了...\n\n【注：这是假数据】`
      };

    case 'perspective_culture':
      return {
        type: 'text',
        title: `文化视角${promptSuffix}`,
        body: `从文化角度看，${topic} 在不同文化中的意义...\n\n【注：这是假数据】`
      };

    case 'perspective_philosophy':
      return {
        type: 'text',
        title: `哲学视角${promptSuffix}`,
        body: `从哲学角度看，${topic} 引发了关于...的思考\n\n【注：这是假数据】`
      };

    default:
      return {
        type: 'text',
        title: `${moduleType}${promptSuffix}`,
        body: `关于 ${topic} 的 ${moduleType} 内容\n\n【注：这是假数据】`
      };
  }
}

/**
 * 根据用户的扩展请求，决定要添加什么类型的模块
 */
export function planNewModule(prompt: string, domain: string): ModulePlan {
  // 简单的关键词匹配
  const lowerPrompt = prompt.toLowerCase();

  // 语言相关
  if (lowerPrompt.includes('故事') || lowerPrompt.includes('story')) {
    return { type: 'story', title: '相关故事' };
  }
  if (lowerPrompt.includes('例子') || lowerPrompt.includes('example')) {
    return { type: 'examples', title: '更多示例' };
  }
  if (lowerPrompt.includes('测验') || lowerPrompt.includes('quiz')) {
    return { type: 'quiz', title: '测验' };
  }

  // 科学相关
  if (lowerPrompt.includes('实验') || lowerPrompt.includes('experiment')) {
    return { type: 'experiment', title: '实验演示' };
  }
  if (lowerPrompt.includes('公式') || lowerPrompt.includes('formula')) {
    return { type: 'formula', title: '公式推导' };
  }

  // 通识相关
  if (lowerPrompt.includes('历史') || lowerPrompt.includes('history')) {
    return { type: 'perspective_history', title: '历史视角' };
  }
  if (lowerPrompt.includes('文化') || lowerPrompt.includes('culture')) {
    return { type: 'perspective_culture', title: '文化视角' };
  }

  // 默认：文本解释
  return { type: 'explanation', title: '补充说明' };
}
