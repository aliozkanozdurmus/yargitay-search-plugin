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
        headless: true
      });

      const page = await browser.newPage();
      
      // Siteye git
      await page.goto("https://karararama.yargitay.gov.tr/", {
        waitUntil: "networkidle0",
      });

      // Sayfanın tamamen yüklenmesi için bekle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Form verilerini hazırla ve gönder
      await page.evaluate((searchQuery) => {
        const form = document.getElementById('search_form') as HTMLFormElement;
        if (!form) throw new Error('Form element not found');
        
        const input = form.querySelector('input[name="aranan"]') as HTMLInputElement;
        if (!input) throw new Error('Input element not found');
        
        input.value = searchQuery;
        
        // Form submit fonksiyonunu çağır
        window.postSonuclar(form);
      }, params.query);

      // Sonuçların yüklenmesini bekle
      await page.waitForSelector("#detayAramaSonuclar", { timeout: 10000 });

      // Sonuçları topla
      const results = await page.evaluate(() => {
        const rows = document.querySelectorAll("#detayAramaSonuclar tbody tr");
        if (!rows || rows.length === 0) return [];

        const decisions = [];
        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 5) {
            decisions.push({
              siraNo: cells[0]?.textContent?.trim() || "",
              daire: cells[1]?.textContent?.trim() || "",
              esas: cells[2]?.textContent?.trim() || "",
              karar: cells[3]?.textContent?.trim() || "",
              tarih: cells[4]?.textContent?.trim() || "",
            });
          }
        }
        return decisions;
      });

      if (results.length > 0) {
        // İlk kararı seç
        await page.evaluate(() => {
          const firstRow = document.querySelector("#detayAramaSonuclar tbody tr") as HTMLElement;
          if (firstRow) {
            firstRow.click();
          }
        });

        // İçtihat metninin yüklenmesini bekle
        await page.waitForSelector(".card-scroll", { timeout: 5000 });

        // İçtihat metnini al
        const decisionText = await page.evaluate(() => {
          const contentElement = document.querySelector(".card-scroll");
          return contentElement?.textContent?.trim() || "";
        });

        await browser.close();

        // İlk kararın detaylarını ve metnini formatlı şekilde döndür
        const firstDecision = results[0];
        const formattedResponse = `
Yargıtay Kararı:
Daire: ${firstDecision.daire}
Esas No: ${firstDecision.esas}
Karar No: ${firstDecision.karar}
Karar Tarihi: ${firstDecision.tarih}

İÇTİHAT METNİ:
${decisionText || "İçtihat metni alınamadı."}

Diğer Sonuçlar:
${results.slice(1).map((result, index) => `
${index + 2}. Karar:
Daire: ${result.daire}
Esas No: ${result.esas}
Karar No: ${result.karar}
Karar Tarihi: ${result.tarih}`).join("\n")}`;

        return c.text(formattedResponse);
      } else {
        return c.text("Sonuç bulunamadı.");
      }

    } catch (err) {
      console.error("Error:", err);
      return createErrorResponse(PluginErrorType.PluginServerError, err as object);
    }
  }); 