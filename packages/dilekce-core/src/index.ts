export interface PetitionParty {
  fullName: string;
  identityNumber?: string;
  address?: string;
}

export interface Petition {
  court: string;
  applicant: PetitionParty;
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
}

export function renderPetitionMarkdown(petition: Petition): string {
  return [
    heading(petition.court),
    field("BASVURAN", renderParty(petition.applicant)),
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

function numbered(values: string[]): string {
  return values.map((value, index) => `${index + 1}. ${value}`).join("\n");
}

function renderParty(party: PetitionParty): string {
  return [party.fullName, party.identityNumber ? `TCKN/VKN: ${party.identityNumber}` : "", party.address].filter(Boolean).join(" - ");
}
