// Normalises guide content and applies the community promotion rule.
// Identifies the built-in guides that always remain trusted Team Guides.
const TEAM_GUIDE_IDS = new Set(['tg-1', 'tg-2', 'tg-3']);
// Requires 150 community votes before a guide becomes community-approved.
const COMMUNITY_PROMOTION_THRESHOLD = 150;
// Returns the number of community votes needed for promotion.
export const getGuidePromotionThreshold = () => COMMUNITY_PROMOTION_THRESHOLD;

// Converts old and new guide content into one consistent ordered block format.
export function normalizeContentBlocks(guide = {}) {
  if (Array.isArray(guide.contentBlocks) && guide.contentBlocks.length) {
    return guide.contentBlocks
      .filter((b) => b && (b.type === 'text' || b.type === 'image'))
      .map((b, i) => ({ id: b.id || `block-${i}`, type: b.type, text: b.text || '', imageUri: b.imageUri || null, caption: b.caption || '' }));
  }
  return [{ id: 'legacy-body', type: 'text', text: guide.body || '', imageUri: null, caption: '' }];
}

// Combines all text blocks into plain text for summaries and word estimates.
export function guidePlainText(guide = {}) {
  return normalizeContentBlocks(guide).filter((b) => b.type === 'text').map((b) => b.text).join('\n\n').trim();
}

// Normalises guide content and promotes community guides only at 150 votes or more.
export const sanitizeGuides = (guides = []) => guides.map((guide) => {
  const votes = Number(guide.votes || 0);
  const isBuiltInTeamGuide = TEAM_GUIDE_IDS.has(guide.id);
  const shouldPromoteCommunity = !isBuiltInTeamGuide && votes >= COMMUNITY_PROMOTION_THRESHOLD;
  const contentBlocks = normalizeContentBlocks(guide);
  return {
    ...guide,
    body: guide.body || contentBlocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n\n'),
    contentBlocks,
    category: isBuiltInTeamGuide || shouldPromoteCommunity ? 'team' : 'community',
    promotedFromCommunity: shouldPromoteCommunity || Boolean(guide.promotedFromCommunity),
  };
});
