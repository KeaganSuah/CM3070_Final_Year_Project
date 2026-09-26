// Shows Team and Community guides while keeping their trust source clear.

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import GuideCard from '../components/GuideCard';
import AppHeader from '../components/AppHeader';

// Displays one horizontal section of guides with a title and view-all action.
function GuideSection({ icon, color, title, guides, onOpenGuide }) {
  const [expanded, setExpanded] = useState(false);
  const visibleGuides = expanded ? guides : guides.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={26} color={color} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Pressable onPress={() => setExpanded((current) => !current)}>
          <Text style={styles.viewAll}>{expanded ? 'Show less' : 'View all'}</Text>
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.gridWrap}>
          {visibleGuides.map((guide) => (
            <View key={guide.id} style={styles.gridItem}>
              <GuideCard guide={guide} onPress={() => onOpenGuide(guide)} cardStyle={styles.fullCard} />
            </View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {visibleGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} onPress={() => onOpenGuide(guide)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// Separates trusted Team Guides from Community Guides in the main library.
export default function GuidesScreen({ navigation, guides, profile }) {
  const teamGuides = useMemo(() => guides.filter((guide) => guide.category === 'team'), [guides]);
  const communityGuides = useMemo(() => guides.filter((guide) => guide.category === 'community'), [guides]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader />

      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <Ionicons name="book-outline" size={34} color={COLORS.primary} />
          <Text style={styles.heroTitle}>Guide Library</Text>
        </View>
        <Text style={styles.heroSubtitle}>Practical guides to help you prepare for any situation.</Text>
      </View>

      <View style={styles.quickRow}>
        <View style={styles.quickCard}>
          <Text style={styles.quickValue}>{profile.readinessPoints}</Text>
          <Text style={styles.quickLabel}>Readiness points</Text>
        </View>
        <Pressable style={styles.createButton} onPress={() => navigation.navigate('CreateGuide')}>
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Create guide</Text>
        </Pressable>
      </View>

      <GuideSection
        icon="people"
        color={COLORS.primary}
        title="Team Guides"
        guides={teamGuides}
        onOpenGuide={(guide) => navigation.navigate('GuideDetail', { guideId: guide.id })}
      />

      <GuideSection
        icon="people-circle-outline"
        color={COLORS.orange}
        title="Community Guides"
        guides={communityGuides}
        onOpenGuide={(guide) => navigation.navigate('GuideDetail', { guideId: guide.id })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  hero: {
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  heroSubtitle: { marginTop: 8, color: COLORS.textMuted, fontSize: 17, lineHeight: 24, maxWidth: 320 },
  quickRow: { flexDirection: 'row', gap: 12, marginTop: 18, alignItems: 'center' },
  quickCard: { flex: 1, backgroundColor: COLORS.card, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  quickValue: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  quickLabel: { marginTop: 4, color: COLORS.textMuted },
  createButton: { backgroundColor: COLORS.primary, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  createButtonText: { color: '#FFF', fontWeight: '800' },
  section: { marginTop: 26 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  viewAll: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  horizontalList: { paddingRight: 6 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  gridItem: { width: '48%' },
  fullCard: { width: '100%', marginRight: 0 }
});
