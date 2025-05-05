import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { runMiddleware } from './middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS middleware'ini çalıştır
  if (await runMiddleware(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    // Tarayıcıyı başlat
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();

    // Yargıtay karar arama sayfasına git
    await page.goto('https://karararama.yargitay.gov.tr', {
      waitUntil: 'networkidle0'
    });

    // Arama kutusunu bul ve sorguyu yaz
    await page.type('#aranan', query);

    // Ara butonuna tıkla
    await page.click('#aramaG');

    // Sonuçların yüklenmesini bekle
    await page.waitForSelector('#detayAramaSonuclar tbody tr', { timeout: 10000 });

    // İlk 7 kararın bilgilerini topla
    const decisions = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#detayAramaSonuclar tbody tr')).slice(0, 7);
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          siraNo: cells[0].textContent?.trim(),
          daire: cells[1].textContent?.trim(),
          esasNo: cells[2].textContent?.trim(),
          kararNo: cells[3].textContent?.trim(),
          kararTarihi: cells[4].textContent?.trim(),
          id: row.getAttribute('id')
        };
      });
    });

    // Her karar için detay bilgilerini al
    const detailedDecisions = [];
    for (const decision of decisions) {
      if (!decision.id) continue;

      // Karar satırına tıkla
      await page.click(`tr[id="${decision.id}"]`);
      
      // Karar metninin yüklenmesini bekle
      await page.waitForSelector('.card-scroll', { timeout: 5000 });

      // Karar metnini al
      const content = await page.evaluate(() => {
        const contentElement = document.querySelector('.card-scroll');
        return contentElement?.textContent?.trim() || '';
      });

      detailedDecisions.push({
        ...decision,
        content
      });
    }

    // Toplam sonuç sayısını al
    const total = await page.evaluate(() => {
      const element = document.querySelector('#toplamSonuc');
      return element?.textContent ? parseInt(element.textContent, 10) : 0;
    });

    await browser.close();

    return res.status(200).json({
      total,
      decisions: detailedDecisions
    });

  } catch (error) {
    console.error('Yargitay API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 