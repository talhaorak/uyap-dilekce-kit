import {
  buildPetitionChecklist,
  renderChecklistMarkdown,
  renderPetitionMarkdown,
  renderPetitionText,
  type ChecklistItem,
  type Petition,
  type PetitionParty,
} from "@uyap-dilekce-kit/dilekce-core";

export type ObjectionType =
  | "radar_eds"
  | "parking"
  | "red_light"
  | "phone_seatbelt"
  | "inspection_insurance"
  | "plate_mounting_temporary_damage"
  | "plate_identity_error"
  | "notification_procedure"
  | "duplicate"
  | "other";

export interface TrafficFineTicket {
  ticketNumber?: string;
  notificationDate?: string;
  violationDate?: string;
  issuingAuthority?: string;
  plate?: string;
  article?: string;
  amountTRY?: number;
  location?: string;
  description?: string;
}

export interface TrafficFineFacts {
  courtCity?: string;
  court?: string;
  applicant: PetitionParty;
  ticket: TrafficFineTicket;
  narrative?: string;
  objections?: string[];
  evidence?: string[];
  attachments?: string[];
  date?: string;
  paid?: boolean;
}

export interface TrafficFinePetitionOptions {
  narrative?: string;
}

export interface TrafficFineChecklistOptions {
  today?: string;
}

