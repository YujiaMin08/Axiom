/**
 * Gemini 交互式应用生成器
 * 独立实现，两步生成：1) Spec规范 2) HTML实现
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * 应用规范结构
 */
interface AppSpec {
  concept_and_goal: {
    concept: string;
    learning_objectives: string[];
  };
  interaction_loop: {
    predict_step: string;
    manipulate_step: string;
    observe_step: string;
    explain_step: string;
    check_step: string;
  };
  ui_layout: {
    top: string;
    middle: string;
    bottom: string;
    optional_controls: string[];
  };
  visualizations: {
    visual_elements: string[];
    is_3d: boolean;
    fallback_2d?: string;
  };
  content_rules: {
    tone: string;
    hinting_strategy: string;
  };
  data_model: {
    parameters: Array<{
      name: string;
      type: string;
      min?: number;
      max?: number;
      default: any;
      unit?: string;
      description: string;
    }>;
    outputs: string[];
  };
  implementation_notes: {
    approach: string;
    performance: string[];
  };
  success_criteria: string[];
  accessibility: string[];
}

interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 完整输出
 */
export interface InteractiveAppOutput {
  spec: AppSpec;
  html_content: string;
}

/**
 * 第一步：生成详细规范
 */
export async function generateInteractiveAppSpec(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    audience?: string;
    learning_goal?: string;
    user_preferences?: any;
  }
): Promise<AppSpec> {
  
  const audience = context?.audience || 'G7-G12';
  const learning_goal = context?.learning_goal || 
    `Understand ${topic} through interactive exploration`;

  const systemInstruction = `You are a pedagogist + interactive learning product designer.

Design a detailed specification for an interactive web app that teaches through experimentation.

The app must follow: Predict → Manipulate → Observe → Explain → Check

Focus on:
- Clear learning objectives
- Adjustable parameters for hands-on exploration  
- Real-time visual feedback
- Progressive explanations
- Quick verification questions`;

  const userPrompt = `Topic: "${topic}"
Domain: ${domain}
Audience: ${audience}
Module: "${modulePlan.title}"
${modulePlan.description || ''}
Learning Goal: ${learning_goal}

Design a complete specification for an interactive learning app.

Must include:
1. Clear concept and 2-4 learning objectives
2. The 5-step interaction loop (Predict/Manipulate/Observe/Explain/Check)
3. UI layout (mobile-first)
4. Visualizations (be specific about what to show)
5. Data model (parameters with ranges, outputs to calculate)
6. Implementation approach
7. Success criteria
8. Accessibility features

Be detailed and specific. This spec will be used to generate the actual HTML implementation.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      concept_and_goal: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING },
          learning_objectives: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      interaction_loop: {
        type: Type.OBJECT,
        properties: {
          predict_step: { type: Type.STRING },
          manipulate_step: { type: Type.STRING },
          observe_step: { type: Type.STRING },
          explain_step: { type: Type.STRING },
          check_step: { type: Type.STRING }
        }
      },
      ui_layout: {
        type: Type.OBJECT,
        properties: {
          top: { type: Type.STRING },
          middle: { type: Type.STRING },
          bottom: { type: Type.STRING },
          optional_controls: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      visualizations: {
        type: Type.OBJECT,
        properties: {
          visual_elements: { type: Type.ARRAY, items: { type: Type.STRING } },
          is_3d: { type: Type.BOOLEAN },
          fallback_2d: { type: Type.STRING }
        }
      },
      content_rules: {
        type: Type.OBJECT,
        properties: {
          tone: { type: Type.STRING },
          hinting_strategy: { type: Type.STRING }
        }
      },
      data_model: {
        type: Type.OBJECT,
        properties: {
          parameters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                default: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          outputs: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      implementation_notes: {
        type: Type.OBJECT,
        properties: {
          approach: { type: Type.STRING },
          performance: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      success_criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
      accessibility: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.7,
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: 'minimal' }
    },
  });

  const responseText = response.text;
  
  // 保存原始响应用于调试
  const fs = require('fs');
  fs.writeFileSync('./interactive-spec-raw-response.txt', responseText, 'utf-8');
  
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('  ❌ Spec JSON 解析失败');
    console.error('  响应长度:', responseText.length, '字符');
    console.error('  已保存到: interactive-spec-raw-response.txt');
    throw parseError;
  }
}

/**
 * 第二步：根据规范生成HTML实现
 */
export async function generateHTMLFromSpec(
  topic: string,
  spec: AppSpec
): Promise<string> {
  
  const systemInstruction = `You are an expert front-end developer specializing in educational interactive applications.

You will receive a detailed specification for an interactive learning app. Your job is to implement it as a single, self-contained HTML file.

Requirements:
- ONE complete HTML file with inline CSS and JavaScript
- Modern, clean, and well-commented code
- Fully functional - no placeholders or TODOs
- Mobile-responsive design
- Smooth animations and transitions
- Immediate feedback on interactions
- Professional UI/UX

Technical Stack:
- Vanilla JavaScript (ES6+)
- CSS3 for styling and animations
- Canvas or SVG for visualizations (choose based on the spec)
- No external dependencies unless absolutely necessary
- If using a library (e.g., Chart.js), load via CDN

Code Quality:
- Use semantic HTML5
- Organize JavaScript into clear functions
- Add comments for key sections
- Use const/let appropriately
- Handle edge cases
- Include error handling where relevant

Make it production-ready and delightful to use.`;

  const userPrompt = `Topic: "${topic}"

SPECIFICATION:
${JSON.stringify(spec, null, 2)}

Generate a complete, self-contained HTML file that implements this specification.

The HTML must:
- Include all necessary inline CSS and JavaScript
- Implement all parameters and controls specified
- Create the visualizations described
- Include the interaction loop (Predict/Manipulate/Observe/Explain/Check)
- Include the verification questions
- Be mobile-responsive
- Work when opened directly in a browser

Focus on:
- Clean, readable code with good structure
- Smooth user experience
- Immediate visual feedback
- Educational value

Output ONLY the complete HTML code - no explanations, no markdown formatting, just pure HTML.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.6,  // 稍低温度确保代码质量
      maxOutputTokens: 65536,  // 大输出空间for完整HTML
      thinkingConfig: { thinkingLevel: 'minimal' }
    },
  });

  return response.text;
}

/**
 * 完整的两步生成流程
 */
export async function generateInteractiveApp(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    audience?: string;
    learning_goal?: string;
    user_preferences?: any;
    other_modules?: ModulePlan[];
  }
): Promise<InteractiveAppOutput> {
  
  console.log('  步骤 1/2: 生成应用规范...');
  const spec = await generateInteractiveAppSpec(topic, domain, modulePlan, context);
  console.log('  ✅ 规范生成完成');
  
  // 等待一下避免限流
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('  步骤 2/2: 根据规范生成 HTML...');
  const html_content = await generateHTMLFromSpec(topic, spec);
  console.log('  ✅ HTML 生成完成');
  
  return {
    spec,
    html_content
  };
}
