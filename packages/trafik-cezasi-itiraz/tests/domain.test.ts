import { describe, expect, test } from "bun:test";
import {
  buildTrafficFineChecklist,
  buildTrafficFinePetition,
  classifyObjectionType,
  validateTrafficFineFacts,
  type TrafficFineFacts,
} from "../src/index";

const baseFacts: TrafficFineFacts = {
  courtCity: "Istanbul",
  applicant: {
    fullName: "Ali Veli",
    identityNumber: "11111111110",
    address: "Ornek Mah. Istanbul",
  },
  ticket: {
    ticketNumber: "MB-2026-123",
    notificationDate: "2026-06-10",
    violationDate: "2026-06-01",
    issuingAuthority: "Istanbul Trafik Denetleme Sube Mudurlugu",
    plate: "34ABC123",
    article: "51/2-a",
    amountTRY: 1506,
    location: "D100 Karayolu",
  },
  narrative: "Radar fotografi net degil ve hiz limiti tabelasi olay yerinde gorunmuyordu.",
  evidence: ["Arac ici kamera kaydi"],
  attachments: ["Ruhsat fotokopisi"],
  date: "2026-06-12",
};

describe("trafik cezasi itiraz domain", () => {
  test("manual facts JSON icin temel validasyon yapar", () => {
    expect(validateTrafficFineFacts(baseFacts)).toEqual({ valid: true, errors: [] });
    expect(validateTrafficFineFacts({ ticket: {} }).errors).toContain("applicant nesnesi zorunludur.");
  });

  test("itiraz turunu siniflar", () => {
    expect(classifyObjectionType(baseFacts)).toBe("radar_eds");
    expect(
      classifyObjectionType({
        ...baseFacts,
        ticket: { ...baseFacts.ticket, article: "61/1" },
        narrative: "Arac park yasagi olmayan bolgedeydi.",
        objections: [],
      }),
    ).toBe("parking");
    expect(
      classifyObjectionType({
        ...baseFacts,
        narrative: "Tutanakta hatali plaka yazilmis, ceza baska araca ait.",
      }),
    ).toBe("plate_identity_error");
    expect(
      classifyObjectionType({
        ...baseFacts,
        ticket: { ...baseFacts.ticket, article: "23/3-B" },
        narrative: "Kaza nedeniyle on plaka dustu, plaka on konsol uzerinde disaridan gorunur sekilde duruyordu.",
      }),
    ).toBe("plate_mounting_temporary_damage");
  });

  test("dilekce-core modeliyle trafik cezasi dilekcesi uretir", () => {
    const petition = buildTrafficFinePetition(baseFacts);

    expect(petition.court).toBe("ISTANBUL NOBETCI SULH CEZA HAKIMLIGI'NE");
    expect(petition.applicant.fullName).toBe("Ali Veli");
    expect(petition.explanations.join("\n")).toContain("Radar veya EDS kaydinin");
    expect(petition.evidence).toContain("Arac ici kamera kaydi");
    expect(petition.attachments).toContain("Ruhsat fotokopisi");
  });

  test("domain kontrol listesi sure ve delil uyarilari ekler", () => {
    const checklist = buildTrafficFineChecklist(baseFacts);

    expect(checklist.some((item) => item.label.includes("tahmini son gun: 2026-06-25"))).toBe(true);
    expect(checklist.some((item) => item.label.includes("Radar/EDS fotografi"))).toBe(true);
    expect(checklist.every((item) => ["required", "recommended", "verify"].includes(item.status))).toBe(true);
  });

  test("kaza nedeniyle gecici plaka montaj sorunu icin delil onerir", () => {
    const facts: TrafficFineFacts = {
      ...baseFacts,
      ticket: { ...baseFacts.ticket, article: "23/3-B" },
      narrative: "Kaza nedeniyle on plaka dustu ve plaka on camda disaridan okunabilir sekildeydi.",
    };
    const petition = buildTrafficFinePetition(facts);
    const checklist = buildTrafficFineChecklist(facts);

    expect(petition.explanations.join("\n")).toContain("Plaka araç içinde dışarıdan görülebilir");
    expect(petition.evidence).toContain("Tamir/servis randevu veya kabul belgesi");
    expect(checklist.some((item) => item.label.includes("yeni ceza riski"))).toBe(true);
  });
});
