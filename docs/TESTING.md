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

`packages/trafik-cezasi-itiraz/tests/domain.test.ts` su davranislari dogrular:

- Manuel facts JSON icin temel validasyon yapilir.
- Itiraz turu radar/EDS, park ve plaka/kimlik hatasi orneklerinde siniflanir.
- Trafik cezasi facts girdisinden dilekce-core `Petition` modeli uretilir.
- Sure, delil ve domain uyarilari checklist'e eklenir.

`apps/cli/tests/cli.test.ts` su davranislari dogrular:

- Sahte facts JSON + olay anlatimi ile `petition.md`, `checklist.md` ve
  `petition.udf` yazilir.

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
- CLI hata durumlari: eksik arguman, bozuk JSON, eksik facts alanlari.
- UYAP Editor/Vatandas manuel kabul testi protokolu.

## Agent/Skill Forward-Testleri

Skill davranislari icin gercekci agent prompt'lari ve beklenen davranislar
`docs/SKILL-DISTRIBUTION.md` icinde tutulur. Skill veya agent dokumani
degistiginde en az bir forward-test senaryosu manuel olarak degerlendirilmeli
veya mumkunse taze bir subagent/thread ile denenmelidir.
