import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({
    headless: true
  });
  
  const page = await browser.newPage();
  
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.toString());
    console.log('[PAGE ERROR]', error.toString());
  });
  
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]', request.url(), request.failure()?.errorText || 'unknown');
  });
  
  try {
    console.log('正在导航到 http://localhost:5173...');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const isWhiteScreen = bodyHTML.trim().length < 100 || !bodyHTML.includes('axiom');
    
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.length : 0;
    });
    
    console.log('\n========== 检查结果 ==========');
    console.log('1. 是否白屏:', isWhiteScreen ? '是 ❌' : '否 ✓');
    console.log('2. Root元素内容长度:', rootContent, '字符');
    console.log('3. 控制台消息数量:', consoleMessages.length);
    console.log('4. 页面错误数量:', errors.length);
    
    if (errors.length > 0) {
      console.log('\n========== 关键错误 ==========');
      errors.forEach((err, i) => {
        console.log(`错误 ${i + 1}:`, err);
      });
    }
    
    if (consoleMessages.some(m => m.type === 'error' || m.type === 'warning')) {
      console.log('\n========== 控制台错误/警告 ==========');
      consoleMessages
        .filter(m => m.type === 'error' || m.type === 'warning')
        .forEach(m => {
          console.log(`[${m.type.toUpperCase()}]`, m.text);
        });
    }
    
    const screenshot = await page.screenshot({ fullPage: true });
    fs.writeFileSync('screenshot.png', screenshot);
    console.log('\n截图已保存到 screenshot.png');
    
  } catch (error) {
    console.error('导航失败:', error.message);
  } finally {
    await browser.close();
  }
})();
