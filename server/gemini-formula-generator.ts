/**
 * Gemini 公式生成器
 * 独立实现，用于测试验证，暂不接入主系统
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * 公式内容输出结构
 */
interface FormulaContentOutput {
  title: string;
  main_formula: string;  // LaTeX 格式的主公式
  formula_explanation: string;  // 公式的文字说明
  symbol_table: Array<{
    symbol: string;
    meaning: string;
    unit?: string;
  }>;
  derivation_steps?: Array<{
    step_number: number;
    description: string;
    formula: string;  // LaTeX
    explanation: string;
  }>;
  key_insights: string[];
  example_application?: {
    scenario: string;
    given_values: { [key: string]: string };
    solution_steps: string[];
    final_answer: string;
  };
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 使用 Gemini 2.5 Flash 生成公式内容
 */
export async function generateFormulaContent(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    derivation_level?: 'simple' | 'detailed' | 'rigorous';
    include_proof?: boolean;
    target_audience?: string;
  }
): Promise<FormulaContentOutput> {
  
  const derivation_level = context?.derivation_level || 'detailed';
  const include_proof = context?.include_proof !== false;  // 默认包含推导
  const audience = context?.target_audience || 'G7-G12';

  const systemInstruction = `You are an expert mathematics educator specializing in making complex formulas accessible to students aged 12-18.

Your role is to present mathematical formulas not as intimidating symbols, but as logical expressions that connect intuition to precision.

Core Principles:

1. **Formula as Communication**: Every symbol tells a story
2. **Step-by-Step Clarity**: Break down derivations into digestible steps
3. **Visual Mapping**: Help students see what each symbol represents
4. **Connect to Intuition**: Link the mathematical expression to the conceptual understanding
5. **Bilingual Support**: Use English for formulas/symbols, Chinese for explanations

Formula Presentation Guidelines:

**For Beginner Level (G7-G9)**:
- Start with the simplest form
- Focus on what each variable means
- Use concrete examples with numbers
- Minimal algebraic manipulation
- Emphasize the "why" over the "how to derive"

**For Intermediate Level (G10-G11)**:
- Show 3-5 key derivation steps
- Explain the logic between steps
- Introduce key mathematical techniques (factoring, substitution, etc.)
- Balance intuition and rigor

**For Advanced Level (G12+)**:
- Complete rigorous derivation
- Show multiple approaches when relevant
- Discuss assumptions and limitations
- Connect to broader mathematical frameworks

LaTeX Formatting:
- Use clear, readable LaTeX syntax
- Break long formulas into multiple lines when helpful
- Use \\frac{}{} for fractions, \\sqrt{} for roots
- Use subscripts and superscripts appropriately
- Example: E = mc^2 should be written as E = mc^{2}

Derivation Structure:
- Number each step clearly
- Start each step with "Step N:"
- Explain the reasoning before showing the formula
- Highlight the key mathematical move (e.g., "Factor out the common term")
- Show the transformation clearly

Symbol Table:
- List every symbol used in the formula
- Provide clear, concise meanings
- Include units where applicable
- Order by importance or appearance`;

  const userPrompt = `Topic: "${topic}"
Domain: ${domain}
Module: "${modulePlan.title}"
${modulePlan.description || ''}
Target Audience: ${audience}
Derivation Level: ${derivation_level}

Generate a CONCISE yet complete formula explanation for this module.

Requirements:
1. Present the main formula in LaTeX format
2. Explain what it means in plain language (80-150 words - be concise!)
3. Create a complete symbol table (every variable explained briefly)
4. ${include_proof ? `Provide 3-5 KEY derivation steps (${derivation_level} level) - focus on major logical moves, not every algebraic step` : 'Brief derivation overview'}
5. Include 2-3 key insights (one sentence each)
6. Provide one worked example (5-7 solution steps maximum)
7. Use English for formulas and technical terms, Chinese for explanations

CRITICAL: Keep everything CONCISE. Students are exploring multiple modules, so each piece should be digestible. Quality over verbosity.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      main_formula: { 
        type: Type.STRING,
        description: "The primary formula in LaTeX format (e.g., 'E = mc^{2}')"
      },
      formula_explanation: {
        type: Type.STRING,
        description: "What the formula means in plain language. CONCISE: 80-150 words maximum. Focus on the essential meaning."
      },
      symbol_table: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            meaning: { type: Type.STRING },
            unit: { type: Type.STRING }
          }
        },
        description: "Table of all symbols used in the formula"
      },
      derivation_steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step_number: { type: Type.NUMBER },
            description: { type: Type.STRING, description: "Brief step description (10-20 words)" },
            formula: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Concise explanation (20-40 words)" }
          }
        },
        description: "Step-by-step derivation process. Limit to 3-5 key steps. Each explanation should be concise."
      },
      key_insights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 key insights about what the formula reveals"
      },
      example_application: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING },
          given_values: {
            type: Type.STRING,
            description: "Given values as text (e.g., 'a = 3, b = 4')"
          },
          solution_steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          final_answer: { type: Type.STRING }
        },
        description: "A worked example showing practical application"
      },
      difficulty_level: {
        type: Type.STRING,
        enum: ["beginner", "intermediate", "advanced"]
      }
    },
    required: ["title", "main_formula", "formula_explanation", "symbol_table", "key_insights", "difficulty_level"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  return JSON.parse(response.text);
}

