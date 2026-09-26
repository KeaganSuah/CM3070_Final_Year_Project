// Displays one incident report with its details, evidence image and actions.
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { formatRelativeTime, getTypeIconName } from '../utils/reportUtils';

const severityStyles = {
  Low: { bg: '#FFF4E8', text: '#D8782C' },
  Moderate: { bg: '#EAF1FF', text: '#2F63D6' },
  High: { bg: '#FCE9E6', text: '#D55B4A' }
};

// Displays one report, including votes, optional evidence and a shortcut to the map.
export default function ReportCard({ report, onPressLike, onPressOpenMap, compact = false }) {
  const badge = severityStyles[report.severity] || severityStyles.Moderate;
  const isFire = report.type === 'Fire' || report.type === 'Power Outage';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.iconCircle, isFire && styles.iconCircleWarm]}>
        <Ionicons name={getTypeIconName(report.type)} size={28} color={isFire ? COLORS.orange : COLORS.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.type, isFire && styles.typeWarm]}>{report.type}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{report.severity}</Text>
          </View>
        </View>

        <View style={styles.metaRow}><Ionicons name="compass-outline" size={16} color={COLORS.textMuted} /><Text style={styles.metaText}>{report.area}</Text></View>
        <View style={styles.metaRow}><Ionicons name="location-outline" size={16} color={COLORS.textMuted} /><Text style={styles.metaText}>{report.location}{report.postalCode ? `, ${report.postalCode}` : ''}</Text></View>
        <View style={styles.metaRow}><Ionicons name="time-outline" size={16} color={COLORS.textMuted} /><Text style={styles.metaText}>{formatRelativeTime(report.minutesAgo)}</Text></View>

        <Text style={styles.description}>{report.description}</Text>
        {report.photoUri ? <Image source={{ uri: report.photoUri }} style={styles.reportPhoto} resizeMode="cover" accessibilityLabel="Incident evidence photo" /> : null}

        <View style={styles.footerRow}>
          <Pressable style={styles.voteRow} onPress={() => onPressLike?.(report.id)} accessibilityRole="button" accessibilityLabel={`Upvote report. ${report.votes} votes`}>
            <Ionicons name="thumbs-up" size={18} color={COLORS.primary} />
            <Text style={styles.voteText}>{report.votes}</Text>
          </Pressable>
          {onPressOpenMap ? (
            <Pressable onPress={onPressOpenMap} hitSlop={10} accessibilityRole="button" accessibilityLabel="Open incident on map">
              <Ionicons name="map-outline" size={20} color={COLORS.primary} />
            </Pressable>
          ) : <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 16, flexDirection: 'row', gap: 14, marginBottom: 14, shadowColor: '#0B245D', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  cardCompact: { marginBottom: 0 },
  iconCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconCircleWarm: { backgroundColor: COLORS.orangeSoft },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12 },
  type: { fontSize: 18, fontWeight: '800', color: COLORS.primary, flex: 1 },
  typeWarm: { color: COLORS.orange },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  metaText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '500', flex: 1 },
  description: { marginTop: 8, color: COLORS.text, fontSize: 15, lineHeight: 22 },
  reportPhoto: { width: '100%', height: 150, borderRadius: 14, marginTop: 12, backgroundColor: COLORS.border },
  footerRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  voteText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 }
});