export interface TrafficFineDraftOptions extends TrafficFinePetitionOptions, TrafficFineChecklistOptions {
  petitionDate?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DeadlineAssessment {
  status: "unknown" | "open" | "last-day" | "expired";
  notificationDate?: string;
  deadlineDate?: string;
  daysRemaining?: number;
  warnings: string[];
}

export interface TrafficFineDraft {
  objectionType: ObjectionType;
  deadline: DeadlineAssessment;
  petition: Petition;
  checklist: ChecklistItem[];
  missingFacts: string[];
  markdown: string;
  text: string;
  checklistMarkdown: string;
}

interface ObjectionProfile {
  label: string;
  explanations: string[];
  evidence: string[];
  checklist: ChecklistItem[];
}

const OBJECTION_DAYS = 15;

const OBJECTION_PROFILES: Record<ObjectionType, ObjectionProfile> = {
  radar_eds: {
    label: "Radar/EDS hiz cezasi",
    explanations: [
      "Radar veya EDS kaydinin, olcum noktasinin, zaman bilgisinin, arac-plaka eslesmesinin ve cihaz kalibrasyon kayitlarinin dosyaya getirtilmesi gerekir.",
      "Olcumun yapildigi yer, levhalandirma ve hiz limiti bilgileri olay anlatimimla birlikte incelenmeden cezanin hukuka uygunlugu denetlenemez.",
    ],
    evidence: ["Radar/EDS fotografi", "Cihaz kalibrasyon belgesi", "Olay yeri ve hiz limiti levha fotografi"],
    checklist: [
      { label: "Radar/EDS fotografi, koordinat ve saat bilgisi istendi mi?", status: "verify" },
      { label: "Kalibrasyon belgesi veya cihaz kaydi talep edildi mi?", status: "recommended" },
    ],
  },
  parking: {
    label: "Park cezasi",
    explanations: [
      "Park ihlalinin gerceklesip gerceklesmedigi, olay yerindeki trafik isaretleri, fotograf kaydi ve gorevli tespitleriyle birlikte degerlendirilmelidir.",
    ],
    evidence: ["Olay yeri fotografi", "Park yasagi levha fotografi", "Kamera veya konum kaydi"],
    checklist: [{ label: "Olay yeri ve levha fotografi eklendi mi?", status: "recommended" }],
  },
  red_light: {
    label: "Kirmizi isik cezasi",
    explanations: [
      "Kirmizi isik ihlalinin EDS kaydi, zaman bilgisi, sinyalizasyon durumu ve arac-plaka eslesmesiyle birlikte denetlenmesi gerekir.",
    ],
    evidence: ["EDS fotograf/video kaydi", "Sinyalizasyon kaydi", "Olay yeri fotografi"],
    checklist: [{ label: "EDS fotograf/video kaydi ve arac-plaka eslesmesi kontrol edildi mi?", status: "verify" }],
  },
  phone_seatbelt: {
    label: "Telefon veya emniyet kemeri cezasi",
    explanations: [
      "Fiilin sabit olup olmadigi, gorevli tespitinin somutlugu, fotograf/video kaydi ve arac icindeki gorunurluk kosullariyla birlikte incelenmelidir.",
    ],
    evidence: ["Fotograf/video kaydi", "Tutanak ayrintilari", "Arac ici veya cevre kamera kaydi"],
    checklist: [{ label: "Gorevli tespiti disinda somut fotograf/video delili var mi?", status: "verify" }],
  },
  inspection_insurance: {
    label: "Muayene veya sigorta cezasi",
    explanations: [
      "Aracin muayene, zorunlu trafik sigortasi veya tescil durumuna iliskin resmi kayitlar ceza tarihi itibariyla karsilastirilmalidir.",
    ],
    evidence: ["Muayene kaydi", "Sigorta police/kayit belgesi", "Tescil kaydi"],
    checklist: [{ label: "Ceza tarihi itibariyla resmi muayene/sigorta kaydi alindi mi?", status: "required" }],
  },
  plate_mounting_temporary_damage: {
    label: "Kaza/hasar nedeniyle gecici plaka montaj sorunu",
    explanations: [
      "Ön tescil plakasının montaj yerinde bulunmaması kaza veya hasar nedeniyle ortaya çıkan geçici bir durumdur; plaka gizlenmemiş, aracın kimliğini saklama amacıyla hareket edilmemiştir.",
      "Plaka araç içinde dışarıdan görülebilir ve okunabilir yerde bulundurulmuş, araç tamir/servis sürecine alınmak üzere geçici olarak bu halde kalmıştır.",
      "Somut olayda kusur durumu, zorunluluk, geçicilik ve ölçülülük birlikte değerlendirilerek idari para cezasının iptaline karar verilmesi talep edilmektedir.",
    ],
    evidence: [
      "Kaza tutanağı veya kaza/hasar kaydı",
      "Araç hasar fotoğrafları",
      "Plakanın ön cam veya konsol üzerindeki görünür konumunu gösteren fotoğraf",
      "Tamir/servis randevu veya kabul belgesi",
    ],
    checklist: [
      { label: "Plakanin gizlenmedigini ve disaridan okunabilir oldugunu gosteren fotograf eklendi mi?", status: "required" },
      { label: "Kaza/hasar ile plakanin dusmesi arasindaki bag fotograf veya tutanakla desteklendi mi?", status: "required" },
      { label: "Tamir/servis randevusu veya servis kabul belgesi eklendi mi?", status: "recommended" },
      { label: "Aracin bu halde kullaniminin yeni ceza riski dogurabilecegi ayrica degerlendirildi mi?", status: "verify" },
    ],
  },
  plate_identity_error: {
    label: "Plaka veya kimlik hatasi",
    explanations: [
      "Ceza bildirimindeki plaka, arac, kisi veya konum bilgilerinde maddi hata bulunmasi halinde cezanin muhatabi ve fiil tekrar degerlendirilmelidir.",
    ],
    evidence: ["Ruhsat kaydi", "Plaka fotografi", "Aracin olay anindaki konumunu gosteren belge"],
    checklist: [{ label: "Ruhsat/plaka eslesmesi ve olay anindaki arac konumu belgelendi mi?", status: "required" }],
  },
  notification_procedure: {
    label: "Teblig veya usul itirazi",
    explanations: [
      "Teblig usulu, basvuru suresi, tutanak zorunlu unsurlari ve idari bildirim kayitlari birlikte kontrol edilmelidir.",
    ],
    evidence: ["Teblig mazbatasi", "E-teblig kaydi", "Ceza tutanagi"],
    checklist: [{ label: "Teblig tarihi ve basvuru suresi belgeyle dogrulandi mi?", status: "required" }],
  },
  duplicate: {
    label: "Mukerrer ceza",
    explanations: [
      "Ayni fiil veya ayni zaman araligi icin birden fazla idari para cezasi duzenlenmis olabilir; tutanaklar birlikte incelenmelidir.",
    ],
    evidence: ["Onceki/ikinci ceza tutanaklari", "Odeme kayitlari", "Teblig kayitlari"],
    checklist: [{ label: "Ayni fiile iliskin diger ceza tutanaklari eklendi mi?", status: "required" }],
  },
  other: {
    label: "Genel trafik cezasi itirazi",
    explanations: [
      "Ceza tutanagindaki maddi bilgiler, olay anlatimi, deliller ve idarenin dayanak kayitlari birlikte degerlendirilmelidir.",
    ],
    evidence: ["Ceza tutanagi", "Olayi destekleyen fotograf/video/belge"],
    checklist: [{ label: "Itiraz sebebi somut delil veya kayitla desteklendi mi?", status: "verify" }],
  },
};

export function validateTrafficFineFacts(value: unknown): ValidationResult {
  const errors: string[] = [];
  const facts = value as Partial<TrafficFineFacts> | undefined;

  if (!facts || typeof facts !== "object") {
    return { valid: false, errors: ["facts JSON nesne olmalidir."] };
  }

  if (!facts.applicant || typeof facts.applicant !== "object") errors.push("applicant nesnesi zorunludur.");
  if (!facts.ticket || typeof facts.ticket !== "object") errors.push("ticket nesnesi zorunludur.");
  if (!facts.applicant?.fullName) errors.push("applicant.fullName zorunludur.");
  if (!facts.ticket?.notificationDate) errors.push("ticket.notificationDate eksikse sure hesabi yapilamaz.");
  if (!facts.ticket?.ticketNumber) errors.push("ticket.ticketNumber zorunludur.");
  if (!facts.ticket?.plate) errors.push("ticket.plate zorunludur.");

  return { valid: errors.length === 0, errors };
}

export function assertTrafficFineFacts(value: unknown): asserts value is TrafficFineFacts {
  const validation = validateTrafficFineFacts(value);
  if (!validation.valid) {
    throw new Error(validation.errors.join("\n"));
  }
}

export function classifyObjectionType(facts: TrafficFineFacts): ObjectionType {
  const text = normalizeSearchText([
    facts.ticket.article,
    facts.ticket.description,
    facts.ticket.location,
    facts.narrative,
    ...(facts.objections ?? []),
  ]);

  if (
    matchesAny(text, [
      "23/3-b",
      "tescil plakasi takmamak",
      "plaka takmamak",
      "plaka dustu",
      "plaka dusmus",
      "on cam",
      "on konsol",
      "kaza nedeniyle plaka",
      "montaj",
    ])
  ) {
    return "plate_mounting_temporary_damage";
  }

  if (matchesAny(text, ["plaka", "kimlik", "arac bana ait degil", "maddi hata", "hatali"])) return "plate_identity_error";
  if (matchesAny(text, ["mukerrer", "ayni fiil", "ikinci ceza"])) return "duplicate";
  if (matchesAny(text, ["hiz", "radar", "eds", "ortalama hiz", "51/2"])) return "radar_eds";
  if (matchesAny(text, ["park", "duraklama", "61/1"])) return "parking";
  if (matchesAny(text, ["kirmizi", "isik", "isigi", "47/1-b"])) return "red_light";
  if (matchesAny(text, ["telefon", "kemer", "emniyet"])) return "phone_seatbelt";
  if (matchesAny(text, ["muayene", "sigorta", "tescil"])) return "inspection_insurance";
  if (matchesAny(text, ["teblig", "usul", "sure"])) return "notification_procedure";

  return "other";
}

export function buildTrafficFinePetition(
  facts: TrafficFineFacts,
  options: TrafficFinePetitionOptions = {},
): Petition {
  const objectionType = classifyObjectionType({ ...facts, narrative: options.narrative ?? facts.narrative });
  const profile = OBJECTION_PROFILES[objectionType];
  const narrative = options.narrative ?? facts.narrative ?? "Olay anlatimi henuz eklenmedi.";

  return {
    court: facts.court ?? buildCourtName(facts.courtCity),
    applicant: facts.applicant,
    respondent: facts.ticket.issuingAuthority,
    subject: "Trafik idari para cezasina itiraz ve cezanin iptali talebidir.",
    explanations: [
      `Tarafima yoneltilen trafik idari para cezasi ozetle su sekildedir: ${renderFineSummary(facts.ticket)}.`,
      facts.ticket.notificationDate
        ? `Ceza bildirimi ${facts.ticket.notificationDate} tarihinde teblig edilmis gorunmektedir; basvuru suresi ve teblig usulu UYAP yuklemesi oncesinde ayrica kontrol edilecektir.`
        : "Teblig tarihi dosyada netlesmedigi icin basvuru suresi ayrica kontrol edilmelidir.",
      `Olaya iliskin beyanim: ${narrative.trim()}`,
      ...profile.explanations,
      ...(facts.objections ?? []).map((objection) => `Ayrica itiraz sebebim: ${objection}`),
    ],
    legalGrounds: [
      "2918 sayili Karayollari Trafik Kanunu.",
      "5326 sayili Kabahatler Kanunu.",
      "Ilgili yonetmelik ve sair mevzuat.",
    ],
    evidence: unique(["Ceza tutanagi/bildirim PDF'i", "Teblig kaydi", ...profile.evidence, ...(facts.evidence ?? [])]),
    requests: [
      "Itirazimin kabulune karar verilmesini talep ederim.",
      "Hukuka aykiri veya maddi hataya dayali trafik idari para cezasinin iptaline karar verilmesini talep ederim.",
      facts.paid
        ? "Ceza bedeli odenmis ise, iptal karari sonrasinda bedelin iadesine iliskin haklarimin sakli tutulmasini talep ederim."
        : "Yargilama giderleri ve sair haklarimin sakli tutulmasini talep ederim.",
    ],
    attachments: unique(["Ceza tutanagi/bildirim PDF'i", ...(facts.attachments ?? [])]),
    date: facts.date,
  };
}

export function buildTrafficFineChecklist(
  facts: TrafficFineFacts,
  options: TrafficFineChecklistOptions = {},
): ChecklistItem[] {
  const objectionType = classifyObjectionType(facts);
  const profile = OBJECTION_PROFILES[objectionType];
  const petition = buildTrafficFinePetition(facts);
  const deadline = calculateObjectionDeadline(facts.ticket.notificationDate, options.today);
  const items: ChecklistItem[] = [
    ...buildPetitionChecklist(petition),
    { label: `Itiraz turu kontrol edildi: ${profile.label}.`, status: "verify" },
    { label: "Ceza tutanagi PDF'i ve varsa ek deliller dilekce eklerine eklendi.", status: "required" },
    { label: "UYAP Vatandas'a yuklemeden once UDF, UYAP Editor veya Vatandas ekraninda acilip kontrol edildi.", status: "required" },
    ...profile.checklist,
  ];

  if (facts.ticket.notificationDate && deadline.deadlineDate) {
    items.push({
      label: `Teblig tarihi ${facts.ticket.notificationDate}; tahmini son gun: ${deadline.deadlineDate}.`,
      status: deadline.status === "expired" ? "required" : "verify",
    });
  }

  for (const warning of deadline.warnings) {
    items.push({ label: warning, status: deadline.status === "expired" ? "required" : "verify" });
  }

  for (const missing of findMissingFacts(facts)) {
    items.push({ label: `Eksik bilgi tamamlanmali: ${missing}.`, status: "required" });
  }

  return dedupeChecklist(items);
}

export function buildTrafficFineDraft(facts: TrafficFineFacts, options: TrafficFineDraftOptions = {}): TrafficFineDraft {
  const hydratedFacts = { ...facts, narrative: options.narrative ?? facts.narrative, date: options.petitionDate ?? facts.date };
  const objectionType = classifyObjectionType(hydratedFacts);
  const deadline = calculateObjectionDeadline(hydratedFacts.ticket.notificationDate, options.today);
  const petition = buildTrafficFinePetition(hydratedFacts);
  const checklist = buildTrafficFineChecklist(hydratedFacts, options);

  return {
    objectionType,
    deadline,
    petition,
    checklist,
    missingFacts: findMissingFacts(hydratedFacts),
    markdown: renderPetitionMarkdown(petition),
    text: renderPetitionText(petition),
    checklistMarkdown: renderChecklistMarkdown(checklist),
  };
}

export function calculateObjectionDeadline(notificationDate?: string, today = isoToday()): DeadlineAssessment {
  if (!notificationDate) {
    return {
      status: "unknown",
      warnings: ["Teblig tarihi yok; trafik cezasi itiraz suresi manuel kontrol edilmeli."],
    };
  }

  const start = parseIsoDate(notificationDate);
  const current = parseIsoDate(today);
  if (!start || !current) {
    return {
      status: "unknown",
      notificationDate,
      warnings: ["Teblig tarihi veya bugun tarihi ISO YYYY-MM-DD formatinda degil."],
    };
  }

  const deadline = addDays(start, OBJECTION_DAYS);
  const daysRemaining = Math.ceil((deadline.getTime() - current.getTime()) / 86_400_000);
  const status = daysRemaining < 0 ? "expired" : daysRemaining === 0 ? "last-day" : "open";
  const warnings = [
    "Suresi genel 15 gun varsayimiyla hesaplandi; somut olayda teblig ve mevzuat mutlaka kontrol edilmeli.",
  ];

  if (status === "expired") {
    warnings.push("Hesaba gore itiraz suresi gecmis olabilir; eski hale getirme veya farkli hukuki yol icin uzman gorusu gerekebilir.");
  }

  return {
    status,
    notificationDate,
    deadlineDate: formatIsoDate(deadline),
    daysRemaining,
    warnings,
  };
}

export function getObjectionTypeLabel(type: ObjectionType): string {
  return OBJECTION_PROFILES[type].label;
}

export function findMissingFacts(facts: TrafficFineFacts): string[] {
  const missing: string[] = [];

  if (!facts.applicant.fullName?.trim()) missing.push("applicant.fullName");
  if (!facts.applicant.identityNumber && !facts.applicant.taxNumber) missing.push("applicant.identityNumber veya applicant.taxNumber");
  if (!facts.applicant.address?.trim()) missing.push("applicant.address");
  if (!facts.ticket.notificationDate) missing.push("ticket.notificationDate");
  if (!facts.ticket.ticketNumber) missing.push("ticket.ticketNumber");
  if (!facts.ticket.plate) missing.push("ticket.plate");
  if (!facts.narrative?.trim()) missing.push("narrative");

  return missing;
}

function renderFineSummary(ticket: TrafficFineTicket): string {
  return [
    ticket.ticketNumber ? `tutanak no ${ticket.ticketNumber}` : "",
    ticket.violationDate ? `ceza tarihi ${ticket.violationDate}` : "",
    ticket.plate ? `plaka ${ticket.plate}` : "",
    ticket.article ? `madde ${ticket.article}` : "",
    typeof ticket.amountTRY === "number" ? `tutar ${ticket.amountTRY} TL` : "",
    ticket.location ? `yer ${ticket.location}` : "",
    ticket.description ? `aciklama ${stripTrailingPeriod(ticket.description)}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function buildCourtName(courtCity?: string): string {
  return `${courtCity?.trim().toLocaleUpperCase("tr-TR") || "NOBETCI"} NOBETCI SULH CEZA HAKIMLIGI'NE`;
}

function normalizeSearchText(parts: Array<string | undefined>): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function dedupeChecklist(items: ChecklistItem[]): ChecklistItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.status}:${item.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseIsoDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isoToday(): string {
  return formatIsoDate(new Date());
}

function stripTrailingPeriod(value: string): string {
  return value.trim().replace(/[.。]+$/u, "");
}
