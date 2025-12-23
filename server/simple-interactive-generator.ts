/**
 * 简洁版交互式应用生成器
 * 参考优秀 prompt 设计，避免过度复杂
 */

import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
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
- **If the spec mentions 3D visualization, 3D models, 3D simulation, or spatial concepts, you MUST use Three.js for 3D rendering**
- Keep total code under 400 lines when possible (3D apps may be longer)
- Add brief comments for key sections

**3D VISUALIZATION REQUIREMENTS (if applicable):**
If the spec requires 3D visualization (e.g., 3D molecular structures, 3D physics simulations, 3D geometric demonstrations, spatial relationships), you MUST:
1. **Use Three.js library** - Load via CDN: Use script tag with src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
2. **Create a proper 3D scene** with:
   - Scene, Camera, Renderer setup
   - Proper lighting (ambient + directional lights)
   - Interactive controls (OrbitControls for camera rotation)
   - Real-time rendering loop
3. **Include OrbitControls** for user interaction: Use script tag with src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
4. **Make it interactive** - Allow users to rotate, zoom, and pan the 3D view
5. **Update in real-time** - When parameters change, update the 3D visualization immediately
6. **Professional 3D rendering** - Use proper materials, colors, and geometry

**3D EXAMPLES TO REFERENCE:**
- Physics simulations: Charged particles in 3D fields, 3D wave propagation, 3D orbital motion
- Chemistry: 3D molecular structures, 3D crystal lattices, 3D reaction mechanisms
- Biology: 3D protein structures, 3D cell organelles, 3D anatomical models
- Geometry: 3D geometric shapes, 3D transformations, 3D projections
- Engineering: 3D mechanical systems, 3D fluid dynamics, 3D structural analysis

**IMPORTANT**: If the topic involves spatial relationships, 3D structures, or 3D motion, DO NOT use 2D Canvas or SVG. Use Three.js for proper 3D visualization.

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

**IMPORTANT - 3D Visualization Assessment:**
First, determine if this topic requires 3D visualization:
- Does it involve spatial relationships, 3D structures, or 3D motion?
- Examples that NEED 3D: molecular structures, 3D physics simulations, geometric 3D shapes, 3D animations, spatial demonstrations
- Examples that DON'T need 3D: 2D graphs, 2D charts, 2D diagrams, text-based interactions

If 3D is needed, explicitly state in your spec: "REQUIRES_3D_VISUALIZATION: true" and describe the 3D elements needed.

Follow the example format shown above. Be specific about:
- What parameters the user can adjust (sliders/toggles/inputs/word choices)
- What visual feedback they see in real-time (2D or 3D?)
- What educational explanations are shown
- What quiz questions verify understanding (if applicable)
- **Whether 3D visualization is required** (if yes, describe the 3D scene, objects, and interactions needed)

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
  
  // 检测是否需要3D可视化
  const requires3D = /REQUIRES_3D_VISUALIZATION|3D|three\.js|three-dimensional|spatial|3d visualization|3d simulation|3d model/i.test(spec);
  
  // 第二步：生成 HTML
  const htmlPrompt = spec + SPEC_ADDENDUM + (requires3D ? `

**CRITICAL: This spec requires 3D visualization. You MUST use Three.js.**
- Load Three.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
- Load OrbitControls: <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
- Create a proper 3D scene with Scene, PerspectiveCamera, WebGLRenderer
- Add lighting (AmbientLight + DirectionalLight)
- Enable OrbitControls for user interaction (rotate, zoom, pan)
- Update the 3D scene in real-time when parameters change
- Use proper 3D geometry, materials, and colors
- Make it professional and educational` : '');
  
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

