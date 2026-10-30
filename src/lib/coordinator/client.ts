import { electionRequest, electionRpc } from "./api.functions";
import { getPupilSession } from "@/lib/auth.functions";

type Reply = { data: any; error: { message: string; code?: string } | null };
/** Imported UI adapter: every request is authorized against the encrypted portal session on the server. */
class ElectionQuery implements PromiseLike<Reply> {
  private action: "select" | "insert" | "update" | "delete" = "select";
  private values?: Record<string, unknown>;
  private filters: { key: string; value: unknown }[] = [];
  private one = false;
  constructor(private table: "electoral_applications" | "electoral_votes" | "election_settings" | "user_roles" | "profiles") {}
  select(_columns = "*") { return this; }
  insert(values: Record<string, unknown>) { this.action = "insert"; this.values = values; return this; }
  update(values: Record<string, unknown>) { this.action = "update"; this.values = values; return this; }
  delete() { this.action = "delete"; return this; }
  eq(key: string, value: unknown) { this.filters.push({ key, value }); return this; }
  not(_key: string, _op: string, _value: unknown) { return this; }
  order(_key: string, _options?: unknown) { return this; }
  maybeSingle() { this.one = true; return this; }
  single() { this.one = true; return this; }
  then<TResult1 = Reply, TResult2 = never>(onfulfilled?: ((value: Reply) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> {
    return electionRequest({ data: { table: this.table, action: this.action, values: this.values, filters: this.filters, single: this.one } })
      .then(result => ({ data: result.data, error: result.error ? { message: result.error.message, code: result.error.code } : null }) as Reply)
      .catch(error => ({ data: null, error: { message: error instanceof Error ? error.message : "Could not complete this action." } }))
      .then(onfulfilled, onrejected);
  }
}
export const supabase = {
  from: (table: ConstructorParameters<typeof ElectionQuery>[0]) => new ElectionQuery(table),
  async rpc(name: "get_vote_counts" | "get_turnout" | "has_role" | "record_page_view" | "record_candidate_view" | "admin_list_users", args?: Record<string, unknown>): Promise<Reply> {
    try { const result = await electionRpc({ data: { name, args } }); return { data: result.data, error: result.error ? { message: result.error.message } : null }; }
    catch (error) { return { data: null, error: { message: error instanceof Error ? error.message : "Election request failed." } }; }
  },
  auth: { async getUser() { const user = await getPupilSession(); return { data: { user }, error: null }; } },
};