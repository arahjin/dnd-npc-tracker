"use client";

import Script from "next/script";

export default function KofiButton() {
  return (
    <Script
      src="https://storage.ko-fi.com/cdn/widget/Widget_2.js"
      strategy="afterInteractive"
      onLoad={() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        w.kofiwidget2.init("Support me on Ko-fi", "#A32020", "N4N81Z9FQ0");
        w.kofiwidget2.draw();
      }}
    />
  );
}
