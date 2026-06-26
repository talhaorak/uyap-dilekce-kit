# UYAP UDF Format Referansi

## Temel Yapi

`.udf` dosyasi ZIP arsividir. Kokte `content.xml` bulunur.

Tipik kok:

```xml
<template format_id="1.8">
```

Ana bolumler:

- `<content>`: tek CDATA metin havuzu.
- `<properties>`: sayfa formati.
- `<elements>`: paragraf, tablo, imaj ve header/footer yapisi.
- `<styles>`: stil tanimlari.

## Offset Kurali

`<elements>` icindeki `content` dugumleri metin havuzuna `startOffset` ve
`length` ile referans verir.

- Offset 0'dan baslar.
- Degerler byte degil karakter sayisidir.
- Turkce karakterler tek karakter sayilmalidir.
- Paragraf aralari `\n` olarak havuzda yer alir.

## Basit A4 Sayfa Formati

```xml
<pageFormat mediaSizeName="1" leftMargin="42.52" rightMargin="28.35" topMargin="14.17" bottomMargin="14.17" paperOrientation="1" headerFOffset="20.0" footerFOffset="20.0"/>
```

## Dis Kaynaklar

- `saidsurucu/UDF-Toolkit`: DOCX/PDF/UDF donusumleri ve format notlari.
- UYAP Editor: nihai uyumluluk kontrolu icin resmi arac.
