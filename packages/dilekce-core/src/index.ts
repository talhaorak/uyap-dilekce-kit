export interface PetitionParty {
  fullName: string;
  identityNumber?: string;
  taxNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Petition {
  court: string;
  applicant: PetitionParty;
  respondent?: string;
  subject: string;
  explanations: string[];
  legalGrounds?: string[];
  evidence?: string[];
  requests: string[];
  attachments?: string[];
  date?: string;
}

export interface ChecklistItem {
  label: string;
  status: "required" | "recommended" | "verify";
  detail?: string;
}

export interface PetitionValidationResult {
  valid: boolean;
  missingFields: string[];
  warnings: string[];
}

export function renderPetitionMarkdown(petition: Petition): string {
  return [
    heading(petition.court),
    field("BASVURAN", renderParty(petition.applicant)),
    petition.respondent ? field("KARSI TARAF / IDARE", petition.respondent) : "",
    field("KONU", petition.subject),
    section("ACIKLAMALAR", numbered(petition.explanations)),
    optionalSection("HUKUKI SEBEPLER", petition.legalGrounds),
    optionalSection("DELILLER", petition.evidence),
    section("SONUC VE ISTEM", numbered(petition.requests)),
    optionalSection("EKLER", petition.attachments),
    petition.date ? field("TARIH", petition.date) : "",
    "Basvuran",
    petition.applicant.fullName,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function renderPetitionText(petition: Petition): string {
  return [
    petition.court,
    "",
    textField("BASVURAN", renderParty(petition.applicant)),
    petition.respondent ? textField("KARSI TARAF / IDARE", petition.respondent) : "",
    textField("KONU", petition.subject),
    "",
    textSection("ACIKLAMALAR", numbered(petition.explanations)),
    optionalTextSection("HUKUKI SEBEPLER", petition.legalGrounds),
    optionalTextSection("DELILLER", petition.evidence),
    textSection("SONUC VE ISTEM", numbered(petition.requests)),
    optionalTextSection("EKLER", petition.attachments),
    petition.date ? textField("TARIH", petition.date) : "",
    "",
    "Basvuran",
    petition.applicant.fullName,
  ]
    .filter((value) => value !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function buildPetitionChecklist(petition: Petition): ChecklistItem[] {
  const checklist: ChecklistItem[] = [
    { label: "Basvuran ad soyad bilgisi kontrol edildi.", status: "verify" },
    { label: "Teblig tarihi ve itiraz suresi kontrol edildi.", status: "required" },
    { label: "Ceza tutanagi veya bildirim PDF'i eklendi.", status: "required" },
    { label: "UYAP'a yuklemeden once UDF dosyasi acildi ve kontrol edildi.", status: "required" },
  ];

  if (!petition.applicant.identityNumber) {
    checklist.push({ label: "TCKN/vergi no gerekiyorsa tamamlanacak.", status: "recommended" });
  }

  if (!petition.evidence?.length) {
    checklist.push({ label: "Delil listesi bos; fotograf, GPS, kamera veya belge var mi kontrol edilecek.", status: "recommended" });
  }

  return checklist;
}

export function renderChecklistMarkdown(items: ChecklistItem[]): string {
  return items.map((item) => `- [ ] **${statusLabel(item.status)}:** ${item.label}${item.detail ? ` ${item.detail}` : ""}`).join("\n");
}

export function validatePetition(petition: Petition): PetitionValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!petition.court.trim()) missingFields.push("court");
  if (!petition.applicant.fullName.trim()) missingFields.push("applicant.fullName");
  if (!petition.subject.trim()) missingFields.push("subject");
  if (petition.explanations.length === 0) missingFields.push("explanations");
  if (petition.requests.length === 0) missingFields.push("requests");

  if (!petition.applicant.identityNumber && !petition.applicant.taxNumber) {
    warnings.push("Basvuran TCKN/VKN bilgisi yok; UYAP basvurusunda gerekebilir.");
  }

  if (!petition.evidence?.length) {
    warnings.push("Delil listesi bos; basvuru zayif kalabilir.");
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

function heading(value: string): string {
  return `# ${value}`;
}

function field(label: string, value: string): string {
  return `**${label}:** ${value}`;
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body}`;
}

function optionalSection(title: string, values?: string[]): string {
  return values?.length ? section(title, numbered(values)) : "";
}

function optionalTextSection(title: string, values?: string[]): string {
  return values?.length ? textSection(title, numbered(values)) : "";
}

function numbered(values: string[]): string {
  return values.map((value, index) => `${index + 1}. ${value}`).join("\n");
}

function renderParty(party: PetitionParty): string {
  return [
    party.fullName,
    party.identityNumber ? `TCKN/VKN: ${party.identityNumber}` : "",
    party.taxNumber ? `VKN: ${party.taxNumber}` : "",
    party.address,
    party.phone ? `Tel: ${party.phone}` : "",
    party.email ? `E-posta: ${party.email}` : "",
  ]
    .filter(Boolean)
    .join(" - ");
}

function textField(label: string, value: string): string {
  return `${label}: ${value}`;
}

function textSection(title: string, body: string): string {
  return `${title}\n${body}`;
}

function statusLabel(status: ChecklistItem["status"]): string {
  switch (status) {
    case "required":
      return "Zorunlu";
    case "recommended":
      return "Onerilir";
    case "verify":
      return "Kontrol";
  }
}
