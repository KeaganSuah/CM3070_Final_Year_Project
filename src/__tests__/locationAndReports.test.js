// Tests location migration, fallback coordinates and report filtering.
import { getClosestArea, getFallbackCoordinates, normalizeArea, normalizeReports } from '../utils/locationUtils';
import { filterReports } from '../utils/reportUtils';

// Checks older location data, fallback coordinates, report filters and search.
describe('location migration and filtering', () => {
  test('legacy Tampines maps to East', () => expect(normalizeArea('Tampines')).toBe('East'));
  test('Woodlands maps to North', () => expect(normalizeArea('Woodlands')).toBe('North'));
  test('closest area to Central coordinates is Central', () => expect(getClosestArea(1.3048, 103.8318)).toBe('Central'));
  test('fallback coordinates are deterministic', () => expect(getFallbackCoordinates('East', 'same-id')).toEqual(getFallbackCoordinates('East', 'same-id')));
  test('legacy report gains valid coordinates', () => {
    const [report] = normalizeReports([{ id: 'old', area: 'Tampines', location: 'Tampines Ave 5' }]);
    expect(report.area).toBe('East');
    expect(Number.isFinite(report.latitude)).toBe(true);
    expect(Number.isFinite(report.longitude)).toBe(true);
  });
  test('filter supports disaster type and area', () => {
    const reports = [
      { id: '1', area: 'East', type: 'Flood', location: 'Tampines', description: 'Water', createdAt: 2 },
      { id: '2', area: 'West', type: 'Fire', location: 'Jurong', description: 'Smoke', createdAt: 1 }
    ];
    expect(filterReports({ reports, selectedArea: 'East', selectedType: 'Flood', searchText: '' }).map((r) => r.id)).toEqual(['1']);
  });
  test('search matches location text', () => {
    const reports = [{ id: '1', area: 'East', type: 'Flood', location: 'Tampines', description: 'Water', createdAt: 1 }];
    expect(filterReports({ reports, selectedArea: 'All', selectedType: 'All', searchText: 'tampines' })).toHaveLength(1);
  });
});
