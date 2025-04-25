# Yargıtay Karar Arama Plugin

Bu plugin, LobeChat üzerinden Yargıtay kararlarında arama yapmanızı sağlar.

## Özellikler

- 🔍 Yargıtay kararlarında arama
- 📋 İlk 10 sonucu detaylı şekilde görüntüleme
- 🚀 Hızlı ve güvenilir sonuçlar
- 🔌 LobeChat ile tam entegrasyon

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repo-url>
cd yargitay-search-plugin
```

2. Bağımlılıkları yükleyin:
```bash
bun install
```

3. Geliştirme sunucusunu başlatın:
```bash
bun run dev
```

## Kullanım

Plugin'i LobeChat'te kullanmak için:

1. Plugin'i LobeChat'e ekleyin
2. Arama yapmak istediğiniz konuyu yazın (örn: "komşuluk hukuku")
3. Plugin otomatik olarak Yargıtay kararlarında arama yapacak ve sonuçları gösterecektir

## Geliştirme

- `src/services/yargitay.ts`: Ana arama mantığı
- `src/index.ts`: API endpoint'leri
- `src/plugin.json`: Plugin manifest dosyası

## Lisans

MIT License 