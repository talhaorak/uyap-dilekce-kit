# Mimari

Bu proje tek bir "hukuk botu" degil; test edilebilir parcali bir arac seti
olarak tasarlanir.

## Katmanlar

1. **UDF format katmani**
   - Paket: `packages/uyap-udf`
   - Sorumluluk: `content.xml` uretimi, ZIP/UDF paketleme, inspect/validate.
   - Hukuki metin veya strateji bilmez.

2. **Dilekce core katmani**
   - Paket: `packages/dilekce-core`
   - Sorumluluk: dilekce veri modeli, sablon rendering, Markdown/DOCX cikti,
     kontrol listesi.
   - Domain kurallarini soyut sablon girdileri olarak alir.

3. **Domain katmani**
   - Paket: `packages/trafik-cezasi-itiraz`
   - Sorumluluk: trafik cezasi PDF'inden bilgi cikarma, itiraz turu siniflama,
     eksik bilgi sorulari, delil checklist'i, trafik cezasi sablonlari.

4. **Agent skill katmani**
   - Klasorler: `skills/uyap-udf`, `skills/trafik-cezasi-itiraz`
   - Sorumluluk: agent'a hangi durumda hangi paket/CLI kullanilacagini
     ogretmek.
   - Uzun hukuk bilgisi ve format ayrintisi `references/` altinda tutulur.

5. **Uygulama katmani**
   - `apps/cli`: ilk kullanilabilir urun.
   - `apps/web`: sonradan, workflow dogrulandiktan sonra.

## Veri Akisi

```text
ceza-tutanagi.pdf + kullanici-bilgileri.json + olay.md
  -> facts.json
  -> objection-type.json
  -> petition.md
  -> petition.docx
  -> petition.udf
  -> checklist.md
```

## yargi-mcp Konumu

`saidsurucu/yargi-mcp` core dependency degildir. Opsiyonel adapter olarak
kullanilir:

- emsal karar veya kaynak arama gerektiginde devreye girer,
- bulunan kararlar kaynak metniyle birlikte cache'lenir,
- karar metni dilekcedeki iddiayi acikca desteklemiyorsa citation olarak
  kullanilmaz.

## Guvenlik ve Hukuk Sinirlari

- UDF cikti teknik olarak dogru olabilir ama hukuki olarak zayif olabilir.
  Bu iki kalite kontrolu ayridir.
- UYAP'a yukleme, e-imza veya basvuru gibi dis/kalici islemler kullanici onayi
  olmadan yapilmaz.
- Kullanici belgeleri hassastir; ucuncu taraf servislere gonderilmez.
