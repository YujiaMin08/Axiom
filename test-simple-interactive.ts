/**
 * 简洁版交互应用测试
 */

import { generateSimpleInteractiveApp } from './server/simple-interactive-generator';

async function test() {
  console.log('\n🧪 光合作用交互实验生成测试\n');
  console.log('⏱️  预计耗时：20-30秒（两步生成）\n');
  
  const result = await generateSimpleInteractiveApp(
    'photosynthesis',
    'SCIENCE',
    {
      type: 'experiment',
      title: 'The Bubble Factory',
      description: 'Interactive simulation where students adjust light, CO2, and temperature to observe oxygen production'
    },
    {
      learning_goal: 'Understand how environmental factors affect photosynthesis rate through experimentation'
    }
  );
  
  console.log('\n📋 生成的规范:');
  console.log('='.repeat(80));
  console.log(result.spec);
  console.log('='.repeat(80));
  
  console.log(`\n📏 HTML 大小: ${result.html.length} 字符 (${Math.round(result.html.length/1024)} KB)`);
  console.log(`📝 HTML 行数: ${result.html.split('\\n').length} 行`);
  
  // 保存文件
  const fs = require('fs');
  fs.writeFileSync('./photosynthesis-app-spec.txt', result.spec, 'utf-8');
  fs.writeFileSync('./photosynthesis-app.html', result.html, 'utf-8');
  
  console.log('\n💾 已保存:');
  console.log('  - photosynthesis-app-spec.txt (规范文档)');
  console.log('  - photosynthesis-app.html (可直接打开)');
  
  console.log('\n✅ 测试成功！');
  console.log('💡 下一步：在浏览器中打开 photosynthesis-app.html 查看效果\n');
}

test().catch(e => console.error('\n❌ 错误:', e));

