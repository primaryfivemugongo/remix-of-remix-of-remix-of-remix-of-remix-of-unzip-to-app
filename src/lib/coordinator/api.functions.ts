import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CLASSES, STREAMS, POSITIONS, youtubeId } from "./rules";
import { isCommission, canSubmitApplication } from "./access";

const requestSchema = z.object({
  table: z.enum(["electoral_applications", "electoral_votes", "election_settings", "user_roles", "profiles"]),
  action: z.enum(["select", "insert", "update", "delete"]),
  values: z.record(z.string(), z.unknown()).optional(),
  filters: z.array(z.object({ key: z.string(), value: z.unknown() })).default([]),
  single: z.boolean().default(false),
});
const applicationSchema = z.object({
  student_name: z.string().trim().min(1).max(100),
  class_name: z.string().refine(v => CLASSES.includes(v)),
  stream_name: z.string().refine(v => STREAMS.includes(v)),
  age: z.number().int().min(6).max(15).nullable().optional(),
  position: z.string().refine(v => POSITIONS.some(p => p.value === v)),
  experience: z.string().max(5000).nullable().optional(),
  manifesto: z.string().max(10000).default(""),
  photo_url: z.string().max(500000).nullable().optional(),
  manifesto_photos: z.array(z.string().max(500000)).max(6).default([]),
  youtube_url: z.string().nullable().optional().refine(v => !v || !!youtubeId(v)),
});

