// Shows a full guide, its mixed-media content, votes and readiness quiz.
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import { calculateQuizPoints, getGuideTypeColor } from "../utils/guideUtils";
import {
  getGuidePromotionThreshold,
  normalizeContentBlocks,
} from "../utils/guideStorage";
import AppHeader from "../components/AppHeader";
import { selectionFeedback, successFeedback } from "../utils/deviceFeedback";

// Displays the selected guide, its content blocks, voting and quiz questions.
export default function GuideDetailScreen({
  route,
  navigation,
  guides,
  onCompleteGuide,
  onUpvoteGuide,
}) {
  const { guideId } = route.params;
  const guide = useMemo(
    () => guides.find((item) => item.id === guideId),
    [guides, guideId],
  );
  const [answers, setAnswers] = useState({});
  if (!guide)
    return (
      <View style={styles.missingWrap}>
        <Text>Guide not found.</Text>
      </View>
    );
  const typeColor = getGuideTypeColor(guide.type);
  const totalQuestions = guide.quiz.length;
  const blocks = normalizeContentBlocks(guide);
  // Checks every quiz answer, awards points and opens the result screen.
  const submitQuiz = () => {
    if (Object.keys(answers).length < totalQuestions) {
      Alert.alert(
        "Complete quiz",
        "Please answer all quiz questions before submitting.",
      );
      return;
    }
    let correct = 0;
    guide.quiz.forEach((q) => {
      if (answers[q.id] === q.answerIndex) correct += 1;
    });
    const pointsEarned = calculateQuizPoints(guide, correct, totalQuestions);
    const result = {
      score: correct,
      totalQuestions,
      pointsEarned,
      completed: correct === totalQuestions,
      title: guide.title,
    };
    onCompleteGuide(guide, result);
    successFeedback();
    navigation.navigate("GuideResult", { guideId: guide.id, result });
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Guide details</Text>
        <View style={styles.backButton} />
      </View>
      <View style={[styles.heroCard, { backgroundColor: typeColor.bg }]}>
        <Ionicons name={typeColor.icon} size={42} color={typeColor.fg} />
        <Text style={styles.heroTitle}>{guide.title}</Text>
        <Text style={styles.heroSummary}>{guide.summary}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>
              {guide.promotedFromCommunity
                ? "Community-approved"
                : guide.category === "team"
                  ? "Team guide"
                  : "Community guide"}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>
              {guide.estimatedMinutes} min read
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Guide</Text>
      {blocks.map((b, i) =>
        b.type === "image" && b.imageUri ? (
          <View key={b.id || i} style={styles.imageBlock}>
            <Image
              source={{ uri: b.imageUri }}
              style={styles.guideImage}
              resizeMode="cover"
              accessibilityLabel={b.caption || `Guide image ${i + 1}`}
            />
            {b.caption ? <Text style={styles.caption}>{b.caption}</Text> : null}
          </View>
        ) : b.type === "text" && b.text ? (
          <Text key={b.id || i} style={styles.bodyText}>
            {b.text}
          </Text>
        ) : null,
      )}
      <View style={styles.voteCard}>
        <Text style={styles.voteLabel}>Community score</Text>
        <View style={styles.voteActions}>
          <Text style={styles.voteCount}>{guide.votes} upvotes</Text>
          <Pressable
            style={styles.voteButton}
            onPress={() => onUpvoteGuide(guide.id)}
          >
            <Ionicons name="arrow-up" size={18} color="#FFF" />
            <Text style={styles.voteButtonText}>Upvote</Text>
          </Pressable>
        </View>
        {guide.category === "community" &&
        guide.votes >= getGuidePromotionThreshold() ? (
          <Text style={styles.promoteText}>
            This guide crossed {getGuidePromotionThreshold()} upvotes. Readis
            marks this as community-approved, but a real deployment should still
            require moderator or expert review.
          </Text>
        ) : null}
        {guide.promotedFromCommunity ? (
          <Text style={styles.promoteText}>
            This was created by the community. Its origin stays visible even
            after promotion.
          </Text>
        ) : null}
      </View>
      <Text style={styles.sectionTitle}>Quick quiz</Text>
      {guide.quiz.map((q, index) => (
        <View key={q.id} style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            {index + 1}. {q.question}
          </Text>
          {q.options.map((opt, oi) => {
            const selected = answers[q.id] === oi;
            return (
              <Pressable
                key={`${q.id}-${oi}`}
                style={[styles.optionButton, selected && styles.optionSelected]}
                onPress={() => {
                  setAnswers((c) => ({ ...c, [q.id]: oi }));
                  selectionFeedback();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <Pressable style={styles.submitButton} onPress={submitQuiz}>
        <Text style={styles.submitText}>Submit quiz</Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  missingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  heroCard: { marginTop: 18, borderRadius: 22, padding: 18 },
  heroTitle: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  heroSummary: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" },
  metaPill: {
    backgroundColor: "rgba(255,255,255,.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metaText: { color: COLORS.text, fontWeight: "700" },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  bodyText: {
    color: COLORS.text,
    lineHeight: 25,
    fontSize: 16,
    marginBottom: 14,
  },
  imageBlock: { marginBottom: 16 },
  guideImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },
  caption: {
    marginTop: 7,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  voteCard: {
    marginTop: 18,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  voteLabel: { color: COLORS.textMuted, fontWeight: "700" },
  voteActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voteCount: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  voteButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  voteButtonText: { color: "#FFF", fontWeight: "800" },
  promoteText: {
    marginTop: 12,
    color: COLORS.primary,
    lineHeight: 20,
    fontWeight: "600",
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  questionTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  optionText: { color: COLORS.text, lineHeight: 20 },
  optionTextSelected: { color: COLORS.primary, fontWeight: "700" },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 18,
    marginTop: 8,
  },
  submitText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});
