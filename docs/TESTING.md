# Test Stratejisi

## Simdiki Testler

`packages/uyap-udf/tests/text-udf.test.ts` su davranislari dogrular:

- Turkce karakterlerde offset/length icin karakter sayisi kullanilir.
- Basit metinden `content.xml` uretilir.
- UDF arsivi unzip edilebilir ve kokte `content.xml` vardir.

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
