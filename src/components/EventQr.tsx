"use client";

import { QRCodeSVG } from "qrcode.react";
import { useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};

// QR 에는 /go 주소가 들어갑니다. 실제 목적지는 app/go/page.tsx 에서 정해요.
// 배포 후에는 NEXT_PUBLIC_SITE_URL 을 실제 도메인으로 지정하세요. 없으면 현재 접속 주소를 씁니다.
export function EventQr({ path = "/go" }: { path?: string }) {
  const origin = useSyncExternalStore(
    subscribeNothing,
    () => process.env.NEXT_PUBLIC_SITE_URL || window.location.origin,
    () => null,
  );

  if (!origin) return <div className="aspect-square w-full rounded-lg bg-slate-100" />;

  const url = new URL(path, origin).toString();
  return (
    <div>
      <QRCodeSVG value={url} size={512} level="M" marginSize={0} fgColor="#0d2a52" className="h-auto w-full" title={url} />
      <p className="mt-4 break-all text-center text-xs text-slate-500">{url}</p>
    </div>
  );
}
