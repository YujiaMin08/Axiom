/**
 * 真正的 Gemini Planner
 * 独立实现，用于测试验证，暂不接入主系统
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
 * @param language - 内容语言（en / zh）
 * @param userContext - 可选的用户上下文（如之前的学习历史）
 */
export async function generateModulePlanWithGemini(
  topic: string,
  domain: string,
  language: 'en' | 'zh' = 'en',
  userContext?: string
): Promise<PlannerResponse> {
  
  const systemInstruction = `You are an expert educational curriculum designer and learning path architect for Axiom, a GenUI-powered learning platform.

Your role is to design an optimal learning module structure for students aged 12-18 (G7-G12) within the domain: ${domain}.

**CONTENT LANGUAGE SETTINGS**:
${language === 'en' ? `
- Generate all module content in ENGLISH
- Titles, descriptions, and all text should be in English
- This is the default setting for Science and Liberal Arts domains
` : `
- Generate all module content in SIMPLIFIED CHINESE (简体中文)
- Titles, descriptions, and all text should be in Chinese
- Exception: LANGUAGE domain always includes both English and Chinese for vocabulary learning
`}

Understanding the Domain Structure:

${domain === 'LANGUAGE' ? `
LANGUAGE Domain:
Core Focus: Vocabulary, grammar, linguistics, etymology, literature, language learning

Learning Path: meaning → visual → context → usage → (optional verification)
- Start with core definition and pronunciation
- **MANDATORY: Include visual content (image/illustration)** - Show the word in visual context
- **MANDATORY: Include video content** - Demonstrate pronunciation, usage in real scenarios, cultural context
- Explore etymology and word evolution
- Use stories and real-world examples
- Include interactive vocabulary practice (scenarios, dialogues)
- Quiz is OPTIONAL - only include if it genuinely adds value to learning

IMPORTANT: For LANGUAGE domain, focus on LANGUAGE-SPECIFIC modules ONLY:
- **MUST include**: image/illustration (visual representation), video (pronunciation and usage)
- Use: definition, intuition, story, examples, scenario, (optional: quiz, challenge)
- **STRICTLY FORBIDDEN**: perspective_* modules (perspective_biology, perspective_history, perspective_physics, etc.)
- NO cross-disciplinary content allowed in LANGUAGE domain - even for technical terms, keep the focus on language learning

For ALL vocabulary words (like "apple", "book", "photosynthesis"), focus ONLY on:
- Word meaning and usage
- **Visual representation (image)**
- **Video demonstration (pronunciation, real-world usage)**
- Etymology and word formation
- Contextual examples and stories
- Interactive language practice (scenarios, dialogues)
- **NEVER include** scientific, historical, or any cross-disciplinary perspectives

**CRITICAL**: Every LANGUAGE learning module plan MUST include at least one "image" or "illustration" module and at least one "video" module to provide visual and auditory learning support.
` : ''}

${domain === 'SCIENCE' ? `
SCIENCE Domain encompasses multiple disciplines:
- Physics (mechanics, energy, waves, relativity, etc.)
- Chemistry (reactions, molecules, elements, bonds, etc.)
- Biology (cells, genetics, ecology, evolution, etc.)
- Mathematics (algebra, calculus, geometry, statistics, etc.)
- Computer Science (algorithms, data structures, logic, etc.)
- Earth Science (geology, meteorology, astronomy, etc.)

Learning Path: intuition → manipulation → expression → (optional verification)
- Start with "what's really happening" (intuitive, non-technical explanation)
- **MANDATORY: Include interactive experiments/apps (experiment, manipulation, or game)** - Hands-on exploration with adjustable variables
- **MANDATORY: Include HTML animation/visualization** - Visual demonstration of processes, concepts, or phenomena
- Show mathematical/formula representation
- Quiz is OPTIONAL - only include if it genuinely tests conceptual understanding

IMPORTANT: For SCIENCE domain, focus on SINGLE-DISCIPLINE exploration:
- **STRICTLY FORBIDDEN**: perspective_* modules (perspective_biology, perspective_chemistry, etc.)
- While scientific topics may involve multiple disciplines, explore them through direct interactive modules, NOT through cross-disciplinary perspectives
- Example: For "photosynthesis", use interactive experiments, animations, and formulas - NOT perspective_biology or perspective_chemistry
- Keep the focus on hands-on exploration and visual demonstration

**CRITICAL**: Every SCIENCE learning module plan MUST include:
- At least one interactive module (experiment, manipulation, or game) for hands-on exploration
- At least one HTML animation or visualization module to demonstrate processes visually
- These interactive and visual elements are essential for understanding scientific concepts
- **NO perspective_* modules allowed**
` : ''}

${domain === 'LIBERAL_ARTS' ? `
LIBERAL ARTS Domain (通识教育):
**Core Focus**: Cross-disciplinary exploration of phenomena, life questions, and concepts from multiple perspectives

This domain is NOT limited to humanities - it encompasses ALL disciplines when exploring a topic holistically:
- **Natural Sciences**: Biology, Chemistry, Physics (when explaining everyday phenomena)
- **Social Sciences**: History, Sociology, Economics, Political Science
- **Humanities**: Philosophy, Culture, Anthropology, Arts
- **Applied Sciences**: Technology, Engineering, Health

LIBERAL_ARTS is about understanding "why" and "how" things work in life through MULTIPLE LENSES.

Examples of LIBERAL_ARTS topics:
- "Why do we cry when cutting onions?" → Biology (tear glands), Chemistry (sulfur compounds), Physics (gas diffusion)
- "Why is the sky blue?" → Physics (light scattering), Chemistry (atmosphere composition), History (scientific discovery)
- "How does music affect emotions?" → Biology (brain), Psychology (perception), Culture (meanings), Physics (sound waves)
- "Why do civilizations rise and fall?" → History (events), Economics (resources), Sociology (institutions), Geography (environment)

Learning Path: overview → multi-perspective exploration → rich media → synthesis
- Start with accessible introduction to the phenomenon
- **MANDATORY: Include at least one HTML animation module** - Visual demonstration of processes or concepts
- **MANDATORY: Include multiple cross-disciplinary perspectives (perspective_* modules)** - Explore through 2-4 different disciplinary lenses (can mix science + humanities)
- **CAN include**: interactive apps, videos, images to enrich understanding
- Synthesize insights from different perspectives

IMPORTANT: Liberal arts topics benefit from BALANCED, MULTI-MODAL exploration:
- **MUST NOT** consist ONLY of perspective_* modules
- **MUST include** at least one HTML animation for visual learning
- **SHOULD include** 2-4 perspective modules from DIVERSE disciplines (mix natural sciences, social sciences, humanities)
- **CAN include** interactive apps (for exploring scenarios, simulations, decision-making)
- **CAN include** videos (for demonstrations, interviews, real-world footage)
- **CAN include** images (for visual context, diagrams, artifacts)

Example module structure for "Why do we cry when cutting onions?":
1. animation (visualizing the chemical reaction and tear response)
2. perspective_biology (how tear glands and nerves work)
3. perspective_chemistry (sulfur compounds and gas release)
4. perspective_physics (gas diffusion and molecular movement)
5. interactive_app (explore different vegetables and their effects)

**CRITICAL**: Every LIBERAL_ARTS learning module plan MUST include:
- At least ONE HTML animation module (animation, visualization) for visual engagement
- At least 2-4 perspective modules from DIVERSE disciplines (can include perspective_biology, perspective_chemistry, perspective_physics, perspective_history, perspective_culture, etc.)
- **SHOULD mix** natural sciences with humanities/social sciences when relevant
- **CAN include** interactive apps, videos, or images to create a rich, multi-modal learning experience
- **CANNOT** consist only of perspective modules - must have diverse module types for balanced exploration
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
- "scenario": Real-life scenario exploration (ONLY for LANGUAGE domain)

VERIFICATION:
- "quiz": Understanding verification questions
- "challenge": Apply knowledge to novel situations

CROSS-DISCIPLINARY (ONLY for LIBERAL_ARTS domain, NOT for LANGUAGE or SCIENCE):
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

VISUAL & MULTIMEDIA:
- "image": Visual representation or illustration
- "video": Explanatory or demonstration video
- "animation": HTML-based animated visualization or process demonstration
- "visualization": Interactive or static data/concept visualization

Module Design Guidelines:
- Decide how many modules are needed (typically 4-6, but adjust based on topic complexity)
- Choose module types that fit this specific topic AND domain
- Design a learning path that builds understanding step by step
- Prioritize interactive and explorable modules

**CRITICAL DOMAIN-SPECIFIC RULES:**

For LANGUAGE domain:
- **MUST use**: image (visual representation), video (pronunciation & usage)
- **CAN use**: definition, intuition, story, examples, scenario
- **OPTIONAL**: quiz (only if it adds genuine value)
- **STRICTLY FORBIDDEN**: Any perspective_* modules (perspective_biology, perspective_chemistry, perspective_history, etc.)
- Focus PURELY on language learning: vocabulary, usage, context, etymology
- NO cross-disciplinary content allowed - even for technical terms

For SCIENCE domain:
- **MUST use**: interactive module (experiment/manipulation/game), animation (HTML visualization)
- **CAN use**: definition, intuition, formula, examples, story, video, image
- **OPTIONAL**: quiz (only if it tests conceptual understanding)
- **STRICTLY FORBIDDEN**: Any perspective_* modules, scenario (scenario is for LANGUAGE only)
- Use direct exploration through interactives and animations, NOT through cross-disciplinary perspectives

For LIBERAL_ARTS domain (通识教育 - General Education):
- **MUST use**: animation (HTML visualization), multiple perspective_* modules (2-4 from diverse disciplines)
- **CAN use perspective modules from ANY discipline**: perspective_biology, perspective_chemistry, perspective_physics, perspective_mathematics, perspective_history, perspective_culture, perspective_philosophy, perspective_economics, perspective_sociology
- **SHOULD choose perspectives** based on what genuinely helps understand the topic (e.g., for "cutting onions", use biology/chemistry/physics, NOT history/philosophy)
- **CAN use**: interactive apps, videos, images, story, comparison, timeline
- **OPTIONAL**: quiz (only if it enhances critical thinking)
- **STRICTLY FORBIDDEN**: scenario (scenario is for LANGUAGE domain only)
- **CRITICAL**: Cannot consist ONLY of perspective modules - must include animation and other rich media
- The goal is multi-modal, cross-disciplinary exploration: visual (animation/video/image) + analytical (diverse perspectives) + interactive (apps)`;

  const userPrompt = `Domain: ${domain}
Topic: "${topic}"
${userContext ? `User Context: ${userContext}` : ''}

CRITICAL INSTRUCTION:
If the "Topic" appears to be a specific request to add a module (e.g., "Add an interactive animation", "Create a quiz", "Give me a story"), you MUST interpret this as an INSTRUCTION for the current topic, NOT as a new topic itself.
In this case, your plan should consist of ONE or TWO modules that directly fulfill this request, relevant to the inferred underlying topic.

Design a learning module structure for this topic. Consider:
- What foundation does a student need first?
- Which interactive elements would make this concept tangible?
- How can we create opportunities for exploration and manipulation?
- What's the optimal sequence for building deep understanding?

${domain === 'LANGUAGE' ? `
**CRITICAL REQUIREMENTS FOR LANGUAGE DOMAIN:**
- You MUST include at least one "image" or "illustration" module to show visual representation
- You MUST include at least one "video" module to demonstrate pronunciation and real-world usage
- You MUST NOT include any perspective_* modules (perspective_biology, perspective_chemistry, etc.)
- Quiz is OPTIONAL - only include if it genuinely adds value to language learning
- Focus purely on language-specific modules: meaning, visual, context, usage
` : ''}

${domain === 'SCIENCE' ? `
**CRITICAL REQUIREMENTS FOR SCIENCE DOMAIN:**
- You MUST include at least one interactive module (experiment, manipulation, or game) for hands-on exploration
- You MUST include at least one "animation" or "visualization" module (HTML animation) to demonstrate processes visually
- You MUST NOT include any perspective_* modules (perspective_biology, perspective_chemistry, etc.)
- Quiz is OPTIONAL - only include if it genuinely tests conceptual understanding
- Focus on direct exploration through interactives and animations, NOT cross-disciplinary perspectives
` : ''}

${domain === 'LIBERAL_ARTS' ? `
**CRITICAL REQUIREMENTS FOR LIBERAL_ARTS DOMAIN (通识教育):**
- You MUST include at least ONE "animation" module (HTML visualization) for visual engagement
- You MUST include at least 2-4 different perspective modules from DIVERSE disciplines
- **IMPORTANT**: perspective modules can include BOTH natural sciences (perspective_biology, perspective_chemistry, perspective_physics, perspective_mathematics) AND humanities/social sciences (perspective_history, perspective_culture, perspective_philosophy, perspective_economics, perspective_sociology)
- Choose perspectives based on what genuinely helps understand the topic - for everyday phenomena, often natural science perspectives are most relevant
- You CAN include interactive apps, videos, or images to create a rich learning experience
- You MUST NOT create a plan consisting ONLY of perspective modules - include diverse module types
- Quiz is OPTIONAL - only include if it genuinely enhances critical thinking
- Create a balanced, multi-modal exploration: visual (animation/video/image) + analytical (diverse perspectives) + interactive (apps)

Example: For "Why do we cry when cutting onions?", use perspectives from biology, chemistry, and physics - NOT history or philosophy.
` : ''}

Design 4-7 modules with clear reasoning for your choices.`;

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

