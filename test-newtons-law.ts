/**
 * 牛顿第一定律交互应用测试
 */

import { generateSimpleInteractiveApp } from './server/simple-interactive-generator';

async function test() {
  console.log('\n🚀 牛顿第一定律交互实验生成测试\n');
  console.log('⏱️  预计耗时：20-30秒\n');
  
  const result = await generateSimpleInteractiveApp(
    "Newton's First Law",
    'SCIENCE',
    {
      type: 'experiment',
      title: 'The Frictionless Ice Rink',
      description: 'Interactive simulation where students kick a puck on surfaces with different friction levels to understand inertia and motion.'
    },
    {
      learning_goal: 'Understand that objects in motion stay in motion unless acted upon by an external force (friction)'
    }
  );
  
  console.log('\n📋 生成的规范（前1000字符）:');
  console.log('='.repeat(80));
  console.log(result.spec.substring(0, 1000) + '...');
  console.log('='.repeat(80));
  
  console.log(`\n📏 HTML 大小: ${result.html.length} 字符 (${Math.round(result.html.length/1024)} KB)`);
  console.log(`📝 HTML 行数: ${result.html.split('\n').length} 行`);
  
  const fs = require('fs');
  fs.writeFileSync('./newtons-law-spec.txt', result.spec, 'utf-8');
  fs.writeFileSync('./newtons-law-app.html', result.html, 'utf-8');
  
  console.log('\n💾 已保存:');
  console.log('  - newtons-law-spec.txt (规范文档)');
  console.log('  - newtons-law-app.html (交互应用)');
  
  console.log('\n✅ 生成成功！');
  console.log('🌐 文件位置: ' + process.cwd() + '/newtons-law-app.html');
  console.log('\n💡 用浏览器打开 newtons-law-app.html 查看效果\n');
}

test().catch(e => console.error('\n❌ 错误:', e));

