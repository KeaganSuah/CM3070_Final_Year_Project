// Tests guide quiz scoring, promotion rules and the readiness calculation.
import {
  calculateQuizPoints,
  calculateReadinessBreakdown,
  getProfileTier,
} from "../utils/guideUtils";
import {
  sanitizeGuides,
  getGuidePromotionThreshold,
} from "../utils/guideStorage";

// Checks guide points, promotion rules, readiness weights and tier boundaries.
describe("guide scoring and promotion", () => {
  const team = { id: "tg-1", category: "team", type: "Flood" };
  const community = { id: "cg-x", category: "community", type: "Storm" };

  test("team guide full score earns 60 points", () =>
    expect(calculateQuizPoints(team, 2, 2)).toBe(60));
  test("team guide half score earns 30 points", () =>
    expect(calculateQuizPoints(team, 1, 2)).toBe(30));
  test("community guide full score earns 35 points", () =>
    expect(calculateQuizPoints(community, 2, 2)).toBe(35));
  test("zero-question quiz earns no points", () =>
    expect(calculateQuizPoints(team, 0, 0)).toBe(0));
  test("promotion threshold is 150", () =>
    expect(getGuidePromotionThreshold()).toBe(150));
  test("community guide at 149 stays community", () =>
    expect(sanitizeGuides([{ ...community, votes: 149 }])[0].category).toBe(
      "community",
    ));
  test("community guide at 150 becomes team-visible", () =>
    expect(sanitizeGuides([{ ...community, votes: 150 }])[0].category).toBe(
      "team",
    ));
  test("promoted community origin is retained", () =>
    expect(
      sanitizeGuides([{ ...community, votes: 150 }])[0].promotedFromCommunity,
    ).toBe(true));
  test("built-in team guide stays team even with zero votes", () =>
    expect(sanitizeGuides([{ ...team, votes: 0 }])[0].category).toBe("team"));

  test("readiness is zero with no progress", () => {
    const result = calculateReadinessBreakdown({}, [team, community]);
    expect(result.readinessScore).toBe(0);
  });

  test("readiness weights team, community, coverage and points", () => {
    const progress = {
      "tg-1": { score: 2, totalQuestions: 2, pointsEarned: 60 },
      "cg-x": { score: 2, totalQuestions: 2, pointsEarned: 35 },
    };
    const result = calculateReadinessBreakdown(progress, [team, community]);
    expect(result.teamMastery).toBe(100);
    expect(result.communityLearning).toBe(100);
    expect(result.coverage).toBe(100);
    expect(result.readinessPoints).toBe(95);
    expect(result.readinessScore).toBe(91);
  });

  test("tier boundaries are stable", () => {
    expect(getProfileTier(24)).toBe("Getting Started");
    expect(getProfileTier(25)).toBe("Aware");
    expect(getProfileTier(50)).toBe("Prepared");
    expect(getProfileTier(75)).toBe("Response Ready");
    expect(getProfileTier(90)).toBe("Community Ready");
  });
});
