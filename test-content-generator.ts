/**
 * 内容生成器测试脚本
 * 
 * 用法：
 * GEMINI_API_KEY="your-key" npx tsx test-content-generator.ts
 */

import { generateTextContent, generateMultipleModuleContents } from './server/gemini-content-generator';
import { generateModulePlanWithGemini } from './server/gemini-planner';

// 颜色工具
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
 * 测试单个模块的内容生成
 */
async function testSingleModule() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🧪 单模块内容生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'photosynthesis';
  const domain = 'SCIENCE';
  const modulePlan = {
    type: 'intuition',
    title: 'Solar Powered Life',
    description: 'An intuitive look at how plants do the impossible: turning thin air and sunlight into solid matter.'
  };

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 模块: ${modulePlan.title} (${modulePlan.type})` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 2.5 Flash...\n' + colors.reset);

  try {
    const content = await generateTextContent(topic, domain, modulePlan);

    // 显示结果
    console.log(colors.bright + '📄 生成的内容:' + colors.reset);
    console.log(`  标题: ${colors.green}${content.title}${colors.reset}`);
    console.log(`  难度: ${colors.yellow}${content.difficulty_level}${colors.reset}`);
    console.log(`  阅读时间: ${colors.yellow}${content.estimated_reading_time} 分钟${colors.reset}`);
    console.log(`  正文长度: ${content.body.length} 字符\n`);

    console.log(colors.bright + '📝 正文内容:' + colors.reset);
    console.log(colors.gray + '─'.repeat(80) + colors.reset);
    console.log(content.body);
    console.log(colors.gray + '─'.repeat(80) + colors.reset);

    console.log(`\n${colors.bright}🎯 关键要点:${colors.reset}`);
    content.key_points.forEach((point, idx) => {
      console.log(`  ${idx + 1}. ${point}`);
    });

    // 保存结果
    const fs = require('fs');
    fs.writeFileSync(
      './content-generator-result.json',
      JSON.stringify(content, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: content-generator-result.json' + colors.reset);

    console.log(colors.green + '\n✅ 测试成功！' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

/**
 * 测试完整 Canvas 的内容生成
 * 先用 Planner 生成模块计划，再生成所有模块的内容
 */
async function testFullCanvas() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.magenta + '🎨 完整 Canvas 内容生成测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const topic = 'apple';
  const domain = 'LANGUAGE';

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 领域: ${domain}` + colors.reset);
  console.log(colors.gray + '\n第一步: 使用 Planner 生成模块计划...\n' + colors.reset);

  try {
    // 第一步：生成模块计划
    const planResult = await generateModulePlanWithGemini(topic, domain);
    
    console.log(colors.bright + `📋 Planner 生成了 ${planResult.module_plan.length} 个模块:` + colors.reset);
    planResult.module_plan.forEach((module, idx) => {
      console.log(`  ${idx + 1}. ${colors.cyan}${module.title}${colors.reset} (${module.type})`);
    });

    // 筛选出文本类型的模块
    const textModules = planResult.module_plan.filter(m => 
      ['definition', 'intuition', 'overview', 'examples'].includes(m.type)
    );

    console.log(colors.gray + `\n第二步: 为 ${textModules.length} 个文本模块生成内容...\n` + colors.reset);

    // 第二步：生成内容
    const contents = await generateMultipleModuleContents(topic, domain, textModules);

    // 显示结果摘要
    console.log('\n' + '='.repeat(80));
    console.log(colors.bright + '📊 内容生成完成' + colors.reset);
    console.log('='.repeat(80) + '\n');

    contents.forEach((content, idx) => {
      console.log(`${idx + 1}. ${colors.cyan}${content.title}${colors.reset}`);
      console.log(`   难度: ${content.difficulty_level} | 阅读时长: ${content.estimated_reading_time}分钟`);
      console.log(`   正文: ${content.body.length} 字符`);
      console.log(`   要点: ${content.key_points.length} 个\n`);
    });

    // 保存完整结果
    const fs = require('fs');
    const fullResult = {
      topic,
      domain,
      planner_output: planResult,
      generated_contents: contents,
      generation_timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      './full-canvas-content-result.json',
      JSON.stringify(fullResult, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '💾 完整结果已保存到: full-canvas-content-result.json' + colors.reset);

    console.log(colors.green + '\n🎉 完整 Canvas 内容生成成功！' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log(colors.bright + colors.blue);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom 内容生成器测试工具                              ║
  ║         Testing Gemini 2.5 Flash Content Generation          ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  // 检查 API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY 环境变量' + colors.reset);
    console.log('\n请先设置 API Key:');
    console.log(colors.gray + '  export GEMINI_API_KEY="your-api-key-here"' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'single';

  if (mode === 'full') {
    await testFullCanvas();
  } else {
    await testSingleModule();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

// 运行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

