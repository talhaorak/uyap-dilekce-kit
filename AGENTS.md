# AGENTS.md

Bu repo, UYAP `.udf` uretimi ve Turkce dilekce is akislari icin Bun/TypeScript
tabanli bir monorepo olacak.

## Calisma Kurallari

- Dogrudan `master` uzerinde calisma. Her is icin `feat/...`, `fix/...` veya
  `docs/...` branch'i ac.
- Paket yoneticisi Bun'dir. `npm`, `pnpm`, `yarn` kullanma.
- README ve kullaniciya donuk dokumanlar Turkce olacak.
- UDF format katmani hukuki karar vermez; hukuki akil ve sablonlar ayri
  paketlerde tutulur.
- Hukuki iddialari kaynak, varsayim ve belirsizlikle birlikte yaz. Basari
  garantisi verme.
- Kullanici dosyalari ve hukuki belgeler hassastir. Ucuncu taraf servislere
  gondermeden once acik onay gerekir.

## Komutlar

```bash
bun install
bun test
bun run typecheck
```

## Paketler

- `packages/uyap-udf`: UDF XML/ZIP uretimi, okuma, dogrulama ve CLI.
- `packages/dilekce-core`: dilekce modeli, sablon rendering, Markdown/DOCX.
- `packages/trafik-cezasi-itiraz`: trafik cezasi itiraz akisi.

## Skill Kurallari

- Skill klasoru `SKILL.md` ile baslar.
- `SKILL.md` kisa kalir; ayrinti `references/` altina gider.
- Deterministik veya tekrar eden isler prose yerine kutuphane/CLI/script ile
  yapilir.
- Skill'ler, kutuphane kodunu cagiran ince workflow katmani olmalidir.

## Test Politikasi

- Degistirilen kod icin test ekle veya mevcut testi guncelle.
- UDF uretiminde en az su kontroller olmalidir:
  - `content.xml` arsiv kokunde mi?
  - offset/length hesaplari Turkce karakterlerde dogru mu?
  - cikti unzip edilebiliyor mu?

## Dokuman Yonlendirmesi

- Ayrintili plan: `docs/PLAN.md`
- Mimari: `docs/ARCHITECTURE.md`
- Skill best practices: `docs/SKILL-BEST-PRACTICES.md`
- Codex devir notu: `local/CODEX-DEVIR.md` ignored durumdadir ve commitlenmez.
