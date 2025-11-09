"use client";
import { useEffect, useState } from "react";

export default function OfflinePopup() {
  // Start with a stable default so server and client HTML match.
  // We detect real online status on mount.
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // initialize based on actual browser status
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-fade-in"
      style={{ animation: "fadeIn 0.3s ease-in-out" }}
    >
      ⚠️ You’re offline — showing saved content
    </div>
  );
}
