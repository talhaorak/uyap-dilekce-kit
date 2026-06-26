import { describe, expect, test } from "bun:test";
import { buildPetitionChecklist, renderPetitionMarkdown, type Petition } from "../src/index";

const petition: Petition = {
  court: "ISTANBUL NOBETCI SULH CEZA HAKIMLIGI'NE",
  applicant: {
    fullName: "Ali Veli",
    identityNumber: "11111111110",
    address: "Ornek Mah. Istanbul",
  },
  subject: "Trafik idari para cezasina itiraz hakkindadir.",
  explanations: ["Tarafima gonderilen ceza tutanaginda maddi hata bulunmaktadir."],
  legalGrounds: ["2918 sayili Karayollari Trafik Kanunu ve ilgili mevzuat."],
  evidence: ["Ceza tutanagi", "Fotograf kayitlari"],
  requests: ["Itirazin kabulune ve idari para cezasinin iptaline karar verilmesini talep ederim."],
};

describe("dilekce-core", () => {
  test("dilekceyi markdown olarak render eder", () => {
    const markdown = renderPetitionMarkdown(petition);

    expect(markdown).toContain("# ISTANBUL NOBETCI SULH CEZA HAKIMLIGI'NE");
    expect(markdown).toContain("**BAŞVURAN:** Ali Veli - TCKN/VKN: 11111111110 - Ornek Mah. Istanbul");
    expect(markdown).toContain("## SONUÇ VE İSTEM");
  });

  test("kontrol listesi uretir", () => {
    const checklist = buildPetitionChecklist(petition);

    expect(checklist.some((item) => item.label.includes("Teblig tarihi"))).toBe(true);
    expect(checklist.every((item) => ["required", "recommended", "verify"].includes(item.status))).toBe(true);
  });
});
