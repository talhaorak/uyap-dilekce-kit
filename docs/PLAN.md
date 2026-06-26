# Ayrintili Is Plani

Bu plan, projeyi Codex veya baska coding agent'lara devredilebilir parcalara
ayirmak icin yazildi.

## Faz 0 - Temel Zemin

- [x] GitHub reposu acildi: `talhaorak/uyap-dilekce-kit`
- [x] Repo `~/Codes/uyap-dilekce-kit` altina klonlandi.
- [x] MIT lisansi ve Node/Bun `.gitignore` olusturuldu.
- [x] Feature branch uzerinde calisma baslatildi.
- [x] Agent talimatlari eklendi: `AGENTS.md`, `CLAUDE.md`,
  `.github/copilot-instructions.md`.
- [x] Bun workspace iskeleti eklendi.
- [x] `packages/uyap-udf` icin ilk text-to-UDF POC ve testleri eklendi.

## Faz 1 - UDF Format Katmani

- [x] `content.xml` uretimini daha resmi bir model ile temsil et:
  - `Template`
  - `ContentPool`
  - `Paragraph`
  - `Style`
  - `PageFormat`
- [x] XML uretiminde attribute escaping ve CDATA edge case testlerini artir.
- [x] UDF validate komutu ekle:
  - arsiv aciliyor mu,
  - kokte `content.xml` var mi,
  - `format_id="1.8"` var mi,
  - offset/length metin havuzuyla uyumlu mu.
- [x] `inspect` komutunu daha guvenli hale getir:
  - varsayilan olarak tum `content.xml` basma,
  - `--show-xml` bayragi ekle.
- [ ] Basit UYAP Editor manuel test protokolu yaz.
- [ ] `saidsurucu/UDF-Toolkit` ile uyumluluk farklarini not et.

## Faz 2 - Dilekce Core

- [x] `packages/dilekce-core` paketini ac.
- [x] Dilekce veri modelini tanimla:
  - baslik/merci,
  - taraf/kisi bilgileri,
  - konu,
  - aciklamalar,
  - hukuki sebepler,
  - deliller,
  - sonuc ve istem,
  - ekler.
- [x] Markdown renderer yaz.
- [ ] DOCX renderer icin kutuphane sec:
  - once basit metin/bolumler,
  - sonra tablo/ek listesi.
- [ ] Snapshot testleri ekle.
- [ ] Template hata mesajlarini Turkce ve net yap.

## Faz 3 - Trafik Cezasi Itiraz Domain Paketi

- [x] `packages/trafik-cezasi-itiraz` paketini ac.
- [x] `facts.json` semasini tanimla:
  - tutanak no,
  - teblig tarihi,
  - ceza tarihi,
  - idari birim,
  - plaka,
  - madde,
  - tutar,
  - yer,
  - olay anlatimi,
  - ek deliller.
- [ ] PDF/OCR extraction adapter tasarla.
- [x] Itiraz turu siniflayici yaz:
  - radar/EDS,
  - park,
  - kirmizi isik,
  - hiz,
  - telefon/kemer,
  - muayene/sigorta,
  - plaka/kimlik hatasi,
  - teblig/usul,
  - diger.
- [x] Her tur icin eksik bilgi sorulari ve delil checklist'i yaz.
- [x] Ilk dilekce sablonunu trafik cezasi genel itiraz icin hazirla.
- [x] Domain testleri ekle:
  - sure uyarisi,
  - eksik bilgi sorulari,
  - delil listesi,
  - dilekce rendering.

## Faz 4 - Agent Skill Paketleri

- [ ] `skills/uyap-udf` skill'ini kucuk ve tetikleyici odakli tut.
- [ ] `skills/trafik-cezasi-itiraz` skill'ini workflow odakli tut.
- [ ] Ayrintili format/hukuk bilgilerini `references/` altina tasi.
- [x] Skill dagitimi icin en az iki yol dokumante et:
  - repo icinden path ile kullanim,
  - ileride plugin/skill paketi olarak dagitim.
- [x] Skill validation checklist'i ekle.
- [x] Agent forward-test senaryolari yaz.

## Faz 5 - yargi-mcp Opsiyonel Adapter

- [x] `docs/yargi-mcp-adapter.md` tasarimini yaz.
- [x] Local `uvx yargi-mcp` ve remote MCP opsiyonlarini ayir.
- [x] Arama sorgularini daraltan preset'ler yaz.
- [x] Kaynak cache semasi tasarla.
- [x] Kaynak desteklemiyorsa dilekceye citation eklemeyen guardrail yaz.

## Faz 6 - CLI MVP

- [x] `apps/cli` ac.
- [x] Ornek akisi calistir:
  - PDF veya manuel facts,
  - olay anlatimi,
  - dilekce markdown,
  - UDF export,
  - checklist.
- [x] `examples/` altina sahte veriyle tam demo koy.
- [x] CI'da testleri calistir.

## Faz 7 - Web Uygulamasi

- [ ] CLI workflow dogrulanmadan web'e baslama.
- [ ] Local-first dosya isleme hedefle.
- [ ] Kullanici belgesini ucuncu taraf servise gonderen her akis icin acik onay
  UI'i tasarla.
- [ ] UDF indir, DOCX indir, checklist indir akisini ekle.

## Definition of Done

- `bun test` geciyor.
- `bun run typecheck` geciyor.
- README Turkce ve guncel.
- Agent talimatlari guncel.
- UDF cikti unzip edilip `content.xml` kontrol edilebiliyor.
- Hukuki iddialar kaynak veya belirsizlik notuyla yaziliyor.
