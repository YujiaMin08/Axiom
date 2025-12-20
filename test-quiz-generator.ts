/**
 * 智能测验生成器测试
 * 模拟完整的 Canvas 生成流程：先生成内容，再基于内容生成 quiz
 */

import { generateStoryContent } from './server/gemini-story-generator';
import { generateSimpleInteractiveApp } from './server/simple-interactive-generator';
import { generateQuizContent } from './server/gemini-quiz-generator';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

/**
 * 完整流程测试：apple 单词学习
 */
async function testLanguageQuiz() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '📚 语言学习 Quiz 测试（基于故事）' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'apple';
  const domain = 'LANGUAGE';

  console.log(colors.cyan + '第一步：生成故事内容...' + colors.reset);
  
  // 生成故事
  const story = await generateStoryContent(topic, domain, {
    type: 'story',
    title: "The Apple's Many Faces",
    description: 'A story showing the word "apple" in different contexts'
  });
  
  console.log(colors.green + `✅ 故事已生成: "${story.title}" (${story.narrative_text.length}字符)\n` + colors.reset);

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(colors.cyan + '第二步：基于故事生成 Quiz...' + colors.reset);
  
  // 生成 quiz
  const quiz = await generateQuizContent(topic, domain, {
    type: 'quiz',
    title: 'Test Your Understanding',
    description: 'Verify understanding of the word "apple" through the story'
  }, {
    generated_modules: [
      {
        type: 'story',
        title: story.title,
        content: story
      }
    ],
    target_audience: 'G7-G9'
  });

  console.log(colors.green + `✅ Quiz 已生成: ${quiz.questions.length} 个问题\n` + colors.reset);

  displayQuiz(quiz, story);

  // 保存结果
  const fs = require('fs');
  const result = {
    topic,
    domain,
    story,
    quiz
  };
  fs.writeFileSync('./language-quiz-result.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: language-quiz-result.json' + colors.reset);
}

/**
 * 完整流程测试：photosynthesis 知识学习
 */
async function testScienceQuiz() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🔬 科学学习 Quiz 测试（基于交互实验）' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'photosynthesis';
  const domain = 'SCIENCE';

  console.log(colors.cyan + '第一步：生成交互实验配置...' + colors.reset);
  
  // 这里我们用简化的交互配置（之前生成的）
  const experimentConfig = {
    parameters: [
      { name: '光照强度', min: 0, max: 100, default: 50, unit: '%' },
      { name: '二氧化碳浓度', min: 0, max: 2000, default: 400, unit: 'ppm' },
      { name: '环境温度', min: 0, max: 50, default: 25, unit: '°C' }
    ],
    output: { name: '氧气产生速率', unit: 'mL/min' }
  };
  
  console.log(colors.green + `✅ 实验配置: 3个参数\n` + colors.reset);

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(colors.cyan + '第二步：基于实验生成 Quiz...' + colors.reset);
  
  const quiz = await generateQuizContent(topic, domain, {
    type: 'quiz',
    title: 'The Botanist\'s Challenge',
    description: 'Apply your understanding of photosynthesis factors'
  }, {
    generated_modules: [
      {
        type: 'experiment',
        title: 'The Bubble Factory',
        content: experimentConfig
      }
    ],
    learning_objectives: [
      'Understand limiting factors in photosynthesis',
      'Recognize the effect of temperature on enzyme activity',
      'Identify optimal conditions for photosynthesis'
    ]
  });

  console.log(colors.green + `✅ Quiz 已生成: ${quiz.questions.length} 个问题\n` + colors.reset);

  displayQuiz(quiz, experimentConfig);

  const fs = require('fs');
  fs.writeFileSync('./science-quiz-result.json', JSON.stringify({
    topic, domain, experimentConfig, quiz
  }, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: science-quiz-result.json' + colors.reset);
}

/**
 * 显示 Quiz 内容
 */
function displayQuiz(quiz: QuizContentOutput, sourceContent: any) {
  console.log(colors.bright + '📝 生成的 Quiz:' + colors.reset);
  console.log(`  标题: ${colors.cyan}${quiz.title}${colors.reset}`);
  console.log(`  问题数: ${quiz.questions.length}`);
  console.log();

  console.log(colors.bright + '💡 Quiz 设计策略:' + colors.reset);
  console.log(colors.gray + quiz.quiz_strategy + colors.reset);
  console.log();

  console.log(colors.bright + '❓ 问题列表:' + colors.reset);
  quiz.questions.forEach((q, idx) => {
    console.log(`\n  ${colors.yellow}问题 ${idx + 1}${colors.reset} [${q.difficulty}] ${q.question_type}`);
    if (q.source_module) {
      console.log(`  ${colors.gray}来源: ${q.source_module}${colors.reset}`);
    }
    console.log(`  ${q.question}`);
    console.log();
    q.options.forEach((opt, optIdx) => {
      const marker = optIdx === q.answer_index ? colors.green + '  ✓ ' : '    ';
      console.log(`${marker}${opt}${colors.reset}`);
    });
    console.log();
    console.log(`  ${colors.gray}解释: ${q.explanation}${colors.reset}`);
  });

  console.log(colors.green + '\n✅ Quiz 生成成功！' + colors.reset);
}

// 主函数
async function main() {
  console.log(colors.bright + colors.magenta);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom 智能测验生成器测试工具                          ║
  ║         Testing Context-Aware Quiz Generation                ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'language';

  if (mode === 'science') {
    await testScienceQuiz();
  } else {
    await testLanguageQuiz();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

