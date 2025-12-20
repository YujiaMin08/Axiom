/**
 * 3D物体观察学习应用测试
 */

import { generateSimpleInteractiveApp } from './server/simple-interactive-generator';

async function test() {
  console.log('\n🏠 3D物体观察学习应用生成测试\n');
  console.log('⏱️  预计耗时：20-30秒\n');
  
  const result = await generateSimpleInteractiveApp(
    '3D spatial visualization and perspective',
    'SCIENCE',
    {
      type: 'manipulation',
      title: '3D Object Observer',
      description: 'Interactive tool where elementary students observe 3D objects from different angles (front, side, top) and match what they see with 2D plane figures. Students can switch between different 3D objects like a house with chimney, cube, cylinder, etc.'
    },
    {
      learning_goal: 'Develop spatial reasoning by understanding how 3D objects appear from different viewing angles',
      audience: 'Elementary to Middle School (Grades 3-8)'
    }
  );
  
  console.log('\n📋 生成的规范（前1500字符）:');
  console.log('='.repeat(80));
  console.log(result.spec.substring(0, 1500) + '...');
  console.log('='.repeat(80));
  
  console.log(`\n📏 HTML 大小: ${result.html.length} 字符 (${Math.round(result.html.length/1024)} KB)`);
  console.log(`📝 HTML 行数: ${result.html.split('\n').length} 行`);
  
  const fs = require('fs');
  fs.writeFileSync('./3d-observation-spec.txt', result.spec, 'utf-8');
  fs.writeFileSync('./3d-observation-app.html', result.html, 'utf-8');
  
  console.log('\n💾 已保存:');
  console.log('  - 3d-observation-spec.txt (规范文档)');
  console.log('  - 3d-observation-app.html (交互应用)');
  
  console.log('\n✅ 生成成功！');
  console.log('💡 用浏览器打开 3d-observation-app.html 查看效果');
  console.log('\n🎯 应用功能:');
  console.log('  - 选择3D物体（房屋、立方体等）');
  console.log('  - 选择观察方向（正面、侧面、顶面）');
  console.log('  - 从4个选项中找出正确的2D视图');
  console.log('  - 实时3D预览\n');
}

test().catch(e => console.error('\n❌ 错误:', e));

