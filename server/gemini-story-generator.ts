/**
 * Gemini 故事生成器
 * 独立实现，用于测试验证，暂不接入主系统
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * 故事内容输出结构
 */
interface StoryContentOutput {
  title: string;
  narrative_text: string;
  key_sentence: string;  // 故事的核心句子（可用于展示或引用）
  illustration_prompts: string[];  // 插图提示（供图像生成用）
  story_type: 'educational' | 'allegory' | 'historical' | 'scenario';
  word_highlights?: string[];  // 在故事中应该高亮的关键词
  moral_or_takeaway?: string;  // 故事的寓意或启示
}

/**
 * 模块计划
 */
interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 使用 Gemini 2.5 Flash 生成故事内容
 * 
 * @param topic - 主题
 * @param domain - 领域
 * @param modulePlan - 模块计划
 * @param context - 上下文信息
 */
export async function generateStoryContent(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    target_words?: string[];  // 如果是多词汇融合故事
    story_length?: 'short' | 'medium' | 'long';
    narrative_style?: string;
    other_modules?: ModulePlan[];
  }
): Promise<StoryContentOutput> {
  
  const systemInstruction = `You are a master storyteller and educational narrative designer for Axiom, creating engaging stories for students aged 12-18 (G7-G12).

Your role is to craft stories that make learning memorable, meaningful, and enjoyable. Stories are powerful learning tools because they:
- Create emotional connections to concepts
- Provide memorable context for abstract ideas
- Show real-world applications naturally
- Make learning feel less like work and more like discovery

Core Principles for Educational Stories:

1. **Purpose-Driven**: Every story element should serve the learning goal
2. **Age-Appropriate**: Language and themes suitable for G7-G12
3. **Culturally Aware**: Use diverse settings and characters when appropriate
4. **Memorable**: Include vivid imagery and emotional moments
5. **Educational Value**: Seamlessly integrate learning points without being preachy

Story Types by Domain:

${domain === 'LANGUAGE' ? `
**LANGUAGE Domain Stories**:

Purpose: Help students understand word meanings, usage, and cultural context through narrative.

Approaches:
- **Word Journey**: Follow the word through different contexts and time periods
- **Character Story**: A character encounters situations where the word is key
- **Multi-Word Fusion**: Weave multiple seemingly unrelated words into one coherent narrative
- **Etymology Tale**: Personify the word's historical evolution

Guidelines:
- Use the target word(s) naturally and repeatedly in context
- Show different meanings or nuances through story situations
- Include dialogue when appropriate
- Make the story relatable to student life or universal experiences
- **CRITICAL LENGTH REQUIREMENTS**:
  - **Single word story**: 50-120 words (MUST be brief and punchy)
  - **Multi-word fusion**: 150-300 words (keep it tight)
  - Students lose interest if too long - prioritize conciseness over completeness
` : ''}

${domain === 'SCIENCE' ? `
**SCIENCE Domain Stories**:

Purpose: Make scientific concepts tangible and relatable through narrative analogies.

Approaches:
- **Analogy Story**: Use everyday situations as analogies for scientific processes
- **Historical Discovery**: Tell the story of how the concept was discovered
- **Personification**: Give molecules, forces, or processes character and agency
- **Thought Experiment**: Narrative-based "what if" scenarios

Guidelines:
- Start with familiar experiences
- Build up to the scientific concept naturally
- Use vivid sensory descriptions
- Include the "aha moment" where understanding clicks
- Avoid heavy terminology in the narrative; explain afterward
- Length: 250-500 words
` : ''}

${domain === 'LIBERAL_ARTS' ? `
**LIBERAL_ARTS Domain Stories**:

Purpose: Illuminate complex social, historical, or philosophical concepts through human narratives.

Approaches:
- **Historical Narrative**: Bring historical events or periods to life
- **Parable/Allegory**: Use symbolic stories to explore abstract concepts
- **Cross-Cultural Tale**: Show how different cultures view the same idea
- **Real-Life Scenario**: Contemporary situations that embody the concept

Guidelines:
- Use specific, concrete details to ground abstract ideas
- Include multiple perspectives when relevant
- Connect to students' lives and concerns
- Encourage critical thinking through open-ended elements
- Show complexity and nuance, avoid oversimplification
- Length: 300-600 words
` : ''}

Narrative Craft:

- **Opening Hook**: Start with an intriguing situation or question
- **Character Development**: Even brief stories need relatable characters
- **Vivid Details**: Use sensory language to create mental images
- **Natural Dialogue**: When used, make it sound authentic
- **Emotional Arc**: Build tension or curiosity, then resolution
- **Learning Integration**: The "lesson" emerges naturally, not forced

Illustration Prompt:

- Provide ONE key visual scene that best captures the story's essence
- Be highly specific about setting, characters, mood, and visual elements
- This will be used for image generation - clarity and detail are critical
- Choose the most important moment or concept to visualize

Bilingual Approach:
- Write the story primarily in English for narrative flow
- Include Chinese annotations for key educational terms
- Keep it natural - don't break the narrative flow`;

  // 根据是否是单词学习决定长度
  const isSingleWord = !context?.target_words || context.target_words.length <= 1;
  const isMultiWord = context?.target_words && context.target_words.length > 1;
  
  let targetLength: string;
  if (isSingleWord && domain === 'LANGUAGE') {
    targetLength = '50-120 words';  // 单词学习：超短故事
  } else if (isMultiWord && domain === 'LANGUAGE') {
    targetLength = '100-200 words';  // 多词融合：中等长度
  } else {
    // Science/Liberal Arts 可以稍长
    const storyLength = context?.story_length || 'medium';
    const lengthGuide = {
      short: '50-80 words',
      medium: '80-130 words',
      long: '130-200 words'
    };
    targetLength = lengthGuide[storyLength];
  }

  const userPrompt = `Topic: "${topic}"
Domain: ${domain}
Module Title: "${modulePlan.title}"
${modulePlan.description ? `Module Description: ${modulePlan.description}` : ''}

${context?.target_words ? `
Target Words to Include: ${context.target_words.join(', ')}
(These words should appear naturally throughout the story)
` : ''}

${context?.narrative_style ? `
Preferred Narrative Style: ${context.narrative_style}
` : ''}

${context?.other_modules ? `
Context - Other modules in this Canvas:
${context.other_modules.map(m => `- ${m.title} (${m.type})`).join('\n')}
` : ''}

Create an engaging educational story for this module.

CRITICAL REQUIREMENTS:
- **Length: ${targetLength}** - This is STRICT. Do not exceed this word count.
${isSingleWord && domain === 'LANGUAGE' ? '- **MUST be brief**: For single word learning, keep it punchy and memorable. Students will lose interest if too long.' : ''}
- Age: G7-G12 students
- Style: Engaging, vivid, memorable
- Educational: Naturally integrates learning points
- Complete: Must have clear beginning, middle, and end (even if brief)
- Bilingual: English narrative with Chinese term annotations where helpful

${isSingleWord ? 'Focus on ONE memorable scene or moment that captures the word\'s essence. Quality over length.' : 'The story should weave the concepts/words naturally into a coherent narrative.'}

Make it memorable and meaningful within the word limit!`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { 
        type: Type.STRING,
        description: "Story title (can enhance the planner's title)"
      },
      narrative_text: { 
        type: Type.STRING,
        description: `Complete story narrative. STRICT length requirement: ${targetLength}. Write a concise, complete story with beginning, middle, and end. Stay within word limit.`
      },
      key_sentence: {
        type: Type.STRING,
        description: "The one sentence that captures the essence of the story"
      },
      illustration_prompts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "ONE key illustration that captures the story's essence. Be specific and detailed for image generation."
      },
      story_type: {
        type: Type.STRING,
        enum: ["educational", "allegory", "historical", "scenario"],
        description: "The narrative approach used"
      },
      word_highlights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key words that should be highlighted in the story (for language learning)"
      },
      moral_or_takeaway: {
        type: Type.STRING,
        description: "The learning takeaway or moral of the story"
      }
    },
    required: ["title", "narrative_text", "key_sentence", "illustration_prompts", "story_type"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,  // 高创造性，适合故事创作
        candidateCount: 1,
        maxOutputTokens: 8192,
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini Story Generator Error:', error);
    throw error;
  }
}

/**
 * 生成多词汇融合故事（Language 领域特殊功能）
 */
export async function generateMultiWordFusionStory(
  words: string[],
  domain: string = 'LANGUAGE',
  preferences?: {
    story_length?: 'short' | 'medium' | 'long';
    style?: string;
  }
): Promise<StoryContentOutput> {
  
  const modulePlan: ModulePlan = {
    type: 'story',
    title: `A Tale of ${words.slice(0, 3).join(', ')}${words.length > 3 ? '...' : ''}`,
    description: `A creative story that naturally incorporates these words: ${words.join(', ')}`
  };

  return generateStoryContent(
    words.join(', '),
    domain,
    modulePlan,
    {
      target_words: words,
      story_length: preferences?.story_length,
      narrative_style: preferences?.style,
    }
  );
}

