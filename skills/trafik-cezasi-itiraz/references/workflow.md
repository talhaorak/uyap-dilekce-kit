# Trafik Cezasi Itiraz Workflow Referansi

## Gerekli Bilgiler

- Kisi: ad soyad, TCKN veya vergi no gerekiyorsa, adres.
- Arac: plaka, ruhsat/iliskili belge gerekiyorsa.
- Tutanak: tutanak no, ceza tarihi, teblig tarihi, idari birim, madde, tutar.
- Olay: kullanicinin kisa anlatimi.
- Deliller: fotograf, kamera/GPS kaydi, odeme, satis/kiralama, muayene/sigorta,
  tanik bilgisi, teblig evraki.

## Itiraz Siniflari

- Radar/EDS/hiz.
- Park.
- Kirmizi isik.
- Kemer/telefon.
- Muayene/sigorta.
- Plaka veya kisi hatasi.
- Teblig/usul hatasi.
- Mukerrer ceza.
- Zorunluluk/acil durum.
- Diger.

## Cikti Seti

- `facts.json`: kaynaktan cikarilan bilgiler ve confidence alanlari.
- `petition.md`: Turkce dilekce taslagi.
- `petition.docx`: zengin belge cikisi.
- `petition.udf`: UYAP yukleme adayi.
- `checklist.md`: eksik bilgiler, ekler, sure ve UYAP yukleme kontrolu.

## Kaynak Kullanimi

`yargi-mcp` kullanilacaksa:

- Sorguyu dar tut.
- Karar metnini getir ve dilekcedeki iddiayi gercekten destekledigini kontrol
  et.
- Kaynak ID/URL ve karar ozetini checklist'e ekle.
- Local/remote MCP ayrimi, cache semasi ve citation guardrail'leri icin
  `../../../docs/yargi-mcp-adapter.md` dosyasini oku.
