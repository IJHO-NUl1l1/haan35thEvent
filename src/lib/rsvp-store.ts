// 응답 저장소.
// SUPABASE_URL 과 SUPABASE_SECRET_KEY 가 있으면 Supabase 에 저장하고, 없으면 MOCK(서버 메모리)으로 동작합니다.
// 테이블 생성 SQL 은 supabase/schema.sql 에 있습니다.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { EVENT } from "@/config/event";
import type { RsvpStats, RsvpStatus } from "./rsvp";

const TABLE = "rsvp_responses";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

// 비밀 키는 서버에서만 씁니다. 브라우저로 나가지 않도록 NEXT_PUBLIC_ 을 붙이지 마세요.
const supabase = url && secretKey ? createClient(url, secretKey, { auth: { persistSession: false } }) : null;

export const STORE_IS_MOCK = !supabase;

// --- MOCK: 서버를 재시작하면 초기화됩니다. ---
const globalForStore = globalThis as unknown as { __rsvpResponses?: Map<string, RsvpStatus> };
// 개발 중 HMR 로 모듈이 다시 로드돼도 데이터가 유지되도록 globalThis 에 둡니다.
const mockResponses = (globalForStore.__rsvpResponses ??= new Map());

async function countStatus(status: RsvpStatus) {
  const { count, error } = await supabase!.from(TABLE).select("*", { count: "exact", head: true }).eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

export async function getCounts() {
  if (supabase) {
    const [attend, decline] = await Promise.all([countStatus("attend"), countStatus("decline")]);
    return { attend, decline };
  }

  let attend = 0;
  let decline = 0;
  for (const status of mockResponses.values()) {
    if (status === "attend") attend++;
    else decline++;
  }
  return { attend, decline };
}

export async function getStats(): Promise<RsvpStats> {
  const counts = await getCounts();
  return { ...counts, goal: EVENT.goal.value, goalMock: EVENT.goal.mock, mock: STORE_IS_MOCK };
}

export async function getResponse(voterId: string): Promise<RsvpStatus | null> {
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).select("status").eq("voter_id", voterId).maybeSingle();
    if (error) throw error;
    return data?.status ?? null;
  }
  return mockResponses.get(voterId) ?? null;
}

// 같은 브라우저(voterId)가 다시 응답하면 덮어씁니다. 중복 집계 방지.
export async function saveResponse(voterId: string, status: RsvpStatus) {
  if (supabase) {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ voter_id: voterId, status, updated_at: new Date().toISOString() }, { onConflict: "voter_id" });
    if (error) throw error;
    return;
  }
  mockResponses.set(voterId, status);
}

export async function clearResponses() {
  if (supabase) {
    // delete 는 조건이 필요해서 모든 행에 맞는 조건을 둡니다.
    const { error } = await supabase.from(TABLE).delete().neq("voter_id", "");
    if (error) throw error;
    return;
  }
  mockResponses.clear();
}
