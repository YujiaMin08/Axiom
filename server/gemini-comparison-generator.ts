/**
 * Gemini 对比分析生成器
 * 生成结构化的对比表格数据
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * 对比输出结构
 */
interface ComparisonContentOutput {
  title: string;
  items_compared: string[];  // 对比的对象（通常2个，最多3个）
  comparison_table: Array<{
    aspect: string;  // 对比维度（如 "输入", "输出", "位置"）
    values: { [item: string]: string };  // 每个对象在这个维度上的值
    insight?: string;  // 这个维度揭示的关键洞察
  }>;
  similarities: string[];  // 相似之处（2-3个）
  differences: string[];  // 差异之处（2-3个）
  key_insight: string;  // 核心洞察（一句话总结）
  visual_suggestion?: string;  // 建议的可视化方式
}

/**
 * 使用 Gemini 3 Flash 生成对比分析
 */
export async function generateComparisonContent(
  topic: string,
  domain: string,
  modulePlan: any,
  context?: {
    items_to_compare?: string[];  // 如果已知要对比什么
    language?: 'en' | 'zh';  // 内容语言设置
  }
): Promise<ComparisonContentOutput> {
  
  // 确定输出语言（LANGUAGE 领域始终双语）
  const outputLanguage = domain === 'LANGUAGE' ? 'bilingual' : (context?.language || 'en');
  
  // 构建语言要求说明
  const languageRequirement = domain === 'LANGUAGE' 
    ? `**LANGUAGE REQUIREMENT**: Use BILINGUAL format (English + Chinese). Main content in English, with Chinese translations provided.`
    : outputLanguage === 'zh'
    ? `**LANGUAGE REQUIREMENT**: Generate ALL content in CHINESE (简体中文) only. All text, descriptions, and comparisons must be in Chinese.`
    : `**LANGUAGE REQUIREMENT**: Generate ALL content in ENGLISH only. All text, descriptions, and comparisons must be in English.`;

  const systemInstruction = `You are an expert educator specializing in comparative analysis and helping students understand concepts through contrast and comparison.

${languageRequirement}

Your role is to create clear, structured comparisons that highlight both similarities and differences, helping students develop deeper understanding through contrast.

Comparison Design Principles:

1. **Choose Meaningful Dimensions**: Select 4-6 aspects that truly reveal the nature of the items
2. **Balance**: Show both similarities AND differences
3. **Insight-Driven**: Each comparison dimension should lead to understanding
4. **Clarity**: Use simple, direct language
5. **Structure**: Organize as a comparison table for easy scanning

Types of Comparisons:

**Concept vs Concept** (e.g., Photosynthesis vs Respiration):
- Focus on: inputs, outputs, location, purpose, energy flow
- Goal: Show how they complement each other or serve different purposes

**Method vs Method** (e.g., Deduction vs Induction):
- Focus on: approach, starting point, certainty, use cases
- Goal: Show when to use which method

**Historical vs Modern** (e.g., Ancient Democracy vs Modern Democracy):
- Focus on: participants, decision process, scale, technology
- Goal: Show evolution and adaptation

**Cultural vs Cultural** (e.g., Chinese New Year vs Western New Year):
- Focus on: timing, symbolism, traditions, values
- Goal: Show diversity and underlying human universals

Output Guidelines:

- Create 4-6 comparison dimensions (aspects)
- For each dimension, provide values for each item being compared
- Highlight 2-3 key similarities
- Highlight 2-3 key differences
- Provide one overarching insight that ties it together
- Suggest a visual representation (table, Venn diagram, side-by-side, etc.)`;

  const userPrompt = `Topic: "${topic}"
Domain: ${domain}
Module: "${modulePlan.title}"
${modulePlan.description || ''}

${context?.items_to_compare ? `
Items to Compare: ${context.items_to_compare.join(' vs ')}
` : 'Identify the 2 most meaningful items/concepts to compare from this topic.'}

Create a structured comparison that helps students understand through contrast.

Requirements:
1. Identify 2 (or occasionally 3) items to compare
2. Create a comparison table with 4-6 meaningful dimensions
3. Highlight 2-3 key similarities
4. Highlight 2-3 key differences
5. Provide one overarching insight
6. Suggest the best visual format (table/Venn diagram/side-by-side cards)

Make the comparison educational, clear, and insightful.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      items_compared: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The 2-3 items being compared"
      },
      comparison_table: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            aspect: { type: Type.STRING, description: "The dimension being compared" },
            values: {
              type: Type.STRING,
              description: "JSON string mapping each item to its value for this aspect"
            },
            insight: { type: Type.STRING }
          }
        },
        description: "4-6 comparison dimensions with values for each item"
      },
      similarities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 key similarities between the items"
      },
      differences: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 key differences between the items"
      },
      key_insight: {
        type: Type.STRING,
        description: "One sentence capturing the essence of the comparison"
      },
      visual_suggestion: {
        type: Type.STRING,
        description: "Suggested visual format (e.g., 'side-by-side table', 'Venn diagram', 'flow chart')"
      }
    },
    required: ["title", "items_compared", "comparison_table", "similarities", "differences", "key_insight"]
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
      thinkingConfig: { thinkingLevel: 'medium' }
    },
  });

  const result = JSON.parse(response.text);
  
  // 解析 values JSON 字符串
  result.comparison_table = result.comparison_table.map((row: any) => ({
    ...row,
    values: typeof row.values === 'string' ? JSON.parse(row.values) : row.values
  }));

  return result;
}

