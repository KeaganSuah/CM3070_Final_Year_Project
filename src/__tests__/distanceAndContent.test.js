// Tests nearby-distance logic and migration of mixed guide content.
import { haversineDistanceKm, isWithinRadiusKm } from '../utils/distanceUtils';
import { normalizeContentBlocks, sanitizeGuides } from '../utils/guideStorage';

// Checks that nearby incident distance calculations behave predictably.
describe('nearby incident distance', () => {
  test('same coordinate is zero kilometres', () => {
    expect(haversineDistanceKm({ latitude: 1.35, longitude: 103.82 }, { latitude: 1.35, longitude: 103.82 })).toBeCloseTo(0, 6);
  });
  test('nearby threshold works', () => {
    const a = { latitude: 1.3521, longitude: 103.8198 };
    const b = { latitude: 1.3600, longitude: 103.8200 };
    expect(isWithinRadiusKm(a, b, 1)).toBe(true);
    expect(isWithinRadiusKm(a, b, 0.2)).toBe(false);
  });
});

// Checks that older guide content migrates safely and promotion still starts at 150 votes.
describe('guide content migration', () => {
  test('legacy guide body becomes a text block', () => {
    expect(normalizeContentBlocks({ body: 'Legacy guide text' })[0]).toMatchObject({ type: 'text', text: 'Legacy guide text' });
  });
  test('community guide still requires 150 votes for promotion', () => {
    expect(sanitizeGuides([{ id: 'community-x', votes: 149, body: 'x' }])[0].category).toBe('community');
    expect(sanitizeGuides([{ id: 'community-x', votes: 150, body: 'x' }])[0].category).toBe('team');
  });
});
