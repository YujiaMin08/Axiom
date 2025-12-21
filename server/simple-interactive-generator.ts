/**
 * 简洁版交互式应用生成器
 * 参考优秀 prompt 设计，避免过度复杂
 */

import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAw4tkBsTJYW0kYhkoGMX5RBCyt_EzJpPI';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const CODE_REGION_OPENER = '```html';
const CODE_REGION_CLOSER = '```';

/**
 * 生成交互应用规范的 Prompt
 */
const INTERACTIVE_APP_PROMPT = `You are a pedagogist and product designer with deep expertise in crafting engaging learning experiences via interactive web apps for students aged 12-18 (G7-G12).

You will be given a learning topic and module description. Your task is to write a detailed and carefully considered spec for an interactive web app designed to teach this concept through hands-on exploration.

Here is an example spec:

"In biology, photosynthesis is the process where plants convert light energy into chemical energy. Key factors include light intensity, CO2 concentration, and temperature.

Build me an interactive web app to help a learner understand how environmental factors affect photosynthesis rate.

SPECIFICATIONS:
1. The app must feature 3 adjustable sliders: Light Intensity (0-100%), CO2 Concentration (0-2000 ppm), and Temperature (0-50°C).
2. The app must display real-time oxygen production rate (mL/min) that responds to parameter changes.
3. The app must include a visual simulation (e.g., animated bubbles or a line chart) showing the output.
4. The app must explain the relationship between parameters and output (e.g., 'Higher light = more oxygen, but only up to a point').
5. The app must include 3-5 quick quiz questions to verify understanding.
6. The app should have a 'Predict' mode where students guess the outcome before adjusting parameters.
7. The app should celebrate correct predictions and provide hints for incorrect ones."

The goal is to create something simple yet effective. The spec should be implementable by a junior web developer in a single HTML file (with all styles and scripts inline).

Most importantly, the spec must clearly outline the core mechanics of the app - the interactive loop of Predict → Adjust → Observe → Understand → Verify.

For the given topic, design a spec that:
- Focuses on 2-4 key adjustable parameters
- Has clear, immediate visual feedback
- Includes educational explanations that appear progressively
- NO quiz or verification questions needed (focus on exploration)
- Encourages experimentation and discovery
- Uses a clean, minimal design philosophy`;

const SPEC_ADDENDUM = `

The app must be fully responsive and function properly on both desktop and mobile. 

Now, implement this spec as a single, self-contained HTML document with all styles and scripts inline.

CRITICAL DESIGN REQUIREMENTS:
- **Color scheme**: Light/bright theme with WHITE or very light background (e.g., #FDFCF5, #F9F6F0)
- **NO dark mode**: Use bright, clean colors suitable for educational content
- **NO quiz section**: Remove any verification quiz - focus purely on interactive exploration
- **Visual style**: Clean, minimal, modern - think "Notion" or "Linear" aesthetic
- **Text color**: Dark text on light background for readability

Technical Requirements:
- Complete, working code (no placeholders or TODOs)
- Modern, clean design with smooth animations
- Mobile-responsive (works on phone screens)
- Educational and engaging UI
- Immediate feedback on interactions
- Use vanilla JavaScript (ES6+), CSS3, and HTML5
- If visualization needs a chart, you may use Chart.js via CDN
- Keep total code under 400 lines when possible
- Add brief comments for key sections

EXAMPLE COLOR PALETTE (use similar bright colors):
- Background: #FDFCF5 or white
- Primary: #2563eb (blue)
- Success: #10b981 (green)
- Warning: #f59e0b (amber)
- Text: #1e293b (dark slate)
- Borders: #e2e8f0 (light gray)

In your response, encase the complete HTML code between "${CODE_REGION_OPENER}" and "${CODE_REGION_CLOSER}" for easy parsing.`;

interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 生成交互式应用（一步生成：spec + HTML）
 */
export async function generateSimpleInteractiveApp(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    learning_goal?: string;
  }
): Promise<{ spec: string; html: string }> {
  
  const learning_goal = context?.learning_goal || 
    `Understand ${topic} through interactive exploration`;

  // 根据领域调整 prompt
  const domainSpecificGuidance = domain === 'LANGUAGE' ? `
  
IMPORTANT: This is a LANGUAGE learning topic. Design an interactive language learning app, NOT a scientific experiment.

For LANGUAGE domain, the app should focus on:
- Vocabulary practice and exploration
- Word usage in different contexts
- Interactive dialogues or scenarios
- Language patterns and structures
- Pronunciation or spelling practice (if applicable)

Examples of LANGUAGE interactive apps:
- Word builder: Adjust word parts to form different words
- Context explorer: See how the word changes meaning in different sentences
- Dialogue builder: Construct conversations using the word
- Usage frequency: Explore how the word is used in different contexts
- Etymology explorer: See word evolution and related words

DO NOT create scientific experiments with sliders for physical parameters.
DO create language-focused interactive experiences.` : '';

  // 第一步：生成 spec
  const specPrompt = `Topic: "${topic}"
Domain: ${domain}
Module: "${modulePlan.title}"
${modulePlan.description ? `Description: ${modulePlan.description}` : ''}
Learning Goal: ${learning_goal}
${domainSpecificGuidance}

Write a detailed spec for an interactive web app to teach this concept.

Follow the example format shown above. Be specific about:
- What parameters the user can adjust (sliders/toggles/inputs/word choices)
- What visual feedback they see in real-time
- What educational explanations are shown
- What quiz questions verify understanding (if applicable)

Make the spec clear and implementable.`;

  console.log('  → 生成应用规范...');
  const specResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: specPrompt,
    config: {
      systemInstruction: INTERACTIVE_APP_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingLevel: 'medium' }
    },
  });

  const spec = specResponse.text;
  console.log('  ✅ 规范生成完成');
  
  // 等待避免限流
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 第二步：生成 HTML
  const htmlPrompt = spec + SPEC_ADDENDUM;
  
  console.log('  → 生成 HTML 实现...');
  const htmlResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: htmlPrompt,
    config: {
      temperature: 0.6,  // 稍低确保代码质量
      maxOutputTokens: 16384,  // 足够生成完整 HTML
      thinkingConfig: { thinkingLevel: 'minimal' }  // 降低思考，聚焦代码生成
    },
  });

  console.log('  ✅ HTML 生成完成');
  
  const responseText = htmlResponse.text;
  
  // 提取 HTML 代码（在 ``` 之间）
  const codeMatch = responseText.match(/```html\n([\s\S]*?)\n```/);
  const html = codeMatch ? codeMatch[1] : responseText;
  
  return {
    spec,
    html
  };
}

