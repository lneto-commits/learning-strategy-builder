const KEY = 'lsb_session_id';

export const getSessionId = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setSessionId = (id: string): void => {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // ignore — Safari private mode etc.
  }
};
