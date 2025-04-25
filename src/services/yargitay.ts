import { chromium } from 'playwright';

export interface YargitayDecision {
  siraNo: number;
  kararNo: string;
  kararMetni: string;
  tarih?: string;
  davaTuru?: string;
}

export async function searchYargitayDecisions(searchTerm: string): Promise<YargitayDecision[]> {
  const browser = await chromium.launch({
    headless: true // Production'da true olmalı
  });
  const page = await browser.newPage();
  
  try {
    // Siteye git
    await page.goto('https://karararama.yargitay.gov.tr');
    
    // Arama kutusunu bul ve aramayı yap
    await page.fill('input[name="kelime"]', searchTerm);
    await page.click('button[type="submit"]');
    
    // Sonuçların yüklenmesini bekle
    await page.waitForSelector('.result-item', { timeout: 10000 });
    
    // İlk 10 sonucu topla
    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.result-item')).slice(0, 10);
      return items.map((item, index) => {
        const kararNo = item.querySelector('.karar-no')?.textContent?.trim();
        const kararMetni = item.querySelector('.karar-metni')?.textContent?.trim();
        const tarih = item.querySelector('.tarih')?.textContent?.trim();
        const davaTuru = item.querySelector('.dava-turu')?.textContent?.trim();
        
        return {
          siraNo: index + 1,
          kararNo: kararNo || '',
          kararMetni: kararMetni || '',
          tarih: tarih,
          davaTuru: davaTuru
        };
      });
    });
    
    return results;
    
  } catch (error) {
    console.error('Yargıtay arama hatası:', error);
    throw new Error('Yargıtay karar araması sırasında bir hata oluştu');
  } finally {
    await browser.close();
  }
} 