import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Edition } from '../types/mission';
import { UserAccessibilityPreferences } from '../types/user';
import { COLORS } from '../constants/theme';
import { ProgressBar } from '../components/common/ProgressBar';
import { BionicText } from '../components/missions/BionicText';

interface EditionsScreenProps {
  editions: Edition[];
  onOpenEdition: (id: string) => void;
  onNavigateUpload: () => void;
  preferences: UserAccessibilityPreferences;
}

export const EditionsScreen: React.FC<EditionsScreenProps> = ({
  editions,
  onOpenEdition,
  onNavigateUpload,
  preferences
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = editions.filter(ed => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ed.title.toLowerCase().includes(q) ||
      ed.description.toLowerCase().includes(q) ||
      ed.tags.some(t => t.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || ed.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filterBar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search documents and tags..."
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusPills}>
          {[
            { id: 'all', label: 'All' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'draft', label: 'Drafts' }
          ].map(pill => {
            const isSelected = statusFilter === pill.id;
            return (
              <TouchableOpacity
                key={pill.id}
                onPress={() => setStatusFilter(pill.id)}
                style={[styles.pill, isSelected ? styles.pillSelected : styles.pillIdle]}
              >
                <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : styles.pillTextIdle]}>
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Editions List */}
      <ScrollView contentContainerStyle={styles.listPadding}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matching editions found</Text>
            <Text style={styles.emptySub}>Try searching a different keyword or upload a new file.</Text>
            <TouchableOpacity onPress={onNavigateUpload} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>+ Upload New Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(ed => {
            const pct = Math.round((ed.progress / (ed.totalMissions || 1)) * 100);
            return (
              <TouchableOpacity
                key={ed.id}
                activeOpacity={0.8}
                onPress={() => onOpenEdition(ed.id)}
                style={styles.card}
              >
                <View style={styles.cardTop}>
                  <View style={styles.coverBox}>
                    <Text style={styles.coverEmoji}>{ed.coverEmoji || '📄'}</Text>
                  </View>
                  <View style={styles.badgeRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{ed.sourceType.toUpperCase()}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            ed.status === 'completed'
                              ? COLORS.okBg
                              : ed.status === 'in_progress'
                              ? '#EEF0FF'
                              : '#F5F5FA'
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              ed.status === 'completed'
                                ? COLORS.ok
                                : ed.status === 'in_progress'
                                ? COLORS.brand
                                : COLORS.muted
                          }
                        ]}
                      >
                        {ed.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </View>

                <BionicText preferences={preferences} style={styles.cardTitle}>
                  {ed.title}
                </BionicText>

                <BionicText preferences={preferences} style={styles.cardDesc}>
                  {ed.description}
                </BionicText>

                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>
                    {ed.progress} of {ed.totalMissions} missions
                  </Text>
                  <Text style={styles.progressPct}>{pct}%</Text>
                </View>

                <ProgressBar progress={pct} height={6} color={COLORS.brand} style={{ marginTop: 6 }} />

                <View style={styles.cardFooter}>
                  <Text style={styles.timeLabel}>🕒 {ed.totalTimeEstimateMinutes} min total</Text>
                  <Text style={styles.openCta}>Open missions →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  filterBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: COLORS.line,
    gap: 12
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFB',
    fontSize: 14,
    color: COLORS.ink
  },
  statusPills: {
    flexDirection: 'row',
    gap: 8
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  pillIdle: {
    backgroundColor: '#FAFAFB',
    borderColor: COLORS.line
  },
  pillSelected: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  pillTextIdle: {
    color: COLORS.muted
  },
  pillTextSelected: {
    color: '#FFFFFF'
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
    gap: 14
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  coverBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coverEmoji: {
    fontSize: 20
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6
  },
  typeBadge: {
    backgroundColor: '#F5F5FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 6
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 14
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F2F6'
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500'
  },
  openCta: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.brand
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.line,
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 6
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 16
  },
  emptyBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  }
});
