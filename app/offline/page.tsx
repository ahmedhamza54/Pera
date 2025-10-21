export default function OfflinePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold">You’re offline</h1>
      <p className="text-gray-500 mt-2">
        Please reconnect to continue using the app.
      </p>
    </main>
  );
}
