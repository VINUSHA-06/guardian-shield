// ====== URL ANALYSIS ENGINE ======

export interface AnalysisResult {
  url: string;
  timestamp: string;
  id: string;
  features: URLFeatures;
  prediction: 'Benign' | 'Phishing' | 'Defacement';
  probability: number;
  riskScore: number;
  psychologyTactics: string[];
  trustLevel: 'HIGH' | 'LOW';
  redirectIntent: 'NORMAL' | 'SUSPICIOUS';
  contentMismatch: 'LOW' | 'HIGH';
  attackComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  attackStory: string;
  isReachable: boolean;
}

export interface URLFeatures {
  length: number;
  dots: number;
  hyphens: number;
  specialChars: number;
  hasHttps: boolean;
  entropy: number;
  hasIP: boolean;
  suspiciousKeywords: string[];
  subdomainCount: number;
  pathDepth: number;
  hasPort: boolean;
  tldSuspicious: boolean;
}

const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'update', 'secure', 'account', 'bank', 'password', 'confirm', 'signin', 'wallet', 'paypal', 'alert', 'suspended', 'urgent', 'free', 'winner', 'prize', 'click', 'expire'];
const PSYCHOLOGY_KEYWORDS = { fear: ['suspended', 'blocked', 'unauthorized', 'alert', 'warning', 'risk'], urgency: ['urgent', 'immediately', 'expire', 'now', 'hurry', 'limited', 'fast', 'today'], authority: ['official', 'admin', 'support', 'service', 'team', 'security', 'department'], reward: ['free', 'winner', 'prize', 'bonus', 'gift', 'reward', 'congratulations', 'offer'] };
const LEGIT_TLDS = ['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'dev', 'app', 'me', 'info'];
const KNOWN_SAFE_DOMAINS = ['google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com', 'github.com', 'youtube.com', 'wikipedia.org', 'twitter.com', 'linkedin.com', 'netflix.com', 'reddit.com', 'stackoverflow.com', 'instagram.com', 'whatsapp.com'];
const BRAND_NAMES = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'paypal', 'netflix', 'instagram', 'twitter', 'linkedin', 'bank', 'chase', 'wells', 'citi', 'hsbc'];

function calcEntropy(str: string): number {
  const freq: Record<string, number> = {};
  for (const c of str) freq[c] = (freq[c] || 0) + 1;
  const len = str.length;
  return -Object.values(freq).reduce((s, f) => s + (f / len) * Math.log2(f / len), 0);
}

