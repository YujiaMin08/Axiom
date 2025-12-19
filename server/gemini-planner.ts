/**
 * 真正的 Gemini Planner
 * 独立实现，用于测试验证，暂不接入主系统
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * 模块计划接口
 */
export interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * Planner 响应结构
 */
interface PlannerResponse {
  topic_analysis: {
    main_topic: string;
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    key_concepts: string[];
  };
  module_plan: ModulePlan[];
  learning_path_reasoning: string;  // AI 解释为什么这样规划
}

/**
 * 使用 Gemini 2.0 Flash 生成模块计划
 * 
 * @param topic - 用户输入的主题
 * @param domain - 用户选择的领域（LANGUAGE / SCIENCE / LIBERAL_ARTS）
 * @param userContext - 可选的用户上下文（如之前的学习历史）
 */
export async function generateModulePlanWithGemini(
  topic: string,
  domain: string,
  userContext?: string
): Promise<PlannerResponse> {
  
  const systemInstruction = `You are an expert educational curriculum designer and learning path architect for Axiom, a GenUI-powered learning platform.

Your role is to design an optimal learning module structure for students aged 12-18 (G7-G12) within the domain: ${domain}.

Understanding the Domain Structure:

${domain === 'LANGUAGE' ? `
LANGUAGE Domain:
Core Focus: Vocabulary, grammar, linguistics, etymology, literature

Learning Path: meaning → context → usage → verification
- Start with core definition and pronunciation
- Explore etymology and word evolution
- Use stories and real-world examples
- Include interactive vocabulary practice
- Verify understanding through contextual quizzes

Cross-disciplinary connections are encouraged (e.g., technical terms linking to science)
` : ''}

${domain === 'SCIENCE' ? `
SCIENCE Domain encompasses multiple disciplines:
- Physics (mechanics, energy, waves, relativity, etc.)
- Chemistry (reactions, molecules, elements, bonds, etc.)
- Biology (cells, genetics, ecology, evolution, etc.)
- Mathematics (algebra, calculus, geometry, statistics, etc.)
- Computer Science (algorithms, data structures, logic, etc.)
- Earth Science (geology, meteorology, astronomy, etc.)

Learning Path: intuition → manipulation → expression → verification
- Start with "what's really happening" (intuitive, non-technical explanation)
- Include interactive experiments with adjustable variables
- Show mathematical/formula representation
- Test with scenario variations and "what if" questions

IMPORTANT: Many scientific topics are inherently cross-disciplinary:
- Example: "photosynthesis" involves biology (cells), chemistry (reactions), physics (light energy)
- Example: "sound waves" involves physics (waves), mathematics (frequency), biology (hearing)
- Design modules that reveal these connections naturally
` : ''}

${domain === 'LIBERAL_ARTS' ? `
LIBERAL ARTS Domain encompasses:
- History (events, movements, civilizations)
- Philosophy (ethics, logic, metaphysics, epistemology)
- Culture & Anthropology (traditions, beliefs, social practices)
- Economics (markets, trade, resource allocation)
- Sociology (social structures, institutions, behavior)
- Political Science (governance, power, systems)
- Arts (visual, performing, literary)

Learning Path: overview → multi-perspective exploration → real-world connections
- Start with accessible introduction
- Explore through different disciplinary lenses
- Connect abstract concepts to concrete real-life scenarios
- Encourage critical thinking and debate

IMPORTANT: Liberal arts topics often involve CROSS-DISCIPLINARY understanding:
- Example: "Why do we cry when cutting onions?" 
  → Biology (tear glands, nerves)
  → Chemistry (sulfur compounds, gas diffusion)  
  → Physics (gas movement, molecular interactions)
- Design modules that reveal how different fields explain the same phenomenon
` : ''}

Core Principles:
1. Start with intuition and direct experience
2. Build up complexity gradually
3. Use interactive and visual elements
4. Create opportunities for manipulation and exploration
5. Verify understanding, not just recall

Available Module Types:

FOUNDATIONAL:
- "definition": Core concept definition and pronunciation
- "intuition": Intuitive explanation before complexity
- "overview": High-level introduction to complex topics

INTERACTIVE:
- "experiment": Interactive experiment or simulation (adjustable variables)
- "game": Gamified practice and exploration
- "manipulation": Interactive tool for exploring relationships

ANALYTICAL:
- "formula": Mathematical expression and derivation
- "examples": Real-world examples and usage scenarios
- "comparison": Compare and contrast concepts
- "timeline": Historical or process timeline

NARRATIVE:
- "story": Narrative or contextual story
- "video": Explanatory video content
- "scenario": Real-life scenario exploration

VERIFICATION:
- "quiz": Understanding verification questions
- "challenge": Apply knowledge to novel situations

CROSS-DISCIPLINARY (Important for complex topics):
- "perspective_physics": Physics lens (energy, forces, motion)
- "perspective_chemistry": Chemistry lens (reactions, molecules, bonds)
- "perspective_biology": Biology lens (cells, organisms, systems)
- "perspective_mathematics": Math lens (patterns, relationships, quantification)
- "perspective_history": Historical lens (evolution, context)
- "perspective_culture": Cultural lens (meanings, practices)
- "perspective_philosophy": Philosophical lens (ethics, meaning)
- "perspective_economics": Economic lens (value, trade, resources)
- "perspective_sociology": Social lens (behavior, structures)
- "cross_disciplinary": Explicitly multi-field exploration

Module Design Guidelines:
- Decide how many modules are needed (typically 4-6, but adjust based on topic complexity)
- Choose module types that fit this specific topic
- Design a learning path that builds understanding step by step
- Prioritize interactive and explorable modules
- **For cross-disciplinary topics**: Include perspective modules from relevant fields
  Example: "Why cry when cutting onions?" could include:
    → perspective_biology (tear glands, sensory nerves)
    → perspective_chemistry (sulfur compounds, enzymatic reactions)
    → perspective_physics (gas diffusion, molecular movement)
- **For scientific topics**: Consider which sub-disciplines are involved
  Example: "photosynthesis" involves biology (cells), chemistry (reactions), physics (light energy)
- **Use specific perspective modules** when the topic naturally involves multiple fields
- The goal is not just to explain, but to show how different lenses reveal different aspects of the same phenomenon`;

  const userPrompt = `Domain: ${domain}
Topic: "${topic}"
${userContext ? `User Context: ${userContext}` : ''}

Design a learning module structure for this topic. Consider:
- What foundation does a student need first?
- Which interactive elements would make this concept tangible?
- How can we create opportunities for exploration and manipulation?
- What's the optimal sequence for building deep understanding?

Design 3-6 modules with clear reasoning for your choices.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      topic_analysis: {
        type: Type.OBJECT,
        properties: {
          main_topic: { type: Type.STRING },
          complexity_level: { 
            type: Type.STRING,
            enum: ["beginner", "intermediate", "advanced"]
          },
          key_concepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 key concepts students should grasp"
          }
        },
        required: ["main_topic", "complexity_level", "key_concepts"]
      },
      module_plan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["type", "title"]
        }
      },
      learning_path_reasoning: {
        type: Type.STRING,
        description: "Explain why you designed this specific sequence of modules"
      }
    },
    required: ["topic_analysis", "module_plan", "learning_path_reasoning"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',  // 使用最新的 Gemini 3 Flash
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,  // 允许创造性，但保持一致性
        candidateCount: 1,
        thinkingConfig: {
          thinkingLevel: 'medium'  // 平衡思考深度和响应速度
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini Planner Error:', error);
    throw error;
  }
}

/**
 * 批量测试不同主题的规划效果
 */
export async function testPlannerWithMultipleTopics(
  topics: Array<{ topic: string; domain: string }>
) {
  const results = [];
  
  for (const { topic, domain } of topics) {
    console.log(`\n📚 正在规划主题: ${topic} (${domain})...`);
    try {
      const plan = await generateModulePlanWithGemini(topic, domain);
      results.push({ topic, domain, success: true, plan });
      console.log(`✅ 成功生成 ${plan.module_plan.length} 个模块`);
    } catch (error) {
      results.push({ topic, domain, success: false, error: String(error) });
      console.log(`❌ 失败: ${error}`);
    }
  }
  
  return results;
}

