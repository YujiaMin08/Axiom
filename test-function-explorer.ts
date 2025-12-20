/**
 * 数学函数探索器测试
 */

import { generateSimpleInteractiveApp } from './server/simple-interactive-generator';

async function test() {
  console.log('\n📐 数学函数探索器生成测试\n');
  console.log('⏱️  预计耗时：20-30秒\n');
  
  const result = await generateSimpleInteractiveApp(
    'mathematical functions',
    'SCIENCE',
    {
      type: 'manipulation',
      title: 'Function Playground',
      description: 'Interactive tool where students explore different types of functions (linear, quadratic, exponential, trigonometric) by adjusting parameters and observing how graphs change in real-time.'
    },
    {
      learning_goal: 'Understand how different function types behave and how parameters affect their graphs'
    }
  );
  
  console.log('\n📋 生成的规范（前1200字符）:');
  console.log('='.repeat(80));
  console.log(result.spec.substring(0, 1200) + '...');
  console.log('='.repeat(80));
  
  console.log(`\n📏 HTML 大小: ${result.html.length} 字符 (${Math.round(result.html.length/1024)} KB)`);
  console.log(`📝 HTML 行数: ${result.html.split('\n').length} 行`);
  
  const fs = require('fs');
  fs.writeFileSync('./function-explorer-spec.txt', result.spec, 'utf-8');
  fs.writeFileSync('./function-explorer.html', result.html, 'utf-8');
  
  console.log('\n💾 已保存:');
  console.log('  - function-explorer-spec.txt (规范文档)');
  console.log('  - function-explorer.html (交互应用)');
  
  console.log('\n✅ 生成成功！');
  console.log('🌐 文件位置: ' + process.cwd() + '/function-explorer.html\n');
}

test().catch(e => console.error('\n❌ 错误:', e));

