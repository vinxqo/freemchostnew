const { chromium } = require('playwright');

(async () => {
  // 启动无头浏览器并伪装 User-Agent
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    console.log('🚀 正在打开 Freemchost 登录页面...');
    // 使用新版通用域名，如果未来官方换回主域名也可在此处调整
    await page.goto('https://new.freemchost.com/', { waitUntil: 'networkidle' }); 

    // 1. 智能识别输入框并填写（支持账号密码环境变量保护）
    console.log('📝 正在输入凭证...');
    await page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="邮箱"]').fill(process.env.FREE_EMAIL);
    await page.locator('input[type="password"], input[placeholder*="Password"], input[placeholder*="密码"]').fill(process.env.FREE_PASSWORD);
    
    // 2. 模拟点击登录按钮
    console.log('🔐 正在尝试登录...');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("登录")').click();
    
    // 等待登录成功并加载完毕
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ 登录成功！');

    // 3. 直接跳转到你的服务器具体管理面板页面
    console.log('📂 正在直达服务器控制台...');
    await page.goto(process.env.SERVER_PAGE_URL, { waitUntil: 'networkidle' });

    // 4. 核心：通过文字识别锁定红色的 [Renew now] 按钮
    console.log('🔍 正在寻觅 [Renew now] 按钮...');
    const renewBtn = page.locator('button:has-text("Renew now"), div:has-text("Renew now"), [class*="button"]:has-text("Renew")').last();
    
    if (await renewBtn.isVisible()) {
      // 模拟真人点击
      await renewBtn.click();
      console.log('🎉 【成功】已成功触发点击续期按钮！');
      // 留出 5 秒等待后端 Server Function 异步响应完成
      await page.waitForTimeout(5000);
    } else {
      console.log('⚠️ 未找到续期按钮，可能当前无需续期，或页面结构发生了颠覆性改变。');
    }

  } catch (error) {
    console.error('❌ 自动化执行期间发生异常:', error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('🏁 浏览器已关闭，任务结束。');
  }
})();
