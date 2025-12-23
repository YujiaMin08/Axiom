/**
 * Gemini 智能测验生成器
 * 基于前面已生成的模块内容生成相关问题
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * 测验输出结构
 */
interface QuizContentOutput {
  title: string;
  questions: Array<{
    question: string;
    question_type: 'multiple_choice' | 'true_false' | 'scenario_based';
    options: string[];
    answer_index: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    source_module?: string;  // 这个问题基于哪个模块
  }>;
  quiz_strategy: string;  // AI 解释为什么设计这些问题
}

/**
 * 已生成的模块内容
 */
interface GeneratedModuleContent {
  type: string;
  title: string;
  content: any;  // 实际生成的内容（text/story/experiment等）
}

interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 使用 Gemini 3 Flash 生成基于上下文的测验
 */
export async function generateQuizContent(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context: {
    generated_modules: GeneratedModuleContent[];  // 前面已生成的所有模块
    learning_objectives?: string[];
    target_audience?: string;
    language?: 'en' | 'zh';  // 内容语言设置
  }
): Promise<QuizContentOutput> {
  
  const audience = context.target_audience || 'G7-G12';
  
  // 确定输出语言
  const outputLanguage = domain === 'LANGUAGE' ? 'bilingual' : (context?.language || 'en');
  
  // 构建语言要求说明
  const languageRequirement = domain === 'LANGUAGE' 
    ? `**LANGUAGE REQUIREMENT**: Use BILINGUAL format (English + Chinese). Questions and options should be in English, with Chinese translations provided.`
    : outputLanguage === 'zh'
    ? `**LANGUAGE REQUIREMENT**: Generate ALL content in CHINESE (简体中文) only. All questions, options, and explanations must be in Chinese.`
    : `**LANGUAGE REQUIREMENT**: Generate ALL content in ENGLISH only. All questions, options, and explanations must be in English.`;

  const systemInstruction = `You are an expert assessment designer for educational applications, specializing in creating meaningful, context-aware quiz questions for students aged 12-18.

${languageRequirement}

Your role is to design quiz questions that:
1. TEST UNDERSTANDING, not just recall
2. BUILD ON the content students just learned
3. CONNECT ACROSS different modules (text, stories, experiments, formulas)
4. ENCOURAGE APPLICATION of knowledge, not just recognition

Critical Context-Awareness:

You will be given the ACTUAL CONTENT that was generated for previous modules in this learning canvas. Your quiz questions MUST reference and build upon this specific content.

Examples of Context-Aware Questions:

**If there was a STORY module**:
- "In the story, why did [character] choose to [action]?"
- "Which word from the story best describes [situation]?"
- "The story mentioned [detail]. What does this reveal about [concept]?"

**If there was an EXPERIMENT/INTERACTIVE module**:
- "In the simulation, when you increased [parameter], what happened to [output]?"
- "At what point did the [phenomenon] stop increasing?"
- "Which combination of settings produced the highest [result]?"

**If there was a FORMULA module**:
- "In the equation we explored, what does the symbol [x] represent?"
- "If [parameter] doubles, what happens to [output]?"
- "Why can't we use this formula when [condition]?"

Question Design Principles:

**For LANGUAGE Domain**:
- Test word usage in NEW contexts (not just from the story)
- Include contextual questions based on the narrative
- Test understanding of nuances and connotations
- Verify practical application (e.g., "Which is appropriate in formal writing?")

**For SCIENCE Domain**:
- Test conceptual understanding, not formula memorization
- Include "what if" scenarios that require applying learned principles
- Reference specific observations from interactive experiments
- Test the "why" behind phenomena

**For LIBERAL_ARTS Domain**:
- Test critical thinking and perspective-taking
- Compare different viewpoints presented in the content
- Apply concepts to new scenarios
- Evaluate arguments or interpretations

Question Types:

1. **Multiple Choice** (Most common):
   - 4 options
   - One clearly correct answer
   - Distractors should be plausible but incorrect
   - Test understanding, not tricks

2. **True/False**:
   - For testing misconceptions
   - Include nuanced statements

3. **Scenario-Based**:
   - Present a new situation
   - Test ability to apply learned concepts
   - May require multi-step reasoning

Quality Standards:
- Every question should have a clear, educational purpose
- Explanations should TEACH, not just say "correct/wrong"
- Reference the specific modules where the concept was taught
- Avoid ambiguity - one answer should be definitively correct
- Difficulty should match the target audience`;

  // 分析已生成的模块类型
  const moduleTypes = context.generated_modules.map(m => m.type);
  const hasStory = moduleTypes.includes('story');
  const hasExperiment = moduleTypes.includes('experiment') || moduleTypes.includes('manipulation');
  const hasFormula = moduleTypes.includes('formula');
  const hasText = moduleTypes.some(t => ['text', 'intuition', 'definition', 'overview', 'examples'].includes(t));

  // 构建上下文摘要
  const contextSummary = context.generated_modules.map(mod => {
    let contentPreview = '';
    
    if (mod.type === 'text' || mod.type === 'intuition' || mod.type === 'definition' || mod.type === 'overview' || mod.type === 'examples') {
      contentPreview = mod.content.body?.substring(0, 500) || mod.content.narrative_text?.substring(0, 500) || '';
    } else if (mod.type === 'story') {
      contentPreview = mod.content.narrative_text || '';
    } else if (mod.type === 'experiment' || mod.type === 'manipulation') {
      if (mod.content.spec) {
        const params = mod.content.spec.data_model?.parameters || [];
        contentPreview = `Interactive app:\nParameters: ${params.map((p: any) => `${p.name} (${p.min}-${p.max} ${p.unit})`).join(', ')}`;
      } else if (mod.content.parameters) {
        contentPreview = `Parameters: ${mod.content.parameters.map((p: any) => `${p.name} (${p.min}-${p.max} ${p.unit})`).join(', ')}`;
      }
    } else if (mod.type === 'formula') {
      contentPreview = `Formula: ${mod.content.main_formula}\nExplanation: ${mod.content.formula_explanation?.substring(0, 200)}`;
      if (mod.content.symbol_table) {
        contentPreview += `\nSymbols: ${mod.content.symbol_table.map((s: any) => s.symbol).join(', ')}`;
      }
    }
    
    return `Module: "${mod.title}" (${mod.type})\n${contentPreview}`;
  }).join('\n\n---\n\n');

  // 生成适配性提示
  let quizFocusGuidance = '';
  if (hasStory && hasExperiment) {
    quizFocusGuidance = 'You have both a STORY and an EXPERIMENT. Design questions that test understanding of BOTH the narrative details AND the experimental concepts.';
  } else if (hasStory) {
    quizFocusGuidance = 'Focus on story comprehension, character decisions, word usage in context, and thematic understanding.';
  } else if (hasExperiment) {
    quizFocusGuidance = 'Focus on experimental observations, parameter relationships, cause-and-effect, and applying the principles to new scenarios.';
  } else if (hasFormula) {
    quizFocusGuidance = 'Focus on formula understanding, symbol meanings, application to numerical problems, and conceptual "what if" questions.';
  } else if (hasText) {
    quizFocusGuidance = 'Focus on concept understanding, definitional clarity, real-world applications, and critical thinking about the ideas presented.';
  } else {
    quizFocusGuidance = 'Adapt your questions based on the available content types.';
  }

  const userPrompt = `Topic: "${topic}"
Domain: ${domain}
Target Audience: ${audience}
Quiz Module: "${modulePlan.title}"

CONTEXT - Previously Generated Content:
${contextSummary}

${context.learning_objectives ? `
Learning Objectives:
${context.learning_objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}
` : ''}

QUIZ FOCUS STRATEGY:
${quizFocusGuidance}

Design a quiz with 4-6 questions that:
1. BUILD ON the specific content shown above
2. Reference details from the available modules (character names if story, parameter values if experiment, symbols if formula, concepts if text)
3. Test true understanding, not just memory
4. Include a mix of difficulty levels (at least 1 easy, 1 hard)
5. Provide educational explanations (30-50 words each)

ADAPTATION RULES:
- If NO experiment: Focus on conceptual understanding and real-world scenarios
- If NO story: Use hypothetical scenarios or direct concept testing
- If NO formula: Test principles and qualitative relationships
- If multiple content types: Create questions that connect across modules

IMPORTANT: 
- Questions should feel CONNECTED to what students just learned
- Reference specific details from the actual content provided
- Test application and critical thinking, not just recall
- Make students reflect: "This tests what I learned in [specific module]!"

Design questions that verify deep understanding of the Canvas as a whole.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            question_type: {
              type: Type.STRING,
              enum: ["multiple_choice", "true_false", "scenario_based"]
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            answer_index: { type: Type.NUMBER },
            explanation: {
              type: Type.STRING,
              description: "Brief explanation of why this is correct (30-50 words)"
            },
            difficulty: {
              type: Type.STRING,
              enum: ["easy", "medium", "hard"]
            },
            source_module: {
              type: Type.STRING,
              description: "Which module this question is based on (e.g., 'Solar Powered Life story')"
            }
          },
          required: ["question", "question_type", "options", "answer_index", "explanation", "difficulty"]
        }
      },
      quiz_strategy: {
        type: Type.STRING,
        description: "Explain how these questions build on the previous modules"
      }
    },
    required: ["title", "questions", "quiz_strategy"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',  // 使用 Gemini 3 Flash（快速生成）
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.7,
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: 'medium' }
    },
  });

  return JSON.parse(response.text);
}

