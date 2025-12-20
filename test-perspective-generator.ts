/**
 * 跨学科视角生成器测试
 * PRD 经典案例：为什么切洋葱会流泪
 */

import { generatePerspectiveContent, generateMultiplePerspectives } from './server/gemini-perspective-generator';

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
 * 测试单个视角生成
 */
async function testSinglePerspective() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🔬 单学科视角生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'Why do we cry when cutting onions?';
  const domain = 'LIBERAL_ARTS';

  console.log(colors.cyan + `主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `视角: Chemistry\n` + colors.reset);

  const perspective = await generatePerspectiveContent(
    topic,
    domain,
    {
      type: 'perspective_chemistry',
      title: 'The Chemical Trigger',
      description: 'Understanding the molecular reaction when an onion is cut'
    },
    {
      phenomenon_description: 'When you cut an onion, your eyes water and sting. This is a chemical defense mechanism.'
    }
  );

  displayPerspective(perspective);

  const fs = require('fs');
  fs.writeFileSync('./single-perspective-result.json', JSON.stringify(perspective, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: single-perspective-result.json' + colors.reset);
}

/**
 * 测试多视角生成（PRD 场景：切洋葱）
 */
async function testMultiPerspectives() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.magenta + '🧅 多学科视角生成测试 - 切洋葱流泪' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'Why do we cry when cutting onions?';
  const domain = 'LIBERAL_ARTS';
  const disciplines = ['chemistry', 'physics', 'biology'];

  console.log(colors.cyan + `主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `生成视角: ${disciplines.join(', ')}\n` + colors.reset);
  console.log(colors.yellow + '⏱️  预计耗时: 30-45秒（3个视角，避免限流）\n' + colors.reset);

  const perspectives = await generateMultiplePerspectives(
    topic,
    domain,
    disciplines,
    'When you cut an onion, chemical compounds are released that trigger tears. This everyday phenomenon involves chemistry (reactions), physics (gas diffusion), and biology (tear response).'
  );

  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + '📊 生成结果汇总' + colors.reset);
  console.log('='.repeat(80) + '\n');

  perspectives.forEach((p, idx) => {
    console.log(`${colors.cyan}${idx + 1}. ${p.title}${colors.reset}`);
    console.log(`   ${colors.gray}${p.lens_description}${colors.reset}`);
    console.log(`   关键概念: ${p.key_concepts.join(', ')}`);
    console.log();
  });

  console.log(colors.bright + '🔍 详细内容:' + colors.reset);
  console.log();

  perspectives.forEach((p, idx) => {
    displayPerspective(p);
    if (idx < perspectives.length - 1) {
      console.log('\n' + colors.gray + '─'.repeat(80) + colors.reset + '\n');
    }
  });

  const fs = require('fs');
  fs.writeFileSync('./multi-perspectives-result.json', JSON.stringify(perspectives, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: multi-perspectives-result.json' + colors.reset);
}

/**
 * 显示单个视角内容
 */
function displayPerspective(perspective: PerspectiveContentOutput) {
  console.log(colors.bright + `🔬 ${perspective.title}` + colors.reset);
  console.log(colors.cyan + `视角: ${perspective.discipline}` + colors.reset);
  console.log();

  console.log(colors.bright + '💡 这个视角揭示了什么:' + colors.reset);
  console.log(colors.yellow + perspective.lens_description + colors.reset);
  console.log();

  console.log(colors.bright + '📝 核心解释:' + colors.reset);
  console.log(colors.gray + perspective.main_explanation + colors.reset);
  console.log();

  console.log(colors.bright + '🎯 关键概念:' + colors.reset);
  perspective.key_concepts.forEach((concept, idx) => {
    console.log(`  ${idx + 1}. ${concept}`);
  });
  console.log();

  if (perspective.visual_elements && perspective.visual_elements.length > 0) {
    console.log(colors.bright + '🎨 可视化建议:' + colors.reset);
    perspective.visual_elements.forEach((elem, idx) => {
      console.log(`  ${idx + 1}. ${colors.gray}${elem}${colors.reset}`);
    });
    console.log();
  }

  if (perspective.connection_to_other_perspectives) {
    console.log(colors.bright + '🔗 与其他视角的联系:' + colors.reset);
    console.log(colors.gray + perspective.connection_to_other_perspectives + colors.reset);
    console.log();
  }

  if (perspective.discipline_specific_questions && perspective.discipline_specific_questions.length > 0) {
    console.log(colors.bright + '❓ 学科思考问题:' + colors.reset);
    perspective.discipline_specific_questions.forEach((q, idx) => {
      console.log(`  ${idx + 1}. ${colors.cyan}${q}${colors.reset}`);
    });
    console.log();
  }

  console.log(colors.green + '✅ ' + perspective.discipline + ' 视角生成成功' + colors.reset);
}

// 主函数
async function main() {
  console.log(colors.bright + colors.magenta);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom 跨学科视角生成器测试工具                        ║
  ║         Testing Multi-Disciplinary Perspective Generation    ║
  ║         (PRD 核心特性)                                        ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'single';

  if (mode === 'multi') {
    await testMultiPerspectives();
  } else {
    await testSinglePerspective();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

