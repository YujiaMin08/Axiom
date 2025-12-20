/**
 * Gemini 跨学科视角生成器
 * PRD 核心特性：从不同学科"透镜"观察同一现象
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * 视角内容输出结构
 */
interface PerspectiveContentOutput {
  title: string;
  discipline: string;  // 学科名称（如 Chemistry, Physics, Biology）
  lens_description: string;  // 从这个学科看，是什么视角
  main_explanation: string;  // 核心解释（200-300词）
  key_concepts: string[];  // 该学科的关键概念
  visual_elements?: string[];  // 建议的可视化元素
  connection_to_other_perspectives?: string;  // 与其他学科的联系
  discipline_specific_questions?: string[];  // 该视角下的思考问题
}

interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 其他已生成的视角（用于建立连接）
 */
interface OtherPerspective {
  discipline: string;
  main_point: string;
}

/**
 * 使用 Gemini 3 Flash 生成跨学科视角内容
 */
export async function generatePerspectiveContent(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    other_perspectives?: OtherPerspective[];  // 其他已生成的视角
    phenomenon_description?: string;  // 现象的基础描述
    target_audience?: string;
  }
): Promise<PerspectiveContentOutput> {
  
  // 从模块类型中提取学科（如 perspective_chemistry → chemistry）
  const discipline = modulePlan.type.replace('perspective_', '');
  const audience = context?.target_audience || 'G7-G12';

  const systemInstruction = `You are a multidisciplinary educator who excels at showing students how different academic fields analyze the same phenomenon.

Your role is to present a specific disciplinary "lens" (perspective) on a topic or phenomenon. This is NOT about providing a general overview - it's about showing what THIS SPECIFIC DISCIPLINE reveals that others might miss.

Core Philosophy (from the PRD):

"同一问题，不同学科怎么看"
"不是重讲一遍，而是标出哪些学科结论变化了，哪些没变"

Disciplinary Lenses:

**Physics Lens (物理学视角)**:
- Focus on: forces, energy, motion, waves, fields, conservation laws
- Ask: "What forces are at play?" "How does energy transform?" "What physical laws govern this?"
- Tools: equations of motion, thermodynamics, electromagnetism

**Chemistry Lens (化学视角)**:
- Focus on: molecules, reactions, bonds, elements, compounds, equilibrium
- Ask: "What chemical reactions occur?" "What molecules are involved?" "How do bonds break/form?"
- Tools: chemical equations, molecular structures, reaction kinetics

**Biology Lens (生物学视角)**:
- Focus on: cells, organisms, systems, evolution, adaptation, life processes
- Ask: "What biological structures are involved?" "How does the organism respond?" "What's the evolutionary purpose?"
- Tools: anatomy, physiology, cellular processes

**Mathematics Lens (数学视角)**:
- Focus on: patterns, relationships, quantification, models, proofs
- Ask: "What patterns exist?" "How can we model this?" "What are the mathematical relationships?"
- Tools: equations, graphs, statistical analysis

**History Lens (历史视角)**:
- Focus on: evolution over time, context, causes, effects, turning points
- Ask: "How did this develop?" "What historical context matters?" "How has understanding changed?"
- Tools: timelines, primary sources, historical analysis

**Culture Lens (文化视角)**:
- Focus on: meanings, practices, beliefs, values, social significance
- Ask: "What does this mean in different cultures?" "How do societies view this?" "What values are reflected?"
- Tools: anthropology, comparative analysis

**Philosophy Lens (哲学视角)**:
- Focus on: meaning, ethics, logic, existence, knowledge
- Ask: "What does this mean?" "What ethical questions arise?" "What can we know?"
- Tools: logical analysis, ethical frameworks, epistemology

**Economics Lens (经济学视角)**:
- Focus on: value, trade, resources, incentives, scarcity
- Ask: "What are the costs/benefits?" "How do incentives work?" "What's the market impact?"
- Tools: supply-demand, cost-benefit analysis

**Sociology Lens (社会学视角)**:
- Focus on: social structures, behaviors, institutions, norms
- Ask: "How does society organize around this?" "What social patterns exist?"
- Tools: social analysis, institutional study

Content Guidelines:

1. **Be Discipline-Specific**: Don't just repeat common knowledge - reveal what THIS field uniquely sees
2. **Connect to Other Lenses**: Briefly mention how this perspective complements or differs from others
3. **Use Discipline Vocabulary**: Introduce 3-5 key terms from this field
4. **Provide Depth**: Go beyond surface-level; show the discipline's analytical power
5. **Stay Accessible**: Explain technical concepts clearly for G7-G12
6. **Bilingual**: English for technical terms, Chinese for explanations`;

  const userPrompt = `Topic/Phenomenon: "${topic}"
Domain: ${domain}
Module: "${modulePlan.title}"
${modulePlan.description || ''}
Discipline Lens: ${discipline}
Target Audience: ${audience}

${context?.phenomenon_description ? `
Phenomenon Description:
${context.phenomenon_description}
` : ''}

${context?.other_perspectives && context.other_perspectives.length > 0 ? `
Other Perspectives Already Presented:
${context.other_perspectives.map(p => `- ${p.discipline}: ${p.main_point}`).join('\n')}
` : ''}

Explain this topic/phenomenon from the ${discipline} perspective.

Requirements:
1. Lens Description: In one sentence, what does ${discipline} reveal about this topic?
2. Main Explanation: 200-300 words from the ${discipline} viewpoint
3. Key Concepts: 3-5 discipline-specific concepts introduced
4. Visual Element: Suggest ONE key visual (diagram/chart/illustration) that best captures this perspective
   - Be specific and detailed - this will be used for image generation
   - Choose the MOST important visual representation
5. ${context?.other_perspectives?.length ? 'Connection: How does this perspective complement or differ from the others?' : 'Unique Value: What does this lens reveal that other fields might miss?'}
6. Thinking Questions: 2-3 questions that encourage thinking from this disciplinary angle

Make the ${discipline} perspective distinct, insightful, and accessible.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      discipline: { type: Type.STRING },
      lens_description: {
        type: Type.STRING,
        description: "One sentence explaining what this discipline reveals"
      },
      main_explanation: {
        type: Type.STRING,
        description: "Main content from this perspective. 200-300 words. Be discipline-specific."
      },
      key_concepts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3-5 key concepts from this discipline"
      },
      visual_elements: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "ONE key visual element that best illustrates this perspective. Be specific and detailed in the description."
      },
      connection_to_other_perspectives: {
        type: Type.STRING,
        description: "How this perspective relates to others (if applicable)"
      },
      discipline_specific_questions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 thought-provoking questions from this lens"
      }
    },
    required: ["title", "discipline", "lens_description", "main_explanation", "key_concepts"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.8,  // 较高创造性，每个视角都应该独特
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: 'medium' }
    },
  });

  return JSON.parse(response.text);
}

/**
 * 生成多个学科视角（用于跨学科主题如"切洋葱流泪"）
 */
export async function generateMultiplePerspectives(
  topic: string,
  domain: string,
  disciplines: string[],
  phenomenonDescription?: string
): Promise<PerspectiveContentOutput[]> {
  
  const perspectives: PerspectiveContentOutput[] = [];
  
  for (let i = 0; i < disciplines.length; i++) {
    const discipline = disciplines[i];
    console.log(`\n  → 生成 ${discipline} 视角... (${i + 1}/${disciplines.length})`);
    
    const modulePlan: ModulePlan = {
      type: `perspective_${discipline}`,
      title: `${discipline.charAt(0).toUpperCase() + discipline.slice(1)} Perspective`,
      description: `Analyzing ${topic} from the ${discipline} viewpoint`
    };
    
    const previousPerspectives = perspectives.map(p => ({
      discipline: p.discipline,
      main_point: p.lens_description
    }));
    
    const perspective = await generatePerspectiveContent(
      topic,
      domain,
      modulePlan,
      {
        other_perspectives: previousPerspectives,
        phenomenon_description: phenomenonDescription
      }
    );
    
    perspectives.push(perspective);
    console.log(`  ✅ ${discipline} 视角完成`);
    
    // 避免限流
    if (i < disciplines.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return perspectives;
}

