# UYAP Dilekce Kit

UYAP'a yuklenebilir `.udf` belgeleri uretmek ve Turkce dilekce is akislari
kurmak icin gelistirilen acik kaynak arac seti.

Ilk hedef dar ve somut: trafik cezasi itirazinda kullanicinin ceza tutanagi
PDF'i, kisi bilgileri ve olay anlatimindan dilekce taslagi, kontrol listesi ve
UYAP uyumlu cikti uretmek.

## Neden?

Turkiye'de UYAP `.udf` formati pratikte onemli ama gelistirici dostu degil.
Bu proje iki parcayi birbirinden ayirir:

- UDF format katmani: `.udf` arsivi, `content.xml`, dogrulama ve donusum.
- Dilekce katmani: bilgi toplama, sablon secimi, hukuki kontrol listesi ve
  belge uretimi.

Bu ayrim sayesinde UDF kutuphanesi trafik cezasi disindaki dilekce ve belge
islerinde de kullanilabilir.

## Hedef Mimari

- `packages/uyap-udf`: Bun/TypeScript kutuphanesi ve CLI.
- `packages/dilekce-core`: dilekce veri modeli, sablon motoru ve cikti uretimi.
- `packages/trafik-cezasi-itiraz`: trafik cezasi itiraz akisi, PDF bilgi
  cikarma, delil kontrol listesi ve sablonlar.
- `skills/uyap-udf`: agent'lar icin UDF format skill'i.
- `skills/trafik-cezasi-itiraz`: agent'lar icin trafik cezasi itiraz skill'i.
- `apps/cli`: ilk kullanilabilir komut satiri uygulamasi.
- `apps/web`: CLI workflow dogrulandiktan sonra gelecek kullanici arayuzu.

## Mevcut Durum

Bu repo erken asamadadir. Su anda:

- Bun workspace iskeleti vardir.
- `packages/uyap-udf` icinde basit metinden UDF arsivi ureten, inspect eden ve
  validate eden ilk POC vardir.
- `packages/dilekce-core` Markdown/metin rendering ve kontrol listesi uretir.
- `packages/trafik-cezasi-itiraz` manuel facts JSON + olay anlatimindan trafik
  cezasi itiraz dilekcesi ve checklist uretir.
- `apps/cli` sahte ornek veriyle `petition.md`, `checklist.md` ve opsiyonel
  `petition.udf` uretir.
- UDF, dilekce core, trafik domain ve CLI icin testler vardir.
- Agent yonlendirme dosyalari ve ayrintili is plani vardir.
- Skill dagitimi ve forward-test senaryolari dokumante edilmistir.
- `yargi-mcp` icin opsiyonel adapter notlari vardir; core dependency degildir.

## Kurulum

```bash
bun install
```

## Test

```bash
bun test
```

Tip kontrolu:

```bash
bun run typecheck
```

## Ilk CLI Denemesi

Trafik cezasi itiraz MVP:

```bash
bun run trafik-cezasi-itiraz \
  --facts examples/trafik-cezasi-facts.json \
  --narrative examples/trafik-cezasi-olay.md \
  --out /tmp/trafik-demo \
  --udf
```

UDF katmani:

```bash
printf "Merhaba\nDunya" > /tmp/dilekce.txt
bun run uyap-udf from-text /tmp/dilekce.txt /tmp/dilekce.udf
bun run uyap-udf inspect /tmp/dilekce.udf
bun run uyap-udf validate /tmp/dilekce.udf
```

Uretilen `.udf` dosyasi UYAP Editor veya UYAP Vatandas'ta ayrica kontrol
edilmelidir. Bu proje resmi UYAP araci degildir.

## Hukuki Uyari

Bu proje avukatlik hizmeti vermez ve hukuki sonuc garantisi uretmez. Hukuki
icerik tarafinda amac; kaynakli, kontrol edilebilir, kullanicinin onayindan
gecen dilekce taslaklari hazirlamaktir.

## Kaynaklar

- UYAP Editor ve UDF formati hakkinda resmi UYAP dokumantasyonu.
- `saidsurucu/UDF-Toolkit`: UDF donusumleri icin mevcut acik kaynak calisma.
- `saidsurucu/yargi-mcp`: Turk hukuk kaynaklari icin opsiyonel MCP entegrasyonu.
- `docs/SKILL-DISTRIBUTION.md`: skill dagitimi, validation ve forward-test.
- `docs/yargi-mcp-adapter.md`: opsiyonel yargi-mcp adapter sozlesmesi.
