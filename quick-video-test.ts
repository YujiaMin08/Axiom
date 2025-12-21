/**
 * 快速视频 API 测试
 * 
 * 运行：npx tsx quick-video-test.ts
 */

const API_BASE = 'http://localhost:3002';

async function main() {
  console.log('🎬 快速测试视频生成 API\n');

  // 测试 1: Health Check
  console.log('1️⃣ 测试 Health Check...');
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'POST' });
    const data = await res.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ 失败:', error);
    return;
  }

  // 测试 2: 创建视频任务
  console.log('\n2️⃣ 创建视频任务...');
  console.log('提示词: "A beautiful sunset over the ocean with waves"');
  
  try {
    const res = await fetch(`${API_BASE}/video/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over the ocean with gentle waves crashing on the shore, cinematic lighting, 4K',
        orientation: 'landscape',
        size: 'large',
        duration: 10
      })
    });

    const data = await res.json();
    console.log('✅ 任务创建成功!');
    console.log('   任务 ID:', data.taskId);
    console.log('   状态:', data.status);

    const taskId = data.taskId;

    // 测试 3: 查询状态
    console.log('\n3️⃣ 查询任务状态...');
    await new Promise(r => setTimeout(r, 2000)); // 等待 2 秒

    const statusRes = await fetch(`${API_BASE}/video/status?taskId=${taskId}`);
    const statusData = await statusRes.json();
    console.log('✅ 当前状态:', statusData.status);

    console.log('\n💡 提示:');
    console.log('   - 视频生成通常需要 1-3 分钟');
    console.log('   - 可以手动查询状态：');
    console.log(`     curl "http://localhost:3002/video/status?taskId=${taskId}"`);
    console.log('   - 或使用自动轮询：');
    console.log('     curl -X POST http://localhost:3002/video/create-and-wait \\');
    console.log('       -H "Content-Type: application/json" \\');
    console.log('       -d \'{"prompt":"Your prompt here"}\'');

  } catch (error: any) {
    console.error('❌ 失败:', error.message);
  }
}

main();

