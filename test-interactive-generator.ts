/**
 * 交互式应用生成器测试脚本
 */

import { generateInteractiveApp } from './server/gemini-interactive-generator';

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
 * 测试光合作用实验
 */
async function testPhotosynthesisLab() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🧪 光合作用实验室生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'photosynthesis';
  const domain = 'SCIENCE';
  const modulePlan = {
    type: 'experiment',
    title: 'The Bubble Factory',
    description: 'An interactive simulation where students adjust light intensity, CO2 concentration, and water to observe oxygen bubble production.'
  };

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 应用: ${modulePlan.title}` + colors.reset);
  console.log(colors.yellow + '⚠️  注意：两步生成，需要 20-40 秒' + colors.reset);
  console.log(colors.gray + '  步骤1: 生成规范（JSON）' + colors.reset);
  console.log(colors.gray + '  步骤2: 生成HTML（纯文本）\n' + colors.reset);

  try {
    const app = await generateInteractiveApp(topic, domain, modulePlan, {
      learning_goal: 'Understand how environmental factors affect photosynthesis rate through hands-on manipulation',
      user_preferences: { prefers_interactive: true, prefers_visual: true }
    });

    displayApp(app);

    // 保存结果
    const fs = require('fs');
    
    // 保存 JSON spec
    fs.writeFileSync(
      './interactive-app-spec.json',
      JSON.stringify(app.spec, null, 2),
      'utf-8'
    );

    // 保存 HTML 文件
    fs.writeFileSync(
      './photosynthesis-lab.html',
      app.html_content,
      'utf-8'
    );

    console.log(colors.gray + '\n💾 完整结果已保存:' + colors.reset);
    console.log(colors.gray + '  - interactive-app-spec.json (规范文档)' + colors.reset);
    console.log(colors.gray + '  - photosynthesis-lab.html (可直接打开的应用)' + colors.reset);

    console.log(colors.green + '\n✅ 测试成功！' + colors.reset);
    console.log(colors.cyan + '\n💡 下一步：在浏览器中打开 photosynthesis-lab.html 查看效果' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 测试牛顿第一定律实验
 */
async function testNewtonsLaw() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🚀 牛顿第一定律实验生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = "Newton's First Law";
  const domain = 'SCIENCE';
  const modulePlan = {
    type: 'experiment',
    title: 'The Frictionless Ice Rink',
    description: 'Interactive simulation where students kick a puck on surfaces with different friction levels to understand inertia.'
  };

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 应用: ${modulePlan.title}` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 3 Flash...\n' + colors.reset);

  try {
    const app = await generateInteractiveApp(topic, domain, modulePlan);

    displayApp(app);

    const fs = require('fs');
    fs.writeFileSync('./interactive-app-spec.json', JSON.stringify(app.spec, null, 2), 'utf-8');
    fs.writeFileSync('./newtons-law-sim.html', app.html_content, 'utf-8');

    console.log(colors.gray + '\n💾 已保存: interactive-app-spec.json, newtons-law-sim.html' + colors.reset);
    console.log(colors.green + '\n✅ 测试成功！' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 测试红黑树可视化
 */
async function testRedBlackTree() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🌲 红黑树可视化生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'red-black tree';
  const domain = 'SCIENCE';
  const modulePlan = {
    type: 'manipulation',
    title: 'The Rotation Machine',
    description: 'Interactive tool where students manually perform left and right rotations on nodes.'
  };

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 应用: ${modulePlan.title}` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 3 Flash...\n' + colors.reset);

  try {
    const app = await generateInteractiveApp(topic, domain, modulePlan);

    displayApp(app);

    const fs = require('fs');
    fs.writeFileSync('./interactive-app-spec.json', JSON.stringify(app.spec, null, 2), 'utf-8');
    fs.writeFileSync('./red-black-tree.html', app.html_content, 'utf-8');

    console.log(colors.gray + '\n💾 已保存: interactive-app-spec.json, red-black-tree.html' + colors.reset);
    console.log(colors.green + '\n✅ 测试成功！' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 显示应用信息
 */
function displayApp(app: InteractiveAppOutput) {
  const spec = app.spec;

  console.log(colors.bright + '📱 交互式应用规范:' + colors.reset);
  console.log(`  概念: ${colors.green}${spec.concept_and_goal.concept}${colors.reset}\n`);

  console.log(colors.bright + '🎯 学习目标:' + colors.reset);
  spec.concept_and_goal.learning_objectives.forEach((obj, idx) => {
    console.log(`  ${idx + 1}. ${obj}`);
  });

  console.log(`\n${colors.bright}🔄 交互循环:${colors.reset}`);
  console.log(`  预测: ${colors.cyan}${spec.interaction_loop.predict_step}${colors.reset}`);
  console.log(`  操纵: ${colors.cyan}${spec.interaction_loop.manipulate_step}${colors.reset}`);
  console.log(`  观察: ${colors.cyan}${spec.interaction_loop.observe_step}${colors.reset}`);
  console.log(`  解释: ${colors.cyan}${spec.interaction_loop.explain_step}${colors.reset}`);
  console.log(`  验证: ${colors.cyan}${spec.interaction_loop.check_step}${colors.reset}`);

  console.log(`\n${colors.bright}🎨 可调参数:${colors.reset}`);
  spec.data_model.parameters.forEach((param, idx) => {
    console.log(`  ${idx + 1}. ${param.name}: ${param.description}`);
    if (param.min !== undefined && param.max !== undefined) {
      console.log(`     范围: ${param.min} - ${param.max} ${param.unit || ''}`);
    }
  });

  console.log(`\n${colors.bright}📊 输出值:${colors.reset}`);
  spec.data_model.outputs.forEach((output, idx) => {
    console.log(`  ${idx + 1}. ${output}`);
  });

  console.log(`\n${colors.bright}🖼️  可视化:${colors.reset}`);
  spec.visualizations.visual_elements.forEach((elem, idx) => {
    console.log(`  ${idx + 1}. ${colors.gray}${elem}${colors.reset}`);
  });

  console.log(`\n${colors.bright}📏 HTML 文件大小:${colors.reset}`);
  console.log(`  ${app.html_content.length} 字符 (${Math.round(app.html_content.length / 1024)} KB)`);
}

// 主函数
async function main() {
  console.log(colors.bright + colors.magenta);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom 交互式应用生成器测试工具                        ║
  ║         Testing Gemini 3 Flash Interactive App Generation    ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'photosynthesis';

  if (mode === 'newton') {
    await testNewtonsLaw();
  } else if (mode === 'tree') {
    await testRedBlackTree();
  } else {
    await testPhotosynthesisLab();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

