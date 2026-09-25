import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Edition } from '../types/mission';
import { UserProfile, UserAccessibilityPreferences } from '../types/user';
import { FocusTimer } from '../services/accessibility/focusTimer';
import { COLORS } from '../constants/theme';
import { ProgressBar } from '../components/common/ProgressBar';
import { TimerWidget } from '../components/accessibility/TimerWidget';
import { BionicText } from '../components/missions/BionicText';

interface DashboardScreenProps {
  user: UserProfile | null;
  editions: Edition[];
  timer: FocusTimer;
  onOpenEdition: (id: string) => void;
  onNavigateUpload: () => void;
  onNavigateEditions: () => void;
  preferences: UserAccessibilityPreferences;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  editions,
  timer,
  onOpenEdition,
  onNavigateUpload,
  onNavigateEditions,
  preferences
}) => {
  const inProgressCount = editions.filter(e => e.status === 'in_progress').length;
  const completedMissions = editions.reduce((acc, e) => acc + e.progress, 0);
  const totalMissions = editions.reduce((acc, e) => acc + e.totalMissions, 0);
  const overallPct = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  const recentEditions = editions.slice(0, 3);
  const activeEdition = editions[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.greeting}>
            Welcome back, {user?.name.split(' ')[0] || 'Friend'} 👋
          </Text>
          <Text style={styles.subGreeting}>
            {inProgressCount} in progress · short source-grounded missions
          </Text>
        </View>
        <TouchableOpacity onPress={onNavigateUpload} style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>+ New Document</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>MY EDITIONS</Text>
          <Text style={styles.statValue}>{editions.length}</Text>
          <Text style={styles.statNote}>Active workspaces</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>MISSIONS DONE</Text>
          <Text style={styles.statValue}>{completedMissions}/{totalMissions}</Text>
          <ProgressBar progress={overallPct} color={COLORS.ok} style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Focus Timer */}
      <View style={{ marginBottom: 16 }}>
        <TimerWidget timer={timer} />
      </View>

      {/* Continue Active Card */}
      {activeEdition && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onOpenEdition(activeEdition.id)}
          style={styles.continueCard}
        >
          <View style={styles.continueHeader}>
            <Text style={styles.continueLabel}>CONTINUE READING</Text>
            <Text style={styles.continueTime}>🕒 {activeEdition.totalTimeEstimateMinutes}m total</Text>
          </View>
          <Text style={styles.continueTitle}>{activeEdition.title}</Text>
          <ProgressBar
            progress={Math.round((activeEdition.progress / (activeEdition.totalMissions || 1)) * 100)}
            height={8}
            color="#FFFFFF"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            style={{ marginVertical: 12 }}
          />
          <View style={styles.continueFooter}>
            <Text style={styles.continueProgressText}>
              {activeEdition.progress} of {activeEdition.totalMissions} missions completed
            </Text>
            <Text style={styles.continueCta}>Open →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Recent Editions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Documents</Text>
        <TouchableOpacity onPress={onNavigateEditions}>
          <Text style={styles.seeAllText}>View All ({editions.length}) →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentsList}>
        {recentEditions.map(ed => {
          const pct = Math.round((ed.progress / (ed.totalMissions || 1)) * 100);
          return (
            <TouchableOpacity
              key={ed.id}
              activeOpacity={0.8}
              onPress={() => onOpenEdition(ed.id)}
              style={styles.editionRow}
            >
              <View style={[styles.coverEmojiBox, { backgroundColor: COLORS.brandLight }]}>
                <Text style={styles.emojiText}>{ed.coverEmoji || '📄'}</Text>
              </View>

              <View style={styles.editionRowContent}>
                <BionicText preferences={preferences} style={styles.editionRowTitle}>
                  {ed.title}
                </BionicText>
                <Text style={styles.editionRowMeta}>
                  {ed.progress}/{ed.totalMissions} done · {ed.totalTimeEstimateMinutes} min
                </Text>
                <ProgressBar progress={pct} height={4} color={COLORS.brand} style={{ marginTop: 6 }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 40
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink
  },
  subGreeting: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2
  },
  uploadBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.ink,
    marginTop: 4
  },
  statNote: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4
  },
  continueCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  continueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5
  },
  continueTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600'
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8
  },
  continueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  continueProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },
  continueCta: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brand
  },
  recentsList: {
    gap: 10
  },
  editionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12
  },
  coverEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emojiText: {
    fontSize: 20
  },
  editionRowContent: {
    flex: 1
  },
  editionRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink
  },
  editionRowMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  }
});
