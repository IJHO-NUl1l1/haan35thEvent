// 이 브라우저의 응답을 localStorage 에도 기억합니다.
// 서버 쿠키(voter-cookie.ts)와 서로 백업 관계라, 둘 중 하나만 남아 있어도 복구됩니다.
// 화면을 즉시 그리는 캐시 역할도 합니다. 최종 판단은 서버(/api/rsvp/me)가 합니다.
import { isRsvpStatus, type RsvpStatus } from "./rsvp";

const VOTER_ID_KEY = "haan35.voterId";
const STATUS_KEY = "haan35.status";

const listeners = new Set<() => void>();

export function subscribeMyStatus(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMyStatus(): RsvpStatus | null {
  try {
    const value = localStorage.getItem(STATUS_KEY);
    return isRsvpStatus(value) ? value : null;
  } catch {
    return null;
  }
}

export function setMyStatus(status: RsvpStatus | null) {
  try {
    if (status) localStorage.setItem(STATUS_KEY, status);
    else localStorage.removeItem(STATUS_KEY);
  } catch {
    // 사생활 보호 모드 등에서 저장이 막혀도 화면은 동작해야 합니다. (서버 쿠키가 대신 기억)
  }
  listeners.forEach((listener) => listener());
}

export function getLocalVoterId() {
  try {
    return localStorage.getItem(VOTER_ID_KEY);
  } catch {
    return null;
  }
}

export function setLocalVoterId(voterId: string) {
  try {
    localStorage.setItem(VOTER_ID_KEY, voterId);
  } catch {
    // 위와 동일
  }
}
