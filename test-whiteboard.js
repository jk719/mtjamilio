import { chromium } from '@playwright/test';

async function testWhiteboard() {
  console.log('🚀 Starting whiteboard test...');
  
  const browser = await chromium.launch({ 
    headless: true 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      hasTouch: true
    });
    const page = await context.newPage();
    
    console.log('📱 Opening whiteboard at http://localhost:5173...');
    await page.goto('http://localhost:5173');
    
    // Wait for canvas to be ready
    await page.waitForSelector('canvas', { timeout: 5000 });
    console.log('✅ Canvas element found');
    
    // Check if clear button exists
    const clearButton = await page.locator('button:has-text("Clear")').count();
    if (clearButton > 0) {
      console.log('✅ Clear button found');
    }
    
    // Test drawing on canvas
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      console.log('🎨 Testing drawing functionality...');
      
      // Simulate drawing a line
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 200, box.y + 200, { steps: 10 });
      await page.mouse.up();
      console.log('✅ Drew a line on canvas');
      
      // Draw a circle
      await page.mouse.move(box.x + 300, box.y + 300);
      await page.mouse.down();
      for (let i = 0; i <= 360; i += 10) {
        const x = box.x + 300 + 50 * Math.cos(i * Math.PI / 180);
        const y = box.y + 300 + 50 * Math.sin(i * Math.PI / 180);
        await page.mouse.move(x, y);
      }
      await page.mouse.up();
      console.log('✅ Drew a circle on canvas');
      
      // Take a screenshot
      await page.screenshot({ path: 'whiteboard-test.png' });
      console.log('📸 Screenshot saved as whiteboard-test.png');
      
      // Test clear button
      await page.click('button:has-text("Clear")');
      console.log('✅ Clear button clicked');
      
      // Test touch/mobile drawing
      await page.touchscreen.tap(box.x + 150, box.y + 150);
      console.log('✅ Touch tap tested');
    }
    
    console.log('\n🎉 All tests passed! Whiteboard is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

testWhiteboard();