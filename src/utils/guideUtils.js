// Calculates guide colours, quiz points, readiness scores and profile tiers.
// Returns the colour and icon used for each guide disaster type.
export const getGuideTypeColor = (type) => {
  switch (type) {
    case "Flood":
      return { bg: "#EAF1FF", fg: "#1554D1", icon: "water-outline" };
    case "Fire":
      return { bg: "#FFF1E6", fg: "#FF6A00", icon: "flame-outline" };
    case "Storm":
      return { bg: "#EAF1FF", fg: "#1554D1", icon: "thunderstorm-outline" };
    case "Power Outage":
      return { bg: "#FFF1E6", fg: "#FF6A00", icon: "flash-outline" };
    default:
      return { bg: "#EAF1FF", fg: "#1554D1", icon: "book-outline" };
  }
};

// Converts a quiz mark into readiness points using the guide category limit.
export const calculateQuizPoints = (guide, score, totalQuestions) => {
  const ratio = totalQuestions === 0 ? 0 : score / totalQuestions;
  const maxPoints = guide.category === "team" ? 60 : 35;
  return Math.round(ratio * maxPoints);
};

// Calculates the weighted readiness score and each visible score component.
export const calculateReadinessBreakdown = (progress = {}, guides = []) => {
  const teamGuides = guides.filter((g) => g.category === "team");
  const communityGuides = guides.filter((g) => g.category === "community");

  // Calculates average quiz mastery for the supplied set of guides.
  const masteryAverage = (items) => {
    if (!items.length) return 0;
    const total = items.reduce((sum, guide) => {
      const item = progress[guide.id];
      if (!item) return sum;
      return sum + (item.score || 0) / Math.max(item.totalQuestions || 1, 1);
    }, 0);
    return total / items.length;
  };

  const teamMastery = masteryAverage(teamGuides);
  const communityLearning = masteryAverage(communityGuides);

  const allTypes = [...new Set(guides.map((guide) => guide.type || "General"))];
  const coveredTypes = new Set(
    guides
      .filter((guide) => {
        const item = progress[guide.id];
        return item && (item.score || 0) > 0;
      })
      .map((guide) => guide.type || "General"),
  );
  const coverage = allTypes.length ? coveredTypes.size / allTypes.length : 0;

  const totalPoints = Object.values(progress).reduce(
    (sum, item) => sum + (item.pointsEarned || 0),
    0,
  );
  const pointsMomentum = Math.min(1, totalPoints / 240);

  const readinessScore = Math.round(
    (teamMastery * 0.45 +
      communityLearning * 0.2 +
      coverage * 0.2 +
      pointsMomentum * 0.15) *
      100,
  );

  return {
    readinessScore,
    readinessPoints: totalPoints,
    teamMastery: Math.round(teamMastery * 100),
    communityLearning: Math.round(communityLearning * 100),
    coverage: Math.round(coverage * 100),
    pointsMomentum: Math.round(pointsMomentum * 100),
    coveredTypeCount: coveredTypes.size,
    totalTypeCount: allTypes.length,
    teamGuideCount: teamGuides.length,
    communityGuideCount: communityGuides.length,
  };
};

// Returns only the final readiness percentage from the full breakdown.
export const calculateReadiness = (progress = {}, guides = []) => {
  return calculateReadinessBreakdown(progress, guides).readinessScore;
};

// Maps a readiness percentage to the profile preparedness tier.
export const getProfileTier = (score = 0) => {
  if (score >= 90) return "Community Ready";
  if (score >= 75) return "Response Ready";
  if (score >= 50) return "Prepared";
  if (score >= 25) return "Aware";
  return "Getting Started";
};

// Returns a short preparedness message for the current readiness tier.
export const getReadinessSummary = (score = 0) => {
  if (score >= 90)
    return "You have strong disaster readiness across trusted guides and multiple hazard types.";
  if (score >= 75)
    return "You are close to deployment-ready. Keep improving coverage across more scenarios.";
  if (score >= 50)
    return "You are building a solid base. Finishing more team guides will raise your readiness faster.";
  if (score >= 25)
    return "You understand the basics. Continue reading and testing yourself to build confidence.";
  return "Start with team guides and quizzes to build your preparedness foundation.";
};
