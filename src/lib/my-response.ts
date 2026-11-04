// 이 기기에서 응답했는지 기억합니다(localStorage). 다시 들어와도 결과 화면을 보여주기 위함.
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
    // 사생활 보호 모드 등에서 저장이 막혀도 화면은 동작해야 합니다.
  }
  listeners.forEach((listener) => listener());
}

// crypto.randomUUID 는 http(내부망 IP 접속)에서 동작하지 않아 직접 만듭니다.
function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVoterId() {
  try {
    let id = localStorage.getItem(VOTER_ID_KEY);
    if (!id) {
      id = createId();
      localStorage.setItem(VOTER_ID_KEY, id);
    }
    return id;
  } catch {
    return createId();
  }
}
