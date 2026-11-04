import { redirect } from "next/navigation";

// QR 에 들어가는 고정 주소. 목적지를 바꾸려면 여기만 고치면 되고, QR 은 다시 인쇄하지 않아도 됩니다.
export default function Go() {
  redirect("/join");
}
