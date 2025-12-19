/**
 * Gemini Planner 测试脚本
 * 
 * 用法：
 * 1. 设置环境变量: export GEMINI_API_KEY="your-api-key"
 * 2. 运行测试: npx tsx test-gemini-planner.ts
 */

import { generateModulePlanWithGemini, testPlannerWithMultipleTopics } from './server/gemini-planner';

// 设置字体颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function testSingleTopic() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🧪 Gemini Planner 单主题测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  // 测试主题和领域
  const testTopic = 'red-black tree';
  const testDomain = 'SCIENCE';  // LANGUAGE | SCIENCE | LIBERAL_ARTS
  
  console.log(colors.cyan + `📚 主题: ${testTopic}` + colors.reset);
  console.log(colors.cyan + `🎯 领域: ${testDomain}` + colors.reset);
  console.log(colors.gray + '正在调用 Gemini 3 Flash...\n' + colors.reset);

  try {
    const result = await generateModulePlanWithGemini(testTopic, testDomain);

    // 显示主题分析
    console.log(colors.bright + '📊 主题分析:' + colors.reset);
    console.log(`  主题: ${colors.green}${result.topic_analysis.main_topic}${colors.reset}`);
    console.log(`  难度: ${colors.yellow}${result.topic_analysis.complexity_level}${colors.reset}`);
    console.log(`  核心概念: ${result.topic_analysis.key_concepts.join(', ')}`);

    // 显示模块计划
    console.log(`\n${colors.bright}📋 模块计划 (共 ${result.module_plan.length} 个):${colors.reset}\n`);
    result.module_plan.forEach((module, index) => {
      console.log(`  ${index + 1}. ${colors.cyan}${module.title}${colors.reset}`);
      console.log(`     类型: ${module.type}`);
      if (module.description) {
        console.log(`     ${colors.gray}${module.description}${colors.reset}`);
      }
      console.log('');
    });

    // 显示设计思路
    console.log(colors.bright + '💡 设计思路:' + colors.reset);
    console.log(`  ${colors.gray}${result.learning_path_reasoning}${colors.reset}\n`);

    console.log(colors.green + '✅ 测试成功！' + colors.reset);
    
    // 保存结果到文件
    const fs = require('fs');
    fs.writeFileSync(
      './gemini-planner-result.json', 
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: gemini-planner-result.json' + colors.reset);

  } catch (error) {
    console.error(colors.bright + '❌ 测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

async function testMultipleTopics() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '🧪 Gemini Planner 批量测试' + colors.reset);
  console.log('='.repeat(80) + '\n');

  const testTopics = [
    { topic: 'apple', domain: 'LANGUAGE' },
    { topic: 'photosynthesis', domain: 'SCIENCE' },
    { topic: 'quantum entanglement', domain: 'SCIENCE' },
    { topic: 'Renaissance', domain: 'LIBERAL_ARTS' },
    { topic: 'climate change', domain: 'LIBERAL_ARTS' },
  ];

  console.log(colors.cyan + `📚 测试 ${testTopics.length} 个主题` + colors.reset);
  console.log(colors.gray + '这可能需要几分钟...\n' + colors.reset);

  try {
    const results = await testPlannerWithMultipleTopics(testTopics);

    // 汇总统计
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(80));
    console.log(colors.bright + '📊 测试汇总:' + colors.reset);
    console.log(`  ${colors.green}✅ 成功: ${successful}${colors.reset}`);
    console.log(`  ${colors.yellow}❌ 失败: ${failed}${colors.reset}\n`);

    // 显示每个主题的模块数量
    results.forEach((result, index) => {
      if (result.success && result.plan) {
        console.log(`  ${index + 1}. ${colors.cyan}${result.topic}${colors.reset} (${result.domain}): ${result.plan.module_plan.length} 个模块`);
        console.log(`     难度: ${result.plan.topic_analysis.complexity_level}`);
      } else {
        console.log(`  ${index + 1}. ${result.topic}: ${colors.yellow}失败${colors.reset}`);
      }
    });

    // 保存结果
    const fs = require('fs');
    fs.writeFileSync(
      './gemini-planner-batch-results.json',
      JSON.stringify(results, null, 2),
      'utf-8'
    );
    console.log(colors.gray + '\n💾 完整结果已保存到: gemini-planner-batch-results.json' + colors.reset);

  } catch (error) {
    console.error(colors.bright + '❌ 批量测试失败:' + colors.reset, error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log(colors.bright + colors.cyan);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom Gemini Planner 测试工具                         ║
  ║         Testing Real AI Module Planning                       ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  // 检查 API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.yellow + '⚠️  警告: 未检测到 GEMINI_API_KEY 环境变量' + colors.reset);
    console.log('\n请先设置 API Key:');
    console.log(colors.gray + '  export GEMINI_API_KEY="your-api-key-here"' + colors.reset);
    console.log('\n或者创建 .env 文件并添加:');
    console.log(colors.gray + '  GEMINI_API_KEY=your-api-key-here' + colors.reset);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'single';

  if (mode === 'batch') {
    await testMultipleTopics();
  } else {
    await testSingleTopic();
  }

  console.log('\n' + colors.green + '🎉 测试完成！' + colors.reset + '\n');
}

// 运行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