export const electionRequest = createServerFn({ method: "POST" })
  .inputValidator(input => requestSchema.parse(input))
  .handler(async ({ data }) => {
    const { getPortalSession } = await import("@/lib/auth-session.server");
    const session = await getPortalSession();
    const id = session.data.userId ?? session.data.studentId;
    const role = session.data.role;
    if (!id || !role) throw new Error("Please sign in to your school account.");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const accountTable = role === "student" ? "students" : role === "admin" ? "admins" : "teachers";
    const { data: account } = await db.from(accountTable).select("id,name,email").eq("id", id).maybeSingle();
    if (!account) throw new Error("Please sign in again.");
    const { data: member } = await db.from("coordinator_commission_roles").select("user_id").eq("user_id", id).maybeSingle();
    const commission = isCommission(role, !!member);
    const { data: settings, error: settingsError } = await db.from("coordinator_settings").select("*").eq("id", 1).single();
    if (settingsError || !settings) throw new Error("Election settings are unavailable.");
    const filter = (key: string) => data.filters.find(f => f.key === key)?.value;
    const targetId = filter("id");
    const requireCommission = () => { if (!commission) throw new Error("Only the Electoral Commission can do this."); };

    if (data.table === "election_settings") {
      if (data.action === "select") return { data: data.single ? settings : [settings], error: null };
      requireCommission();
      if (data.action !== "update") throw new Error("Unsupported settings action.");
      const patch = z.object({ voting_open: z.boolean().optional(), applications_open: z.boolean().optional(), results_public: z.boolean().optional(), announcement: z.string().max(2000).nullable().optional(), voting_starts_at: z.string().datetime().nullable().optional(), voting_ends_at: z.string().datetime().nullable().optional() }).parse(data.values);
      return db.from("coordinator_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
    }
    if (data.table === "electoral_votes") {
      if (data.action === "select") {
        const result = await db.from("coordinator_votes").select("position,application_id").eq("voter_id", id);
        return result;
      }
      if (data.action === "delete") { requireCommission(); return db.from("coordinator_votes").delete().not("id", "is", null); }
      if (data.action !== "insert" || role !== "student") throw new Error("Only pupils can cast a ballot.");
      const vote = z.object({ application_id: z.string().uuid(), position: z.string() }).parse(data.values);
      if (!vote.application_id || !vote.position) throw new Error("Choose a candidate and position.");
      return db.from("coordinator_votes").insert({ application_id: vote.application_id, position: vote.position, voter_id: id });
    }
    if (data.table === "electoral_applications") {
      if (data.action === "select") {
        let query = db.from("coordinator_applications").select("*").order("created_at", { ascending: false });
        if (!commission) {
          if (filter("user_id") !== undefined) query = query.eq("user_id", id);
          else query = query.eq("status", "approved");
        }
        if (filter("status") !== undefined) query = query.eq("status", String(filter("status")));
        if (targetId) query = query.eq("id", String(targetId));
        const result = data.single ? await query.maybeSingle() : await query;
        return result;
      }
      if (data.action === "delete") {
        requireCommission();
        const target = z.string().uuid().parse(targetId);
        return db.from("coordinator_applications").delete().eq("id", target);
      }
      let current: { status: string; user_id: string | null } | null = null;
      if (data.action === "update") {
        const target = z.string().uuid().parse(targetId);
        const found = await db.from("coordinator_applications").select("status,user_id").eq("id", target).single();
        current = found.data;
        if (!current) throw new Error("Application not found.");
        if (commission && Object.keys(data.values ?? {}).every(k => ["status", "updated_at"].includes(k))) {
          const status = z.enum(["pending", "approved", "rejected"]).parse(data.values?.status);
          return db.from("coordinator_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", target);
        }
        if (current.user_id !== id) throw new Error("You cannot edit another pupil's application.");
      }
      if (!commission && !canSubmitApplication(role, settings.applications_open, current?.status)) throw new Error("Applications are closed or your application has already been reviewed.");
      const app = applicationSchema.parse(data.values);
      if (!app.student_name || !app.class_name || !app.position) throw new Error("Complete your candidate details.");
      // A pupil cannot use the name selector to impersonate another registered pupil.
      if (!commission && app.student_name.toLowerCase() !== account.name.toLowerCase()) throw new Error("Choose your own registered pupil name.");
      const row = { ...app, student_name: app.student_name, class_name: app.class_name, position: app.position, user_id: commission && data.action === "insert" ? null : id, status: commission && data.action === "insert" ? "approved" : "pending", updated_at: new Date().toISOString() };
      return data.action === "insert" ? db.from("coordinator_applications").insert(row) : db.from("coordinator_applications").update(row).eq("id", String(targetId));
    }
    if (data.table === "user_roles") {
      requireCommission();
      const userId = z.string().uuid().parse(data.values?.user_id ?? filter("user_id"));
      if (userId === id) throw new Error("You cannot change your own Commission access.");
      if (data.action === "insert") return db.from("coordinator_commission_roles").insert({ user_id: userId, granted_by: id });
      if (data.action === "delete") return db.from("coordinator_commission_roles").delete().eq("user_id", userId);
      throw new Error("Unsupported Commission action.");
    }
    throw new Error("Use your portal profile to manage your school account.");
  });

export const electionRpc = createServerFn({ method: "POST" })
  .inputValidator(input => z.object({ name: z.enum(["get_vote_counts", "get_turnout", "has_role", "record_page_view", "record_candidate_view", "admin_list_users"]), args: z.record(z.string(), z.unknown()).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { getPortalSession } = await import("@/lib/auth-session.server");
    const session = await getPortalSession();
    const id = session.data.userId ?? session.data.studentId;
    const role = session.data.role;
    if (!id || !role) throw new Error("Please sign in to your school account.");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const table = role === "admin" ? "admins" : role === "teacher" ? "teachers" : "students";
    const { data: account } = await db.from(table).select("id").eq("id", id).maybeSingle();
    if (!account) throw new Error("Please sign in again.");
    const { data: member } = await db.from("coordinator_commission_roles").select("user_id").eq("user_id", id).maybeSingle();
    const commission = isCommission(role, !!member);
    if (data.name === "has_role") return { data: commission, error: null };
    if (data.name === "record_page_view" || data.name === "record_candidate_view") {
      const candidate = data.name === "record_candidate_view" ? z.string().uuid().parse(data.args?._id) : undefined;
      return db.rpc("coordinator_record_view", candidate ? { _candidate: candidate } : {});
    }
    const { data: settings } = await db.from("coordinator_settings").select("results_public").eq("id", 1).single();
    if (data.name === "get_vote_counts") {
      if (!settings?.results_public && !commission) return { data: [], error: null };
      const result = await db.from("coordinator_votes").select("application_id");
      if (result.error) return result;
      const counts = new Map<string, number>();
      for (const vote of result.data) counts.set(vote.application_id, (counts.get(vote.application_id) ?? 0) + 1);
      return { data: [...counts].map(([application_id, votes]) => ({ application_id, votes })), error: null };
    }
    if (!commission) throw new Error("Only the Electoral Commission can do this.");
    const [{ data: pupils, error }, { data: votes }, { data: members }, { data: admins }] = await Promise.all([
      db.from("students").select("id,name,email,class_id,stream_id,created_at"),
      db.from("coordinator_votes").select("voter_id"),
      db.from("coordinator_commission_roles").select("user_id"),
      db.from("admins").select("id,name,email,created_at"),
    ]);
    if (error) throw new Error(error.message);
    const voted = new Set(votes?.map(v => v.voter_id));
    if (data.name === "get_turnout") return { data: [{ voters: voted.size, ballots: votes?.length ?? 0, accounts: pupils?.length ?? 0 }], error: null };
    const commissionIds = new Set(members?.map(m => m.user_id));
    return { data: [...(pupils ?? []).map(p => ({ id: p.id, email: p.email, full_name: p.name, class_name: p.class_id, stream_name: p.stream_id, created_at: p.created_at, is_admin: commissionIds.has(p.id), has_voted: voted.has(p.id) })), ...(admins ?? []).map(a => ({ id: a.id, email: a.email, full_name: a.name, class_name: null, stream_name: null, created_at: a.created_at, is_admin: true, has_voted: false }))], error: null };
  });