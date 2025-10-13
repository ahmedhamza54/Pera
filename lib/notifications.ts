export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showLocalNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
