// 查看生成内容的脚本
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./content-generator-result.json', 'utf-8'));

console.log('='.repeat(80));
console.log('📝 GEMINI 2.5 FLASH 生成的完整内容');
console.log('='.repeat(80));
console.log();

console.log(`🎯 标题: ${data.title}`);
console.log(`📊 难度: ${data.difficulty_level}`);
console.log(`⏱️  阅读时间: ${data.estimated_reading_time} 分钟`);
console.log(`📏 字符数: ${data.body.length}`);
console.log();

console.log('='.repeat(80));
console.log('正文内容（Markdown）:');
console.log('='.repeat(80));
console.log(data.body);
console.log();

console.log('='.repeat(80));
console.log('🎯 关键要点:');
console.log('='.repeat(80));
data.key_points.forEach((point, idx) => {
  console.log(`${idx + 1}. ${point}`);
});
console.log();

