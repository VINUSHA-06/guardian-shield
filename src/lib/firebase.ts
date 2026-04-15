const FIREBASE_DB_URL = 'https://url-suspicious-checker-default-rtdb.firebaseio.com';

export interface FirebaseURLCheck {
  url: string;
  risk_score: number;
  status: 'SAFE' | 'SUSPICIOUS';
  timestamp: number;
}

export async function pushToFirebase(data: FirebaseURLCheck): Promise<void> {
  const res = await fetch(`${FIREBASE_DB_URL}/url_checks.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save to Firebase');
}

export async function fetchFromFirebase(): Promise<(FirebaseURLCheck & { firebaseKey: string })[]> {
  const res = await fetch(`${FIREBASE_DB_URL}/url_checks.json`);
  if (!res.ok) throw new Error('Failed to fetch from Firebase');
  const data = await res.json();
  if (!data) return [];
  return Object.entries(data).map(([key, val]) => ({
    ...(val as FirebaseURLCheck),
    firebaseKey: key,
  })).sort((a, b) => b.timestamp - a.timestamp);
}
