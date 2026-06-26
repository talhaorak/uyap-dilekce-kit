# yargi-mcp Opsiyonel Adapter Notlari

`saidsurucu/yargi-mcp`, Turk hukuk kaynaklarini MCP uzerinden aramak icin
yararlidir; ancak bu repoda core dependency degildir. Adapter yalnizca kaynakli
arastirma ve citation adaylari icin kullanilir. UDF uretimi, dilekce rendering
ve trafik cezasi temel workflow'u adapter olmadan calisabilmelidir.

## Hedef

- Trafik cezasi itirazinda emsal karar veya mevzuat aramayi opsiyonel hale
  getirmek.
- Bulunan kaynaklari ham metin, kaynak bilgisi ve sorgu baglami ile cachelemek.
- Kaynak metni dilekcedeki iddiayi acikca desteklemiyorsa dilekceye citation
  eklememek.
- Kaynak bulunamadiginda workflow'u durdurmak yerine checklist'e belirsizlik
  notu yazmak.

## Calistirma Modlari

### Local MCP

Ilk gelistirme ve mahrem belge akislari icin tercih edilir.

```bash
uvx yargi-mcp
```

Agent veya uygulama adapter'i MCP endpoint bilgisini ortam degiskeninden almali:

```bash
YARGI_MCP_ENDPOINT=http://127.0.0.1:8000/mcp
```

Gercek port/komut upstream `yargi-mcp` dokumanina gore dogrulanmalidir. Bu repo
local MCP'nin ayakta oldugunu varsaymamalidir.

### Remote MCP

Remote MCP yalnizca acik onay ve veri siniri ile kullanilir:

- Kullanici belgesi, TCKN, adres, plaka gibi hassas veri sorguya konmaz.
- Sorgular genel hukuki konu ve madde/adliye baglami ile daraltilir.
- Remote endpoint bilgisi config/env ile verilir, repoya yazilmaz.

## Adapter Sozlesmesi

Ilk adapter yuzeyi bu sekilde dusunulur:

```ts
export type LegalSourceQuery = {
  domain: "trafik-cezasi" | "genel";
  issue: string;
  legalBasis?: string[];
  jurisdiction?: string;
  dateRange?: { from?: string; to?: string };
  limit?: number;
};

export type LegalSourceHit = {
  sourceId: string;
  title: string;
  court?: string;
  decisionDate?: string;
  url?: string;
  excerpt: string;
  fullText?: string;
  query: LegalSourceQuery;
  supportsClaim: "yes" | "no" | "unclear";
  checkedAt: string;
};
```

Adapter'in gorevi kaynak adayi getirmektir; hukuki sonuc karari vermek degil.
`supportsClaim` degeri agent veya domain katmanindaki kaynak kontrolunden sonra
atanir.

## Sorgu Preset'leri

Preset'ler kisiyi degil hukuki sorunu tarif eder.

- `trafik-hiz-radar-usul`: radar/EDS hiz cezasi, kalibrasyon, tutanak ve usul.
- `trafik-teblig-sure`: trafik idari para cezasi, teblig, itiraz suresi.
- `trafik-plaka-kimlik-hatasi`: plaka veya kisi eslesme hatasi, idari para
  cezasi iptali.
- `trafik-mukerrer-ceza`: ayni fiilden mukerrer idari para cezasi.
- `trafik-zorunluluk`: zorunluluk hali, acil durum, idari para cezasi.

Her preset once 3-5 sonuc ile sinirlanmali; genis arama yalnizca ilk sonuclar
yetersizse yapilmalidir.

## Cache Semasi

Kaynak cache'i ileride `local/cache/yargi-mcp/` veya uygulama data dizini
altinda tutulabilir. Commitlenmez.

```json
{
  "schemaVersion": 1,
  "queryHash": "sha256...",
  "query": {
    "domain": "trafik-cezasi",
    "issue": "radar hiz cezasi kalibrasyon usul"
  },
  "hits": [
    {
      "sourceId": "example",
      "title": "Ornek karar",
      "court": "Sulh Ceza Hakimligi",
      "decisionDate": "2024-01-01",
      "url": "https://example.invalid",
      "excerpt": "Karar ozeti...",
      "supportsClaim": "unclear",
      "checkedAt": "2026-06-26T00:00:00.000Z"
    }
  ]
}
```

Cache anahtari sorgu metni, preset, tarih araligi ve adapter surumu ile
uretilmelidir. Kaynak metni degistiginde eski cache sonucu tekrar kontrol
edilmelidir.

## Guardrail'ler

- UDF ve dilekce uretimi `yargi-mcp` yokken de calismali.
- Citation icin karar basligi yetmez; ilgili pasaj iddiayi desteklemeli.
- `supportsClaim: "unclear"` veya `"no"` olan kaynak dilekceye dayanak olarak
  eklenmez; sadece checklist'te "kontrol edildi" notu olabilir.
- Hassas kullanici verisi remote MCP'ye gonderilmez.
- MCP hatasi kullaniciya "kaynak aramasi yapilamadi" olarak raporlanir; sahte
  kaynak uretilmez.

## Trafik Cezasi Workflow'una Etkisi

1. Facts ve itiraz turu belirlendikten sonra kaynak ihtiyaci degerlendirilir.
2. Uygun preset ile dar sorgu uretilir.
3. Kaynak adaylari cache'ten veya MCP'den gelir.
4. Her aday icin destekledigi iddia acikca isaretlenir.
5. Petition sadece `supportsClaim: "yes"` olan kaynaklari citation olarak
   kullanir.
6. Checklist kaynak aramasinin yapilip yapilmadigini, belirsizlikleri ve manuel
   dogrulama ihtiyacini yazar.
