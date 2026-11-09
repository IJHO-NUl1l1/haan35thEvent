// 응답 저장소.
// SUPABASE_URL 과 SUPABASE_SECRET_KEY 가 있으면 Supabase 에 저장하고, 없으면 MOCK(서버 메모리)으로 동작합니다.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { EVENT } from "@/config/event";
import type { RsvpStats, RsvpStatus } from "./rsvp";

const TABLE = "rsvp_responses";
// 행사 설정(key/value). 지금은 응답 잠금(rsvp_locked) 하나만 씁니다.
const SETTINGS_TABLE = "event_settings";
const LOCKED_KEY = "rsvp_locked";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

// 비밀 키는 서버에서만 씁니다. 브라우저로 나가지 않도록 NEXT_PUBLIC_ 을 붙이지 마세요.
const supabase = url && secretKey ? createClient(url, secretKey, { auth: { persistSession: false } }) : null;

export const STORE_IS_MOCK = !supabase;

// --- MOCK: 서버를 재시작하면 초기화됩니다. ---
const globalForStore = globalThis as unknown as { __rsvpResponses?: Map<string, RsvpStatus>; __rsvpLocked?: boolean };
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
  const [counts, locked] = await Promise.all([getCounts(), getLocked()]);
  return { ...counts, goal: EVENT.goal.value, goalMock: EVENT.goal.mock, mock: STORE_IS_MOCK, locked };
}

// 응답 잠금 여부. 설정 테이블이 아직 없거나 읽기에 실패하면 잠기지 않은 것으로 봐서 집계 화면은 계속 동작합니다.
export async function getLocked() {
  if (supabase) {
    const { data, error } = await supabase.from(SETTINGS_TABLE).select("value").eq("key", LOCKED_KEY).maybeSingle();
    if (error) {
      console.error(`[rsvp-store] ${SETTINGS_TABLE} 읽기 실패:`, error.message);
      return false;
    }
    return data?.value === "true";
  }
  return globalForStore.__rsvpLocked ?? false;
}

export async function setLocked(locked: boolean) {
  if (supabase) {
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({ key: LOCKED_KEY, value: String(locked), updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return;
  }
  globalForStore.__rsvpLocked = locked;
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

// 리모컨으로 직접 넣은 참여자는 voter_id 가 이 접두어로 시작합니다. (실제 응답과 구분)
const MANUAL_PREFIX = "mock-";

// 리모컨으로 직접 넣는 참여자. 여러 명도 DB 요청 한 번으로 넣습니다.
export async function addMockAttendees(count: number) {
  const ids = Array.from({ length: count }, () => `${MANUAL_PREFIX}${crypto.randomUUID()}`);
  if (supabase) {
    const { error } = await supabase.from(TABLE).insert(ids.map((voter_id) => ({ voter_id, status: "attend" })));
    if (error) throw error;
    return;
  }
  ids.forEach((id) => mockResponses.set(id, "attend"));
}

// 직접 넣은 참여자 수 (리모컨에서 뺄 수 있는 최대 인원)
export async function countManualAttendees() {
  if (supabase) {
    const { count, error } = await supabase
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .like("voter_id", `${MANUAL_PREFIX}%`);
    if (error) throw error;
    return count ?? 0;
  }
  return [...mockResponses.keys()].filter((id) => id.startsWith(MANUAL_PREFIX)).length;
}

// 직접 넣은 참여자만 최근 것부터 count 명 뺍니다. 시민이 직접 한 응답은 건드리지 않습니다.
// count 를 생략하면 직접 넣은 참여자를 모두 뺍니다.
export async function removeManualAttendees(count?: number) {
  if (supabase) {
    if (count === undefined) {
      const { error } = await supabase.from(TABLE).delete().like("voter_id", `${MANUAL_PREFIX}%`);
      if (error) throw error;
      return;
    }
    const { data, error } = await supabase
      .from(TABLE)
      .select("voter_id")
      .like("voter_id", `${MANUAL_PREFIX}%`)
      .order("created_at", { ascending: false })
      .limit(count);
    if (error) throw error;
    const ids = data.map((row) => row.voter_id as string);
    // 주소 길이 제한을 넘지 않도록 100개씩 나눠 지웁니다.
    for (let i = 0; i < ids.length; i += 100) {
      const { error: deleteError } = await supabase.from(TABLE).delete().in("voter_id", ids.slice(i, i + 100));
      if (deleteError) throw deleteError;
    }
    return;
  }
  const ids = [...mockResponses.keys()].filter((id) => id.startsWith(MANUAL_PREFIX)).reverse();
  ids.slice(0, count ?? ids.length).forEach((id) => mockResponses.delete(id));
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
