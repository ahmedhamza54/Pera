"use client";

import { useEffect } from "react";

export function DynamicThemeMeta({ dark }: { dark: boolean }) {
  useEffect(() => {
    // Android PWA status bar
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute("content", dark ? "#000000" : "#ffffff");

    // iOS status bar
    let iosMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!iosMeta) {
      iosMeta = document.createElement("meta");
      iosMeta.name = "apple-mobile-web-app-status-bar-style";
      document.head.appendChild(iosMeta);
    }
    iosMeta.setAttribute("content", dark ? "black-translucent" : "default");

    // Optional: smooth fade effect
    document.documentElement.style.transition = "background-color 0.3s ease";
    document.documentElement.style.backgroundColor = dark ? "#000000" : "#ffffff";
  }, [dark]);

  return null;
}
