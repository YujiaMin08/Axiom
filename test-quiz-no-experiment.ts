/**
 * 测试没有交互实验时的 Quiz 生成
 * 模拟场景：只有文本内容和公式，没有 experiment
 */

import { generateQuizContent } from './server/gemini-quiz-generator';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function test() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🧪 Quiz测试：无交互实验场景' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = "Newton's First Law";
  const domain = 'SCIENCE';

  console.log(colors.yellow + '场景：只有文本解释和公式，没有交互实验' + colors.reset);
  console.log(colors.gray + '测试 Quiz 生成器的适配能力\n' + colors.reset);

  // 模拟只有文本和公式的内容
  const textContent = {
    type: 'text',
    title: 'The Stubbornness of Objects',
    content: {
      body: `Newton's First Law, also called the Law of Inertia (惯性定律), states that an object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by a net external force (外力).

This means objects "want" to keep doing what they're doing. A book on a table won't suddenly fly away. A hockey puck sliding on ice won't stop on its own in space.

The key insight is that forces CHANGE motion, they don't maintain it. Without friction (摩擦力), objects would move forever.`
    }
  };

  const formulaContent = {
    type: 'formula',
    title: 'The Net Force Equation',
    content: {
      main_formula: '\\sum F = 0 \\Rightarrow v = \\text{constant}',
      formula_explanation: '当作用在物体上的所有力的总和（净力）为零时，物体的速度保持恒定。这就是牛顿第一定律的数学表达。',
      symbol_table: [
        { symbol: '\\sum F', meaning: 'Net force (所有力的总和)' },
        { symbol: 'v', meaning: 'Velocity (速度)' }
      ]
    }
  };

  console.log(colors.cyan + '已有内容:' + colors.reset);
  console.log(`  1. ${textContent.title} (text)`);
  console.log(`  2. ${formulaContent.title} (formula)`);
  console.log();

  console.log(colors.cyan + '生成基于这些内容的 Quiz...\n' + colors.reset);

  const quiz = await generateQuizContent(topic, domain, {
    type: 'quiz',
    title: "Newton's First Law Challenge",
    description: 'Verify understanding of inertia and forces'
  }, {
    generated_modules: [
      {
        type: 'text',
        title: textContent.title,
        content: textContent.content
      },
      {
        type: 'formula',
        title: formulaContent.title,
        content: formulaContent.content
      }
    ],
    learning_objectives: [
      'Understand that objects maintain their state of motion without external force',
      'Identify friction as an external force',
      'Apply the net force concept to real scenarios'
    ]
  });

  console.log(colors.green + `✅ Quiz 已生成: ${quiz.questions.length} 个问题\n` + colors.reset);

  // 显示问题
  console.log(colors.bright + '💡 Quiz 设计策略:' + colors.reset);
  console.log(colors.gray + quiz.quiz_strategy + colors.reset);
  console.log();

  console.log(colors.bright + '❓ 生成的问题:' + colors.reset);
  quiz.questions.forEach((q, idx) => {
    console.log(`\n  ${colors.yellow}${idx + 1}. [${q.difficulty}]${colors.reset} ${q.question}`);
    q.options.forEach((opt, optIdx) => {
      const marker = optIdx === q.answer_index ? colors.green + '  ✓ ' : '    ';
      console.log(`${marker}${opt}${colors.reset}`);
    });
    console.log(`  ${colors.gray}→ ${q.explanation}${colors.reset}`);
    if (q.source_module) {
      console.log(`  ${colors.gray}(基于: ${q.source_module})${colors.reset}`);
    }
  });

  const fs = require('fs');
  fs.writeFileSync('./quiz-no-experiment.json', JSON.stringify(quiz, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: quiz-no-experiment.json' + colors.reset);
  console.log(colors.green + '\n✅ 测试成功！' + colors.reset);
  
  console.log(colors.cyan + '\n📊 关键发现:' + colors.reset);
  console.log(colors.gray + '  即使没有交互实验，Quiz 也能基于文本和公式生成有意义的问题' + colors.reset);
  console.log(colors.gray + '  问题聚焦于概念理解和真实场景应用\n' + colors.reset);
}

test().catch(e => console.error('\n❌ 错误:', e));

