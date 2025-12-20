/**
 * 简化版交互应用测试
 * 只生成参数配置，使用模板生成 HTML
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateSimpleInteractive() {
  console.log('\n🧪 简化版交互应用测试\n');
  
  const prompt = `为光合作用实验设计一个交互式模拟器。

要求：
1. 可调节参数（2-4个）：光照强度、CO2浓度、温度等
2. 实时输出：氧气产生速率
3. 可视化：气泡动画或图表
4. 3-5个验证问题

返回JSON，包含：
- parameters: [{name, min, max, default, unit, description}]
- output: {name, unit, formula_description}
- visualization_type: 'bubbles' | 'chart' | 'bar'
- quiz_questions: [{question, options, answer_index}]`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          parameters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                default: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          output: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              unit: { type: Type.STRING },
              formula_description: { type: Type.STRING }
            }
          },
          visualization_type: { type: Type.STRING },
          quiz_questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer_index: { type: Type.NUMBER }
              }
            }
          }
        }
      },
      temperature: 0.7,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingLevel: 'medium' }
    }
  });

  const config = JSON.parse(response.text);
  
  console.log('✅ 配置生成成功\n');
  console.log('参数:');
  config.parameters.forEach((p: any) => {
    console.log(`  - ${p.name}: ${p.min}-${p.max} ${p.unit}`);
    console.log(`    ${p.description}`);
  });
  
  console.log(`\n输出: ${config.output.name} (${config.output.unit})`);
  console.log(`可视化: ${config.visualization_type}`);
  console.log(`\n测验问题: ${config.quiz_questions.length} 个\n`);
  
  const fs = require('fs');
  fs.writeFileSync('./simple-interactive-config.json', JSON.stringify(config, null, 2), 'utf-8');
  console.log('💾 已保存到: simple-interactive-config.json\n');
}

generateSimpleInteractive().catch(e => console.error(e));

