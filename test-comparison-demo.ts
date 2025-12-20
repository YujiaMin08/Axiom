/**
 * 对比生成器Demo测试
 */

import { generateComparisonContent } from './server/gemini-comparison-generator';

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
  console.log('\n📊 对比生成器Demo\n');
  
  const comparison = await generateComparisonContent(
    'photosynthesis',
    'SCIENCE',
    {
      type: 'comparison',
      title: "Nature's Mirror",
      description: 'Comparing photosynthesis and cellular respiration'
    },
    {
      items_to_compare: ['Photosynthesis', 'Cellular Respiration']
    }
  );

  console.log(colors.bright + `📊 ${comparison.title}` + colors.reset);
  console.log(`对比对象: ${colors.cyan}${comparison.items_compared.join(' vs ')}${colors.reset}\n`);

  console.log(colors.bright + '📋 对比表格:' + colors.reset);
  console.log();

  // 表头
  const colWidth = 35;
  console.log('  ' + colors.cyan + '维度'.padEnd(20) + colors.reset + 
    comparison.items_compared.map(item => colors.yellow + item.padEnd(colWidth) + colors.reset).join(''));
  console.log('  ' + '─'.repeat(20 + colWidth * comparison.items_compared.length));

  // 表格内容
  comparison.comparison_table.forEach(row => {
    console.log('  ' + colors.bright + row.aspect.padEnd(20) + colors.reset + 
      comparison.items_compared.map(item => {
        const value = row.values[item] || row.values[item.toLowerCase()] || '';
        return value.substring(0, colWidth - 2).padEnd(colWidth);
      }).join('')
    );
    if (row.insight) {
      console.log('  ' + colors.gray + ' '.repeat(20) + '→ ' + row.insight + colors.reset);
    }
    console.log();
  });

  console.log(colors.bright + '🔗 相似之处:' + colors.reset);
  comparison.similarities.forEach((sim, idx) => {
    console.log(`  ${idx + 1}. ${sim}`);
  });

  console.log(`\n${colors.bright}⚡ 差异之处:${colors.reset}`);
  comparison.differences.forEach((diff, idx) => {
    console.log(`  ${idx + 1}. ${diff}`);
  });

  console.log(`\n${colors.bright}💡 核心洞察:${colors.reset}`);
  console.log(colors.yellow + `  ${comparison.key_insight}` + colors.reset);

  if (comparison.visual_suggestion) {
    console.log(`\n${colors.bright}🎨 可视化建议:${colors.reset}`);
    console.log(`  ${comparison.visual_suggestion}`);
  }

  const fs = require('fs');
  fs.writeFileSync('./comparison-demo-result.json', JSON.stringify(comparison, null, 2), 'utf-8');
  console.log(colors.gray + '\n💾 已保存到: comparison-demo-result.json' + colors.reset);
  console.log(colors.green + '\n✅ 对比生成成功！\n' + colors.reset);
}

test().catch(e => console.error('\n❌ 错误:', e));

