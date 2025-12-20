/**
 * 完整 Canvas 生成测试
 * 测试案例：为什么冬天舌头舔金属会粘住？
 */

import { generateModulePlanWithGemini } from './server/gemini-planner';
import { generateTextContent } from './server/gemini-content-generator';
import { generatePerspectiveContent } from './server/gemini-perspective-generator';

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

async function testFullCanvas() {
  console.log(colors.bright + colors.magenta);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         完整 Canvas 生成流程测试                              ║
  ║         测试案例：冬天舔金属会粘住                             ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  const topic = 'Why does your tongue stick to metal in winter?';
  const domain = 'LIBERAL_ARTS';

  console.log(colors.cyan + `📚 主题: ${topic}` + colors.reset);
  console.log(colors.cyan + `🎯 领域: ${domain}\n` + colors.reset);

  // ===== 第一步：Planner 生成模块计划 =====
  console.log(colors.bright + '第一步：调用 Planner 生成模块计划...' + colors.reset);
  console.log(colors.gray + '使用 Gemini 3 Flash\n' + colors.reset);

  const planResult = await generateModulePlanWithGemini(topic, domain);

  console.log(colors.green + `✅ Planner 完成: 生成了 ${planResult.module_plan.length} 个模块\n` + colors.reset);

  console.log(colors.bright + '📋 模块计划:' + colors.reset);
  planResult.module_plan.forEach((module, idx) => {
    console.log(`  ${idx + 1}. ${colors.cyan}${module.title}${colors.reset} (${module.type})`);
    if (module.description) {
      console.log(`     ${colors.gray}${module.description}${colors.reset}`);
    }
  });

  console.log(`\n${colors.bright}💡 Planner 设计思路:${colors.reset}`);
  console.log(colors.gray + planResult.learning_path_reasoning + colors.reset);

  // 分析模块类型
  const perspectiveModules = planResult.module_plan.filter(m => m.type.startsWith('perspective_'));
  
  console.log(`\n${colors.yellow}🔍 分析:${colors.reset}`);
  console.log(`  - 跨学科视角模块: ${colors.yellow}${perspectiveModules.length}${colors.reset} 个`);
  perspectiveModules.forEach(m => {
    const discipline = m.type.replace('perspective_', '');
    console.log(`    • ${discipline}`);
  });

  // ===== 第二步：生成部分模块内容（示例）=====
  console.log(`\n${colors.bright}第二步：生成部分模块内容（示例）...${colors.reset}\n`);

  const generatedContents = [];

  // 生成第一个文本模块（如果有）
  const textModule = planResult.module_plan.find(m => 
    ['intuition', 'overview', 'story'].includes(m.type)
  );

  if (textModule) {
    console.log(colors.cyan + `  → 生成 "${textModule.title}" (${textModule.type})...` + colors.reset);
    
    try {
      const content = await generateTextContent(topic, domain, textModule);
      generatedContents.push({
        module: textModule,
        content,
        type: 'text'
      });
      console.log(colors.green + `  ✅ 完成 (${content.body.length}字符)\n` + colors.reset);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log(colors.yellow + `  ⚠️  跳过: ${e}\n` + colors.reset);
    }
  }

  // 生成前2个视角模块
  const perspectivesToGenerate = perspectiveModules.slice(0, 2);
  
  for (const perspMod of perspectivesToGenerate) {
    const discipline = perspMod.type.replace('perspective_', '');
    console.log(colors.cyan + `  → 生成 "${perspMod.title}" (${discipline}视角)...` + colors.reset);
    
    try {
      const previousPerspectives = generatedContents
        .filter(g => g.type === 'perspective')
        .map(g => ({
          discipline: g.content.discipline,
          main_point: g.content.lens_description
        }));

      const content = await generatePerspectiveContent(
        topic,
        domain,
        perspMod,
        {
          other_perspectives: previousPerspectives,
          phenomenon_description: 'When you lick metal in winter, your wet tongue freezes instantly to the cold surface.'
        }
      );

      generatedContents.push({
        module: perspMod,
        content,
        type: 'perspective'
      });

      console.log(colors.green + `  ✅ ${discipline} 视角完成\n` + colors.reset);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log(colors.yellow + `  ⚠️  跳过: ${e}\n` + colors.reset);
    }
  }

  // ===== 第三步：展示完整Canvas概览 =====
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + '📊 完整 Canvas 概览' + colors.reset);
  console.log('='.repeat(80) + '\n');

  console.log(colors.bright + `Canvas: "${topic}"\n` + colors.reset);

  planResult.module_plan.forEach((module, idx) => {
    const generated = generatedContents.find(g => g.module.title === module.title);
    const status = generated ? colors.green + '✅ 已生成' : colors.gray + '○ 待生成';
    
    console.log(`${idx + 1}. ${colors.cyan}${module.title}${colors.reset} (${module.type})`);
    console.log(`   ${status}${colors.reset}`);
    
    if (generated) {
      if (generated.type === 'perspective') {
        console.log(`   ${colors.gray}→ ${generated.content.lens_description}${colors.reset}`);
        console.log(`   ${colors.gray}→ 关键概念: ${generated.content.key_concepts.slice(0, 2).join(', ')}...${colors.reset}`);
        if (generated.content.visual_elements && generated.content.visual_elements.length > 0) {
          console.log(`   ${colors.yellow}→ 建议配图: ${generated.content.visual_elements.length} 个${colors.reset}`);
        }
      } else if (generated.type === 'text') {
        console.log(`   ${colors.gray}→ ${generated.content.body.substring(0, 100)}...${colors.reset}`);
      }
    }
    console.log();
  });

  // 保存结果
  const fs = require('fs');
  const fullResult = {
    topic,
    domain,
    planner_output: planResult,
    generated_samples: generatedContents.map(g => ({
      module_title: g.module.title,
      module_type: g.module.type,
      content_preview: {
        ...g.content,
        main_explanation: g.content.main_explanation?.substring(0, 200) + '...' || undefined,
        body: g.content.body?.substring(0, 200) + '...' || undefined
      }
    }))
  };

  fs.writeFileSync('./full-canvas-test-result.json', JSON.stringify(fullResult, null, 2), 'utf-8');
  console.log(colors.gray + '💾 完整结果已保存到: full-canvas-test-result.json' + colors.reset);
  
  console.log(colors.green + '\n🎉 完整 Canvas 测试完成！' + colors.reset);
  console.log(colors.cyan + '\n💡 这就是用户搜索该主题后会看到的 Canvas 结构\n' + colors.reset);
}

testFullCanvas().catch(e => console.error('\n❌ 错误:', e));

