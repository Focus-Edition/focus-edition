import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Edition } from '../types/mission';
import { UserAccessibilityPreferences } from '../types/user';
import { COLORS } from '../constants/theme';
import { ProgressBar } from '../components/common/ProgressBar';
import { MissionCard } from '../components/missions/MissionCard';
import { BionicText } from '../components/missions/BionicText';
import { ttsService } from '../services/accessibility/ttsService';

interface EditionDetailScreenProps {
  edition: Edition;
  onBack: () => void;
  onOpenMission: (missionId: string) => void;
  onToggleMission: (missionId: string) => void;
  onMarkAll: (markDone: boolean) => void;
  onEnterFocusMode: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  speakingMissionId: string | null;
  onToggleSpeakMission: (missionId: string, text: string) => void;
  preferences: UserAccessibilityPreferences;
}

export const EditionDetailScreen: React.FC<EditionDetailScreenProps> = ({
  edition,
  onBack,
  onOpenMission,
  onToggleMission,
  onMarkAll,
  onEnterFocusMode,
  onDuplicate,
  onDelete,
  speakingMissionId,
  onToggleSpeakMission,
  preferences
}) => {
  const pct = Math.round((edition.progress / (edition.totalMissions || 1)) * 100);
  const allDone = edition.progress === edition.totalMissions;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <TouchableOpacity onPress={onBack} style={styles.backRow}>
        <Text style={styles.backText}>← Back to My Editions</Text>
      </TouchableOpacity>

      {/* Overview Banner */}
      <View style={styles.overviewCard}>
        <ProgressBar progress={pct} height={6} color={COLORS.brand} />

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{edition.coverEmoji || '📄'}</Text>
            </View>
            <View style={styles.titleContent}>
              <BionicText preferences={preferences} style={styles.title}>
                {edition.title}
              </BionicText>
              <BionicText preferences={preferences} style={styles.description}>
                {edition.description}
              </BionicText>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              <Text style={{ fontWeight: '800', color: COLORS.ink }}>
                {edition.progress} of {edition.totalMissions} missions
              </Text>{' '}
              · {pct}% complete · 🕒 {edition.totalTimeEstimateMinutes} min
            </Text>
          </View>

          {/* Action Row */}
          <View style={styles.actionToolbar}>
            <TouchableOpacity onPress={onEnterFocusMode} style={styles.toolBtnDark}>
              <Text style={styles.toolBtnDarkText}>🎯 Focus Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onMarkAll(!allDone)}
              style={styles.toolBtnOutline}
            >
              <Text style={styles.toolBtnOutlineText}>
                {allDone ? 'Unmark All' : 'Mark All Done'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDuplicate} style={styles.toolBtnOutline}>
              <Text style={styles.toolBtnOutlineText}>Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDelete} style={styles.toolBtnDanger}>
              <Text style={styles.toolBtnDangerText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Missions Section Header */}
      <View style={styles.missionsHeader}>
        <Text style={styles.missionsTitle}>Missions ({edition.missions.length})</Text>
        <Text style={styles.missionsSub}>Click any mission row to begin</Text>
      </View>

      {/* Missions List */}
      <View style={styles.missionsList}>
        {edition.missions.map((m, idx) => (
          <MissionCard
            key={m.id}
            mission={m}
            index={idx}
            onOpen={() => onOpenMission(m.id)}
            onToggleDone={() => onToggleMission(m.id)}
            onSpeak={() => onToggleSpeakMission(m.id, `${m.title}. ${m.body}`)}
            isSpeaking={speakingMissionId === m.id}
            preferences={preferences}
          />
        ))}
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
  backRow: {
    paddingVertical: 10,
    marginBottom: 8
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 20
  },
  cardBody: {
    padding: 20
  },
  titleRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start'
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emoji: {
    fontSize: 24
  },
  titleContent: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    lineHeight: 26,
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18
  },
  statsRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F1F2F6'
  },
  statsText: {
    fontSize: 13,
    color: COLORS.muted
  },
  actionToolbar: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 14
  },
  toolBtnDark: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  toolBtnDarkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  toolBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  toolBtnOutlineText: {
    color: COLORS.ink,
    fontWeight: '600',
    fontSize: 12
  },
  toolBtnDanger: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  toolBtnDangerText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 12
  },
  missionsHeader: {
    marginBottom: 12
  },
  missionsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink
  },
  missionsSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  missionsList: {
    gap: 8
  }
});
