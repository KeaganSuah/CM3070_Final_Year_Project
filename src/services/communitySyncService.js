// Handles optional REST synchronisation for reports, guides and community votes.
import * as Network from 'expo-network';
import { mediaUriToSyncValue } from '../utils/mediaUtils';

const API_URL = (process.env.EXPO_PUBLIC_READIS_API_URL || '').replace(/\/$/, '');
// Checks whether a community API address has been provided for this run.
export const isCommunityApiConfigured = () => Boolean(API_URL);

// Checks network reachability before attempting a community API request.
async function ensureOnline() {
  try {
    const state = await Network.getNetworkStateAsync();
    if (state?.isConnected === false || state?.isInternetReachable === false) throw new Error('OFFLINE');
  } catch (error) {
    if (error?.message === 'OFFLINE') throw error;
  }
}

// Sends a JSON request to the configured community API and validates the response.
async function request(path, options = {}) {
  if (!API_URL) return null;
  await ensureOnline();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`API_${response.status}`);
  return response.json();
}

// Fetches only reports and guides updated after the supplied timestamp.
export async function fetchCommunityUpdates(since = 0) {
  if (!API_URL) return { reports: [], guides: [], serverTime: Date.now() };
  return request(`/updates?since=${encodeURIComponent(since)}`);
}

// Prepares optional report media and sends the report to the community API.
export async function publishReport(report) {
  if (!API_URL) return null;
  const photo = await mediaUriToSyncValue(report.photoUri);
  return request('/reports', { method: 'POST', body: JSON.stringify({ ...report, photoUri: photo || null }) });
}

// Prepares guide image blocks and sends the complete guide to the community API.
export async function publishGuide(guide) {
  if (!API_URL) return null;
  const contentBlocks = await Promise.all((guide.contentBlocks || []).map(async (block) => {
    if (block.type !== 'image') return block;
    const imageUri = await mediaUriToSyncValue(block.imageUri);
    return { ...block, imageUri: imageUri || null };
  }));
  return request('/guides', { method: 'POST', body: JSON.stringify({ ...guide, contentBlocks }) });
}

// Sends a report upvote to the community API.
export async function syncReportUpvote(id) {
  if (!API_URL) return null;
  return request(`/reports/${encodeURIComponent(id)}/upvote`, { method: 'POST', body: '{}' });
}

// Sends a guide upvote to the community API.
export async function syncGuideUpvote(id) {
  if (!API_URL) return null;
  return request(`/guides/${encodeURIComponent(id)}/upvote`, { method: 'POST', body: '{}' });
}
