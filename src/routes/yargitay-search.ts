import { createErrorResponse, PluginErrorType } from "@lobehub/chat-plugin-sdk";
import { Hono } from "hono";
import puppeteer from "puppeteer";

declare global {
  interface Window {
    postSonuclar: (form: HTMLFormElement) => void;
  }
}

export const yargitaySearch = new Hono()
  .get("/", (c) =>
    c.json(
      { message: "GET /api/yargitay-search is not supported, use POST instead" },
      405,
    ),
  )
  .post("/", async (c) => {
    const params = (await c.req.json()) as { query: string };

    try {
      console.log(`>>> Searching Yargitay decisions for ${params.query}`);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto("https://karararama.yargitay.gov.tr/", { waitUntil: "networkidle0" });

      // Arama kutusuna yaz ve butona tıkla
      await page.type('#aranan', params.query);
      await page.click('#aramaG');

      // Sonuç tablosu gelene kadar bekle
      await page.waitForSelector('#detayAramaSonuclar tbody tr', { timeout: 15000 });

      // İlk 10 satırı sırayla işle
      const rows = await page.$$('#detayAramaSonuclar tbody tr');
      const results: any[] = [];
      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        // Satırdaki hücreleri al
        const cells = await row.$$eval('td', tds => tds.map(td => td.textContent?.trim() || ''));
        // Tıklamadan önce mevcut içeriği al
        let prevContent = '';
        try {
          prevContent = await page.$eval('.card-scroll', el => el.textContent?.trim() || '');
        } catch (e) {
          // İlk başta içerik yoksa hata olabilir, sorun değil
        }
        // Satıra tıkla
        await row.click();
        // İçeriğin değişmesini bekle (max 12sn)
        try {
          await page.waitForFunction(
            (oldContent) => {
              const el = document.querySelector('.card-scroll');
              return el && el.textContent && el.textContent.trim() !== oldContent;
            },
            { timeout: 12000 },
            prevContent
          );
        } catch (e) {
          // İçerik değişmezse devam et
        }
        // İçeriğin tamamen yüklendiğinden emin ol (uzunluk sabitlenene kadar bekle)
        let lastLength = 0;
        let stableCount = 0;
        for (let j = 0; j < 20; j++) { // max 2sn bekle
          const contentCheck = await page.$eval('.card-scroll', el => el.textContent?.trim() || '');
          if (contentCheck.length === lastLength) {
            stableCount++;
            if (stableCount >= 3) break; // 3 kez üst üste aynıysa tamam
          } else {
            stableCount = 0;
            lastLength = contentCheck.length;
          }
          await new Promise(res => setTimeout(res, 100)); // 100ms bekle
        }
        // Yeni içeriği al
        const content = await page.$eval('.card-scroll', el => el.textContent?.trim() || '');
        results.push({
          siraNo: cells[0],
          daire: cells[1],
          esas: cells[2],
          karar: cells[3],
          tarih: cells[4],
          icerik: content
        });
      }

      await browser.close();

      if (results.length > 0) {
        // Sonuçları formatla
        const formatted = results.map((r, i) =>
          `Sıra No: ${r.siraNo}\nDaire: ${r.daire}\nEsas: ${r.esas}\nKarar: ${r.karar}\nKarar Tarihi: ${r.tarih}\nİçerik:\n${r.icerik}\n\n---\n`
        ).join('');
        return c.text(formatted);
      } else {
        return c.text("Sonuç bulunamadı.");
      }

    } catch (err) {
      console.error("Error:", err);
      return createErrorResponse(PluginErrorType.PluginServerError, err as object);
    }
  }); 