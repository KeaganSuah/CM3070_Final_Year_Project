// Shows the report feed with search, area filters, disaster filters and weather context.

import React, { useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilterChip from '../components/FilterChip';
import ReportCard from '../components/ReportCard';
import EmptyState from '../components/EmptyState';
import { AREAS, DISASTER_TYPES } from '../constants/options';
import { COLORS } from '../constants/theme';
import AppHeader from '../components/AppHeader';
import WeatherContextCard from '../components/WeatherContextCard';
import { filterReports } from '../utils/reportUtils';

// Displays recent incidents after applying the current search and filter settings.
export default function FeedScreen({
  navigation,
  reports,
  selectedArea,
  setSelectedArea,
  selectedType,
  setSelectedType,
  searchText,
  setSearchText,
  onPressLike
}) {
  const filteredReports = useMemo(() => filterReports({
    reports,
    selectedArea,
    selectedType,
    searchText
  }), [reports, selectedArea, selectedType, searchText]);

  const disasterIcons = {
    All: <Ionicons name="grid-outline" size={18} color={selectedType === 'All' ? '#FFF' : COLORS.textMuted} />,
    Flood: <Ionicons name="water-outline" size={18} color={selectedType === 'Flood' ? '#FFF' : COLORS.primary} />,
    Fire: <Ionicons name="flame-outline" size={18} color={selectedType === 'Fire' ? '#FFF' : COLORS.orange} />,
    Storm: <Ionicons name="thunderstorm-outline" size={18} color={selectedType === 'Storm' ? '#FFF' : COLORS.primary} />,
    'Power Outage': <Ionicons name="flash-outline" size={18} color={selectedType === 'Power Outage' ? '#FFF' : COLORS.orange} />
  };

  // Cycles through the available compass regions when the area card is pressed.
  const openAreaPicker = () => {
    const currentIndex = ['All', ...AREAS].indexOf(selectedArea);
    const options = ['All', ...AREAS];
    const nextIndex = (currentIndex + 1) % options.length;
    setSelectedArea(options[nextIndex]);
  };

  // Clears the search and restores all report filters to their default state.
  const resetAll = () => {
    setSelectedArea('All');
    setSelectedType('All');
    setSearchText('');
  };

  return (
    <FlatList
      data={filteredReports}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <AppHeader />

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={22} color={COLORS.textMuted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search reports, places, or disaster types"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ paddingRight: 8 }}>
            <FilterChip
              label="My Area"
              active={selectedArea !== 'All'}
              onPress={() => setSelectedArea('Central')}
              icon={<Ionicons name="location" size={18} color={selectedArea !== 'All' ? '#FFF' : COLORS.primary} />}
            />
            <FilterChip
              label="Nearby"
              active={selectedArea === 'All'}
              onPress={() => setSelectedArea('All')}
              icon={<Ionicons name="locate-outline" size={18} color={selectedArea === 'All' ? '#FFF' : COLORS.primary} />}
            />
            {DISASTER_TYPES.slice(1).map((type) => (
              <FilterChip
                key={type}
                label={type === 'Power Outage' ? 'Power' : type}
                active={selectedType === type}
                onPress={() => setSelectedType(selectedType === type ? 'All' : type)}
                icon={disasterIcons[type]}
              />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.areaCard} onPress={openAreaPicker} activeOpacity={0.85}>
            <View style={styles.areaLeft}>
              <Ionicons name="compass-outline" size={20} color={COLORS.textMuted} />
              <Text style={styles.areaText}>Current area: <Text style={styles.areaStrong}>{selectedArea === 'All' ? 'All compass regions' : selectedArea}</Text></Text>
            </View>
            <View style={styles.areaRight}>
              <Text style={styles.changeText}>Change</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.areaOptionsWrap}>
            {AREAS.map((item) => (
              <FilterChip key={item} label={item} active={selectedArea === item} onPress={() => setSelectedArea(item)} />
            ))}
          </View>

          <WeatherContextCard selectedArea={selectedArea} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={resetAll}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <ReportCard
          report={item}
          onPressLike={onPressLike}
          onPressOpenMap={() => navigation.navigate('Map', { focusReportId: item.id, focusKey: Date.now() })}
        />
      )}
      ListEmptyComponent={<EmptyState />}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
    backgroundColor: COLORS.background
  },
  searchBar: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text
  },
  chipRow: {
    marginTop: 18,
    marginBottom: 18
  },
  areaCard: {
    backgroundColor: '#F0F3F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  areaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  areaText: { color: COLORS.textMuted, fontSize: 15 },
  areaStrong: { color: COLORS.primary, fontWeight: '800' },
  areaRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeText: { color: COLORS.primary, fontWeight: '700' },
  areaOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  viewAll: { color: COLORS.primary, fontWeight: '700' }
});
