/**
 * 场景生成器Demo测试
 * 展示互动式语言学习场景
 */

import { generateScenarioContent } from './server/gemini-scenario-generator';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function test() {
  console.log('\n🎭 场景生成器Demo - 咖啡店点咖啡\n');
  
  const scenario = await generateScenarioContent(
    'Ordering coffee at a cafe (beginner level)',
    {
      type: 'scenario',
      title: 'Coffee Shop Practice',
      description: 'Beginner-friendly cafe ordering scenario'
    },
    {
      difficulty_level: 'beginner',
      focus_skills: ['politeness', 'ordering', 'basic_conversation']
    }
  );

  console.log(colors.bright + `📍 ${scenario.title}` + colors.reset);
  console.log(`类型: ${colors.yellow}${scenario.scenario_type}${colors.reset}\n`);

  console.log(colors.bright + '🎬 场景设定:' + colors.reset);
  console.log(`  地点: ${scenario.setting.location}`);
  console.log(`  情境: ${scenario.setting.context}`);
  console.log(`  你的角色: ${colors.cyan}${scenario.setting.your_role}${colors.reset}`);
  console.log(`  其他角色: ${scenario.setting.other_characters.join(', ')}\n`);

  console.log(colors.bright + '💬 互动对话:' + colors.reset);
  console.log();

  scenario.dialogue_sequence.forEach(step => {
    console.log(colors.cyan + `步骤 ${step.step}:` + colors.reset);
    console.log(`  ${colors.gray}${step.situation}${colors.reset}`);
    if (step.npc_says) {
      console.log(`  ${colors.blue}对方说: "${step.npc_says}"${colors.reset}`);
    }
    console.log(`\n  ${colors.yellow}你可以怎么回应？${colors.reset}\n`);

    step.your_options.forEach((option, idx) => {
      const appropriatenessColor = {
        'excellent': colors.green,
        'good': colors.green,
        'acceptable': colors.yellow,
        'poor': colors.red
      }[option.appropriateness];

      console.log(`  ${String.fromCharCode(65 + idx)}) "${option.text}"`);
      console.log(`     ${appropriatenessColor}[${option.appropriateness}]${colors.reset} (${option.tone})`);
      console.log(`     ${colors.gray}→ ${option.feedback}${colors.reset}`);
      if (option.vocabulary_highlighted && option.vocabulary_highlighted.length > 0) {
        console.log(`     ${colors.cyan}词汇: ${option.vocabulary_highlighted.join(', ')}${colors.reset}`);
      }
      console.log();
    });

    if (step.learning_point) {
      console.log(`  ${colors.magenta}💡 学习要点: ${step.learning_point}${colors.reset}`);
    }
    console.log();
  });

  console.log(colors.bright + '📚 关键词汇:' + colors.reset);
  scenario.key_vocabulary.forEach((vocab, idx) => {
    console.log(`  ${idx + 1}. ${colors.cyan}${vocab.word}${colors.reset}: ${vocab.meaning}`);
    console.log(`     ${colors.gray}用法: ${vocab.usage_context}${colors.reset}`);
  });

  if (scenario.cultural_notes && scenario.cultural_notes.length > 0) {
    console.log(`\n${colors.bright}🌍 文化提示:${colors.reset}`);
    scenario.cultural_notes.forEach((note, idx) => {
      console.log(`  ${idx + 1}. ${note}`);
    });
  }

  const fs = require('fs');
  fs.writeFileSync('./scenario-demo-result.json', JSON.stringify(scenario, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: scenario-demo-result.json' + colors.reset);
  console.log(colors.green + '\n✅ 场景生成成功！' + colors.reset);
  
  console.log(colors.cyan + '\n💡 这是互动式的语言练习场景，不同于叙述性故事\n' + colors.reset);
}

test().catch(e => console.error('\n❌ 错误:', e));

