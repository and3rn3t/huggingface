#!/usr/bin/env tsx
/**
 * Generate social sharing images for Open Graph and Twitter Cards
 * Uses Playwright to capture screenshots of the running app
 */

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const DEV_URL = 'http://localhost:5173';

// Ensure public directory exists
mkdirSync(PUBLIC_DIR, { recursive: true });

async function generateSocialImages() {
  console.log('🚀 Starting social image generation...');
  
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 2, // Retina quality
    });
    
    const page = await context.newPage();
    
    console.log('📡 Connecting to dev server...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="trending-section"], .trending, h1, h2', {
      timeout: 10000,
    }).catch(() => {
      console.log('⚠️  No specific selectors found, proceeding with page load');
    });
    
    // Give animations time to complete
    await page.waitForTimeout(2000);
    
    console.log('📸 Capturing Open Graph image (1200x630)...');
    
    // Create a styled screenshot container
    await page.evaluate(() => {
      // Create overlay with app branding
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, oklch(0.35 0.15 265) 0%, oklch(0.25 0.12 285) 50%, oklch(0.2 0.08 250) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 60px;
      `;
      
      overlay.innerHTML = `
        <div style="
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 60px 80px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        ">
          <h1 style="
            font-size: 72px;
            font-weight: 800;
            background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 20px 0;
            letter-spacing: -0.02em;
          ">🤗 HuggingFace Playground</h1>
          <p style="
            font-size: 32px;
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 30px 0;
            font-weight: 500;
          ">Explore Datasets, Models & APIs</p>
          <div style="
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
          ">
            <div style="
              background: rgba(129, 140, 248, 0.2);
              border: 1px solid rgba(129, 140, 248, 0.4);
              padding: 12px 24px;
              border-radius: 12px;
              color: #818cf8;
              font-weight: 600;
              font-size: 18px;
            ">🔥 Trending Models</div>
            <div style="
              background: rgba(192, 132, 252, 0.2);
              border: 1px solid rgba(192, 132, 252, 0.4);
              padding: 12px 24px;
              border-radius: 12px;
              color: #c084fc;
              font-weight: 600;
              font-size: 18px;
            ">📊 Dataset Browser</div>
            <div style="
              background: rgba(251, 146, 60, 0.2);
              border: 1px solid rgba(251, 146, 60, 0.4);
              padding: 12px 24px;
              border-radius: 12px;
              color: #fb923c;
              font-weight: 600;
              font-size: 18px;
            ">⚡ API Playground</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
    });
    
    await page.waitForTimeout(500);
    
    const ogScreenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });
    
    const ogPath = join(PUBLIC_DIR, 'og-image.png');
    writeFileSync(ogPath, ogScreenshot);
    console.log(`✅ Open Graph image saved: ${ogPath}`);
    
    // Generate Twitter Card image (1200x600)
    console.log('📸 Capturing Twitter Card image (1200x600)...');
    await page.setViewportSize({ width: 1200, height: 600 });
    await page.waitForTimeout(500);
    
    const twitterScreenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });
    
    const twitterPath = join(PUBLIC_DIR, 'twitter-image.png');
    writeFileSync(twitterPath, twitterScreenshot);
    console.log(`✅ Twitter Card image saved: ${twitterPath}`);
    
  } catch (error) {
    console.error('❌ Error generating images:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎉 Social images generated successfully!');
}

// Run the generator
generateSocialImages().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
