import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = join(__dirname, '../../assets/screenshots');
const CHROME_PATH = process.env.HOME + '/.cache/ms-playwright/chromium-1208/chrome-linux/chrome';

const views = [
  { name: 'dashboard-chat', path: '/', wait: 3000 },
];

async function takeScreenshots() {
  console.log('🚀 Iniciando navegador con Playwright...');
  console.log('Chrome path:', CHROME_PATH);
  
  try {
    const browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: true,
    });
    
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
    for (const view of views) {
      console.log(`📸 Tomando screenshot: ${view.name}`);
      
      await page.goto(`${BASE_URL}${view.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await page.waitForTimeout(view.wait || 3000);
      
      const outputPath = join(OUTPUT_DIR, `${view.name}.png`);
      await page.screenshot({ path: outputPath, fullPage: false });
      
      console.log(`✅ Screenshot guardado: ${outputPath}`);
    }
    
    await browser.close();
    console.log('🏁 Screenshots completados');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

takeScreenshots();
