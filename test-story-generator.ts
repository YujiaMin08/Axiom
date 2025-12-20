/**
 * 故事生成器测试脚本
 */

import { generateStoryContent, generateMultiWordFusionStory } from './server/gemini-story-generator';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

/**
 * 测试单词故事生成
 */
async function testSingleWordStory() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🧪 单词故事生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'apple';
  const domain = 'LANGUAGE';
  const modulePlan = {
    type: 'story',
    title: 'The Apple\'s Journey',
    description: 'A creative story involving the word "apple" to show its usage and cultural significance.'
  };

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 模块: ${modulePlan.title}` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 2.5 Flash...\n' + colors.reset);

  try {
    const story = await generateStoryContent(topic, domain, modulePlan);

    displayStory(story);

    // 保存结果
    const fs = require('fs');
    fs.writeFileSync(
      './story-generator-result.json',
      JSON.stringify(story, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: story-generator-result.json' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 测试多词汇融合故事（PRD 场景3）
 */
async function testMultiWordStory() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.magenta + '🎨 多词汇融合故事测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const words = ['apple', 'telescope', 'jealousy', 'refund'];

  console.log(colors.cyan + `📚 目标词汇: ${words.join(', ')}` + colors.reset);
  console.log(colors.gray + '正在生成融合故事...\n' + colors.reset);

  try {
    const story = await generateMultiWordFusionStory(words, 'LANGUAGE', {
      story_length: 'medium',
      style: 'creative and engaging'
    });

    displayStory(story);

    // 保存结果
    const fs = require('fs');
    fs.writeFileSync(
      './multi-word-story-result.json',
      JSON.stringify(story, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: multi-word-story-result.json' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 测试场景学习故事（咖啡店点咖啡）
 */
async function testCafeScenarioStory() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.cyan + '☕ 场景学习故事测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'Ordering coffee at a cafe';
  const domain = 'LANGUAGE';
  const modulePlan = {
    type: 'story',
    title: 'Coffee Shop Encounter',
    description: 'A beginner-friendly scenario showing how to order coffee naturally in English'
  };

  console.log(colors.cyan + `📚 场景: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 故事: ${modulePlan.title}` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 2.5 Flash...\n' + colors.reset);

  try {
    const story = await generateStoryContent(topic, domain, modulePlan);

    displayStory(story);

    // 保存结果
    const fs = require('fs');
    fs.writeFileSync(
      './cafe-story-result.json',
      JSON.stringify(story, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: cafe-story-result.json' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 测试科学概念故事
 */
async function testScienceStory() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🔬 科学故事生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'photosynthesis';
  const domain = 'SCIENCE';
  const modulePlan = {
    type: 'story',
    title: 'The Solar Chef',
    description: 'A narrative following a carbon atom as it travels from the air into a leaf, personifying the process.'
  };

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 故事: ${modulePlan.title}` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 2.5 Flash...\n' + colors.reset);

  try {
    const story = await generateStoryContent(topic, domain, modulePlan);

    displayStory(story);

    // 保存结果
    const fs = require('fs');
    fs.writeFileSync(
      './science-story-result.json',
      JSON.stringify(story, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: science-story-result.json' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 显示故事内容
 */
function displayStory(story: StoryContentOutput) {
  console.log(colors.bright + '📖 生成的故事:' + colors.reset);
  console.log(`  标题: ${colors.green}${story.title}${colors.reset}`);
  console.log(`  类型: ${colors.yellow}${story.story_type}${colors.reset}`);
  console.log(`  长度: ${story.narrative_text.length} 字符\n`);

  console.log(colors.bright + '💫 核心句子:' + colors.reset);
  console.log(colors.cyan + `  "${story.key_sentence}"${colors.reset}\n`);

  console.log(colors.bright + '📝 故事正文:' + colors.reset);
  console.log(colors.gray + '─'.repeat(80) + colors.reset);
  console.log(story.narrative_text);
  console.log(colors.gray + '─'.repeat(80) + colors.reset);

  if (story.word_highlights && story.word_highlights.length > 0) {
    console.log(`\n${colors.bright}🎯 高亮词汇:${colors.reset}`);
    console.log(`  ${story.word_highlights.join(', ')}`);
  }

  if (story.moral_or_takeaway) {
    console.log(`\n${colors.bright}💡 故事启示:${colors.reset}`);
    console.log(colors.yellow + `  ${story.moral_or_takeaway}${colors.reset}`);
  }

  console.log(`\n${colors.bright}🎨 插图提示:${colors.reset}`);
  story.illustration_prompts.forEach((prompt, idx) => {
    console.log(`  ${idx + 1}. ${colors.gray}${prompt}${colors.reset}`);
  });

  console.log(colors.green + '\n✅ 故事生成成功！' + colors.reset);
}

// 主函数
async function main() {
  console.log(colors.bright + colors.magenta);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom 故事生成器测试工具                              ║
  ║         Testing Gemini 2.5 Flash Story Generation            ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY 环境变量' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'single';

  if (mode === 'multi') {
    await testMultiWordStory();
  } else if (mode === 'science') {
    await testScienceStory();
  } else if (mode === 'cafe') {
    await testCafeScenarioStory();
  } else {
    await testSingleWordStory();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

