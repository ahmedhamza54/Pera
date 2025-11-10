const LOCAL_TASKS_KEY = 'offline_tasks';

function saveTasksToCache(tasks) {
  localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
}

function getTasksFromCache() {
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
