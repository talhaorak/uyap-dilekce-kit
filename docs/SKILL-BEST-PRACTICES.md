# Skill Hazirlama ve Dagitim Notlari

Bu notlar, Anthropic Agent Skills dokumantasyonu, OpenAI Codex skills
dokumantasyonu, AGENTS.md pratikleri ve yerel `skill-creator` yonergesi
okunarak projeye uygulanacak kurallari toplar.

## Arastirma Ozeti

- Anthropic Agent Skills yaklasimi `SKILL.md` merkezlidir: skill bir klasordur,
  `SKILL.md` YAML frontmatter ile baslar, `name` ve `description` tetikleme icin
  kritik alandir.
- Progressive disclosure temel prensiptir: agent baslangicta sadece metadata'yi
  gorur; `SKILL.md` ve `references/` ihtiyac halinde okunur.
- `scripts/`, `references/`, `assets/` ayrimi tekrar eden isleri daha guvenilir
  ve daha az token maliyetli hale getirir.
- OpenAI Codex dokumantasyonu, reusable dagitim icin plugin yaklasimini ve
  lokal skill klasorlerini vurgular.
- AGENTS.md pratikleri, repo icin kalici calisma sozlesmesi saglar: komutlar,
  test beklentisi, ask-first/never-do sinirlari ve ornek workflow'lar.

## Bu Repoda Uygulanan Kurallar

- Root `AGENTS.md` kisa, operasyonel ve agent tarafindan hemen uygulanabilir
  tutulur.
- Skill'ler `skills/<skill-name>/SKILL.md` altinda tutulur.
- Skill `description` alani tetikleyici olacak sekilde yazilir; uzun aciklama
  body'ye veya `references/` dosyasina tasinir.
- Format gibi deterministik isler prose'a gomulmez; TypeScript kutuphane ve CLI
  ile yapilir.
- Her skill'in `references/` klasoru vardir ve SKILL.md hangi durumda hangi
  referansin okunacagini soyler.
- Skill'ler tek basina urun degildir; bu repodaki kutuphaneleri kullanacak ince
  agent workflow katmanidir.

## Dagitim Stratejisi

1. **Repo path ile kullanim**
   - Agent'a `skills/uyap-udf/SKILL.md` veya
     `skills/trafik-cezasi-itiraz/SKILL.md` yolu verilir.

2. **Codex/OpenClaw lokal skill kurulumu**
   - Skill klasorleri kullanicinin skill dizinine kopyalanabilir.
   - Bu yol ilk denemeler icin yeterlidir.

3. **Plugin olarak dagitim**
   - Daha sonra Codex plugin paketi hazirlanabilir.
   - Plugin, skill dosyalarini ve CLI kullanim notlarini birlikte tasir.

4. **NPM/Bun kutuphanesi olarak dagitim**
   - `packages/uyap-udf` ayrica paketlenebilir.
   - Skill kullansalar da kullanmasalar da gelistiriciler CLI/kutuphaneyi
     dogrudan kullanabilir.

## Skill Kalite Checklist'i

- [ ] `SKILL.md` frontmatter gecerli YAML.
- [ ] `name` lowercase kebab-case.
- [ ] `description` ne zaman tetiklenecegini acikca soyluyor.
- [ ] `SKILL.md` 500 satirdan kisa.
- [ ] Ayrinti `references/` altinda.
- [ ] Tekrar eden isler script/CLI/kutuphanede.
- [ ] Hukuki riskler ve onay gerektiren islemler acik.
- [ ] En az bir gercekci forward-test senaryosu yazilmis.

## Kaynaklar

- Anthropic Agent Skills overview:
  `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview`
- Anthropic skill authoring best practices:
  `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices`
- OpenAI Developers Codex Agent Skills:
  `https://developers.openai.com/codex/skills`
- OpenAI Developers AGENTS.md custom instructions:
  `https://developers.openai.com/codex/guides/agents-md`
- GitHub Blog AGENTS.md pratikleri:
  `https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/`
- `skill-creator` yerel skill'i: concise SKILL.md, references/scripts/assets,
  validation ve forward-testing prensipleri.
