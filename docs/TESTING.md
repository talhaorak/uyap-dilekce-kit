# Test Stratejisi

## Simdiki Testler

`packages/uyap-udf/tests/text-udf.test.ts` su davranislari dogrular:

- Turkce karakterlerde offset/length icin karakter sayisi kullanilir.
- Basit metinden `content.xml` uretilir.
- UDF arsivi unzip edilebilir ve kokte `content.xml` vardir.
- UDF validation gecerli arsivleri kabul eder.
- CDATA bitis sekansi guvenli bolunur.
- Eksik kok `content.xml` ve hatali offset validation tarafindan reddedilir.

`packages/dilekce-core/tests/render.test.ts` su davranislari dogrular:

- Dilekce Markdown olarak render edilir.
- Basit kontrol listesi uretilir.

## Calistirma

```bash
bun test
bun run typecheck
```

## Eklenmesi Gereken Testler

- CDATA icinde `]]>` gecen metinler.
- Bos satir ve cok paragraflar.
- Farkli font/size ayarlari.
- Validate komutu icin bozuk arsiv, eksik `content.xml`, hatali offset.
- Dilekce core snapshot testleri.
- Trafik cezasi domain testleri.