function extractFeatures(url: string): URLFeatures {
  const lower = url.toLowerCase();
  let hostname = '';
  try { hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { hostname = lower; }
  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];
  const path = lower.split('/').slice(3);

  return {
    length: url.length,
    dots: (lower.match(/\./g) || []).length,
    hyphens: (lower.match(/-/g) || []).length,
    specialChars: (lower.match(/[^a-z0-9.\-/:]/g) || []).length,
    hasHttps: lower.startsWith('https'),
    entropy: calcEntropy(hostname),
    hasIP: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname),
    suspiciousKeywords: SUSPICIOUS_KEYWORDS.filter(k => lower.includes(k)),
    subdomainCount: Math.max(0, parts.length - 2),
    pathDepth: path.length,
    hasPort: /:\d{2,5}/.test(lower.replace(/^https?:\/\//, '').split('/')[0]),
    tldSuspicious: !LEGIT_TLDS.includes(tld),
  };
}

function detectPsychology(url: string): string[] {
  const lower = url.toLowerCase();
  const tactics: string[] = [];
  for (const [tactic, keywords] of Object.entries(PSYCHOLOGY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) tactics.push(tactic);
  }
  return tactics;
}

function checkTrust(url: string, features: URLFeatures): 'HIGH' | 'LOW' {
  const lower = url.toLowerCase();
  let hostname = '';
  try { hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { return 'LOW'; }

  if (KNOWN_SAFE_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) return 'HIGH';

  const brandMentioned = BRAND_NAMES.some(b => lower.includes(b));
  const matchesBrand = KNOWN_SAFE_DOMAINS.some(d => hostname.includes(d.split('.')[0]));
  if (brandMentioned && !matchesBrand) return 'LOW';
  if (features.hasIP) return 'LOW';
  if (features.subdomainCount > 2) return 'LOW';
  if (features.tldSuspicious) return 'LOW';

  return 'HIGH';
}

function checkRedirect(url: string, features: URLFeatures): 'NORMAL' | 'SUSPICIOUS' {
  const lower = url.toLowerCase();
  if (lower.includes('redirect') || lower.includes('redir') || lower.includes('goto') || lower.includes('url=') || lower.includes('link=') || lower.includes('next=')) return 'SUSPICIOUS';
  if (features.pathDepth > 4) return 'SUSPICIOUS';
  return 'NORMAL';
}

function checkMismatch(url: string, features: URLFeatures): 'LOW' | 'HIGH' {
  const lower = url.toLowerCase();
  const brandMentioned = BRAND_NAMES.some(b => lower.includes(b));
  let hostname = '';
  try { hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { return 'HIGH'; }
  const matchesBrand = KNOWN_SAFE_DOMAINS.some(d => hostname.includes(d.split('.')[0]));
  if (brandMentioned && !matchesBrand) return 'HIGH';
  if (features.hasIP && brandMentioned) return 'HIGH';
  return 'LOW';
}

function checkComplexity(features: URLFeatures): 'LOW' | 'MEDIUM' | 'HIGH' {
  let score = 0;
  if (features.entropy > 3.5) score++;
  if (features.entropy > 4.2) score++;
  if (features.specialChars > 3) score++;
  if (features.length > 80) score++;
  if (features.pathDepth > 3) score++;
  if (features.hasIP) score++;
  if (score >= 4) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function isLikelyNonExistent(url: string, features: URLFeatures): boolean {
  let hostname = '';
  try { hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { return true; }

  if (KNOWN_SAFE_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) return false;

  // Random-looking domains
  const domainBody = hostname.split('.').slice(0, -1).join('.');
  if (domainBody.length > 15 && calcEntropy(domainBody) > 3.8) return true;
  if (features.tldSuspicious && features.suspiciousKeywords.length === 0 && domainBody.length < 6) return true;

  return false;
}

function computeRiskScore(features: URLFeatures, psychology: string[], trust: 'HIGH' | 'LOW', redirect: 'NORMAL' | 'SUSPICIOUS', mismatch: 'LOW' | 'HIGH', isNonExistent: boolean): number {
  // Base score from URL characteristics
  let score = 10;

  // Non-existent/unknown domain → high base risk
  if (isNonExistent) score += 40;

  // Feature-based scoring
  if (features.length > 75) score += 8;
  if (features.length > 120) score += 7;
  if (features.entropy > 3.5) score += 8;
  if (features.entropy > 4.2) score += 7;
  if (!features.hasHttps) score += 10;
  if (features.hasIP) score += 20;
  if (features.dots > 4) score += 8;
  if (features.hyphens > 2) score += 6;
  if (features.specialChars > 2) score += 8;
  if (features.subdomainCount > 2) score += 10;
  if (features.hasPort) score += 10;
  if (features.tldSuspicious) score += 12;
  if (features.pathDepth > 3) score += 5;

  // Suspicious keywords: +5 each
  score += features.suspiciousKeywords.length * 5;

  // Psychology triggers: +10 each
  score += psychology.length * 10;

  // Trust
  if (trust === 'LOW') score += 15;

  // Redirect
  if (redirect === 'SUSPICIOUS') score += 15;

  // Mismatch
  if (mismatch === 'HIGH') score += 12;

  // CRITICAL BOOST: Psychology + suspicious keywords both present
  if (psychology.length > 0 && features.suspiciousKeywords.length > 0) score += 20;

  // EXTRA BOOST: "bank" + "login"
  const lower = features.suspiciousKeywords.map(k => k.toLowerCase());
  if (lower.includes('bank') && lower.includes('login')) score += 15;

  // Known safe domain → drop to safe
  return Math.min(100, Math.max(0, score));
}

function generateStory(result: Omit<AnalysisResult, 'attackStory'>): string {
  const parts: string[] = [];

  if (!result.isReachable) {
    parts.push(`This URL (${result.url}) points to an unknown or non-existent domain, making it inherently suspicious.`);
  }

  if (result.prediction === 'Phishing') {
    parts.push('This URL exhibits characteristics consistent with phishing attacks.');
  } else if (result.prediction === 'Defacement') {
    parts.push('This URL shows signs of potential web defacement or hijacking.');
  }

  if (result.psychologyTactics.length > 0) {
    parts.push(`It employs psychological manipulation tactics: ${result.psychologyTactics.join(', ')}.`);
  }
  if (result.features.suspiciousKeywords.length > 0) {
    parts.push(`Contains suspicious keywords: ${result.features.suspiciousKeywords.join(', ')}.`);
  }
  if (result.trustLevel === 'LOW') parts.push('The domain trust level is LOW — it may be impersonating a legitimate brand.');
  if (result.redirectIntent === 'SUSPICIOUS') parts.push('Suspicious redirect patterns detected in the URL structure.');
  if (result.contentMismatch === 'HIGH') parts.push('Content-URL mismatch detected — the URL references a brand it does not belong to.');
  if (result.features.hasIP) parts.push('Uses a raw IP address instead of a domain name, a common phishing indicator.');

  if (parts.length === 0) parts.push('This URL appears to be safe based on the analysis criteria.');

  return parts.join(' ');
}

export function analyzeURL(url: string): AnalysisResult {
  const features = extractFeatures(url);
  const psychology = detectPsychology(url);
  const trust = checkTrust(url, features);
  const redirect = checkRedirect(url, features);
  const mismatch = checkMismatch(url, features);
  const complexity = checkComplexity(features);
  const nonExistent = isLikelyNonExistent(url, features);

  const riskScore = computeRiskScore(features, psychology, trust, redirect, mismatch, nonExistent);

  const prediction: 'Benign' | 'Phishing' | 'Defacement' =
    riskScore >= 60 ? 'Phishing' : riskScore >= 40 ? 'Defacement' : 'Benign';

  const partial = {
    url,
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID(),
    features,
    prediction,
    probability: riskScore / 100,
    riskScore,
    psychologyTactics: psychology,
    trustLevel: trust,
    redirectIntent: redirect,
    contentMismatch: mismatch,
    attackComplexity: complexity,
    isReachable: !nonExistent,
  };

  return { ...partial, attackStory: generateStory(partial) };
}

// Pattern detection
export function detectPatterns(results: AnalysisResult[]): { campaign: boolean; commonKeywords: string[]; urls: string[]; message: string } {
  if (results.length < 2) return { campaign: false, commonKeywords: [], urls: [], message: 'Not enough data for pattern detection.' };

  const phishingResults = results.filter(r => r.riskScore >= 50);
  if (phishingResults.length < 2) return { campaign: false, commonKeywords: [], urls: [], message: 'No suspicious patterns found yet.' };

  // Find common keywords
  const allKeywords = phishingResults.flatMap(r => r.features.suspiciousKeywords);
  const freq: Record<string, number> = {};
  allKeywords.forEach(k => { freq[k] = (freq[k] || 0) + 1; });
  const commonKeywords = Object.entries(freq).filter(([, c]) => c >= 2).map(([k]) => k);

  // Find similar structures
  const commonTactics = phishingResults.filter(r => r.psychologyTactics.length > 0);

  if (commonKeywords.length > 0 || commonTactics.length >= 2) {
    return {
      campaign: true,
      commonKeywords,
      urls: phishingResults.map(r => r.url),
      message: `⚠️ Possible Phishing Campaign Detected — ${phishingResults.length} URLs share similar attack patterns.`,
    };
  }

  return { campaign: false, commonKeywords: [], urls: [], message: 'No campaign patterns detected.' };
}

// URL evolution
export function detectEvolutions(results: AnalysisResult[]): { pairs: [string, string, number][] } {
  const pairs: [string, string, number][] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const sim = similarity(results[i].url, results[j].url);
      if (sim > 0.5 && sim < 1) pairs.push([results[i].url, results[j].url, sim]);
    }
  }
  return { pairs: pairs.sort((a, b) => b[2] - a[2]).slice(0, 10) };
}

function similarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(''));
  const setB = new Set(b.toLowerCase().split(''));
  const intersection = [...setA].filter(c => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// Storage
const STORAGE_KEY = 'url_threat_history';
export function getHistory(): AnalysisResult[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
export function saveToHistory(result: AnalysisResult) {
  const history = getHistory();
  history.unshift(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 500)));
}
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
export function getAlerts(): AnalysisResult[] {
  return getHistory().filter(r => r.riskScore > 70);
}
