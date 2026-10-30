export type Position = {
  value: string;
  label: string;
  description: string;
  eligibleClasses: string[];
};

export const CLASSES = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
export const STREAMS = ["Orange", "Violet"];
export const AGES = Array.from({ length: 10 }, (_, i) => String(i + 6));

/** Coordinator applications use the school's complete class list. */
const CONTEST_CLASSES = CLASSES;

export const POSITIONS: Position[] = [
  { value: "english_coordinator", label: "English Coordinator", description: "Promote reading, writing and spoken English across the school", eligibleClasses: CONTEST_CLASSES },
  { value: "science_coordinator", label: "Science Coordinator", description: "Support science lessons, experiments and science clubs", eligibleClasses: CONTEST_CLASSES },
  { value: "social_studies_coordinator", label: "Social Studies Coordinator", description: "Champion social studies activities, projects and school outings", eligibleClasses: CONTEST_CLASSES },
  { value: "mathematics_coordinator", label: "Mathematics Coordinator", description: "Encourage maths practice, quizzes and peer support", eligibleClasses: CONTEST_CLASSES },
  { value: "religious_education_coordinator", label: "Religious Education Coordinator", description: "Lead religious education activities and moral guidance", eligibleClasses: CONTEST_CLASSES },
];

/** Official pupil register used for name drop-downs. */
export const PUPILS = [
  "Wasswa Hardy", "Buyondo Trinity", "Nabunya Joweria", "Abigaba Chloe", "Ssuubi Jordan", "Kato Harry", "Ayella James",
  "Nandutu Norah", "Liam Desmond", "Muyimbwa Rauben", "Kaliisa Warren", "Ssetaba Benson", "Balekere Garrisone",
  "Bulondo Victa Auther", "Nattabi Mary Hana", "Mukiibi Nicolas", "Kisozi Hisham", "Lukwago Awathi Fashan",
  "Namukwaya Brenda", "Nakabiito Jemimah", "Ntambaazi Shawna G", "Nakato Barbrah", "Aheirwe Marilyne Buki",
  "Nakirijja Precious", "Nalutaaya Noeline", "Muchunguzi Adrian", "Ntege Aiden", "Babirye Brenda", "Nansimbi Brianah",
  "Aisu Daniel", "Ainebyona Isaac", "Luzige Spencer", "Namugwanya Gabriella", "Amuli Elyom Morison", "Naluganzi Teopista",
  "Mpologoma Radia", "Ssemanda Shakim", "Mwesigwa Gabriel", "Nanyange Tara", "Nsubuga Isiah", "Nagayi Bahira",
  "Mirembe Desire", "Lukwago Mario", "Muwanga Benard", "Nabaggala Kayla", "Mutenza Shaban", "Nakigozi Promise",
  "Bugembe Anthony", "Nsereko Shawn", "Natukunda Shaneez", "Asiimwe Abra",
].sort((a, b) => a.localeCompare(b));

export const SCHOOL_DOMAIN = "kpm.com";

/** School email for a pupil name, e.g. "Wasswa Hardy" -> wasswa.hardy@kpm.com */
export function schoolEmail(name: string, teacher = false) {
  const slug = name.trim().split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean).join(".");
  return `${slug}${teacher ? ".teacher" : ""}@${SCHOOL_DOMAIN}`;
}

export function isSchoolEmail(email?: string | null) {
  return !!email && email.toLowerCase().endsWith(`@${SCHOOL_DOMAIN}`);
}

/** Lets short school passwords (e.g. 6667) meet the sign-in system's minimum length. */
export function toAuthPassword(p: string) {
  return `kpm#${p}`;
}

/** Accepts a full email or just the part before @ ("wasswa.hardy"). */
export function normalizeLogin(v: string) {
  const s = v.trim().toLowerCase();
  return s.includes("@") ? s : `${s}@${SCHOOL_DOMAIN}`;
}

export function positionLabel(value: string) {
  return POSITIONS.find((p) => p.value === value)?.label ?? value;
}

export function positionsForClass(className: string) {
  return POSITIONS.filter((p) => p.eligibleClasses.includes(className));
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

/** Resize an image file to a small JPEG data URL so it can be stored with the application. */
export function fileToSmallDataUrl(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const context = c.getContext("2d");
      if (!context) { URL.revokeObjectURL(img.src); reject(new Error("Could not resize photo")); return; }
      context.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    const id = host === "youtu.be" ? url.pathname.slice(1) : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host) ? (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1]) : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function isGmail(email: string) {
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(email.trim());
}

export type ContestStatus = "ongoing" | "upcoming" | "finished";

/** Voting window status: closed switch or past end = finished, before start = upcoming. */
export function contestStatus(s: { voting_open: boolean; voting_starts_at: string | null; voting_ends_at: string | null } | undefined, now = new Date()): ContestStatus {
  if (!s) return "ongoing";
  if (s.voting_starts_at && now < new Date(s.voting_starts_at)) return "upcoming";
  if ((s.voting_ends_at && now > new Date(s.voting_ends_at)) || !s.voting_open) return "finished";
  return "ongoing";
}

export function formatWhen(iso: string | null) {
  if (!iso) return "Not set";
  return new Date(iso).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kampala" }) + " EAT";
}
