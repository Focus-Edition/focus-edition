import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mission } from '../../types/mission';
import { COLORS } from '../../constants/theme';
import { BionicText } from './BionicText';
import { UserAccessibilityPreferences } from '../../types/user';

interface MissionCardProps {
  mission: Mission;
  index: number;
  onOpen: () => void;
  onToggleDone: () => void;
  onSpeak: () => void;
  isSpeaking?: boolean;
  preferences?: UserAccessibilityPreferences;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  index,
  onOpen,
  onToggleDone,
  onSpeak,
  isSpeaking = false,
  preferences
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onOpen}
      style={[
        styles.card,
        mission.done ? styles.cardDone : styles.cardDefault
      ]}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onToggleDone();
        }}
        style={[styles.checkbox, mission.done ? styles.checkboxDone : styles.checkboxIdle]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: mission.done }}
        accessibilityLabel={`Mark mission ${index + 1} done`}
      >
        {mission.done && <Text style={styles.checkIcon}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.missionLabel}>MISSION {index + 1}</Text>
          <View style={styles.estBadge}>
            <Text style={styles.estText}>{mission.readingEstimateMinutes} min</Text>
          </View>
          {mission.done && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>Done</Text>
            </View>
          )}
        </View>

        <BionicText preferences={preferences} style={styles.title}>
          {mission.title}
        </BionicText>

        <BionicText
          preferences={preferences}
          style={styles.snippet}
        >
          {mission.body.length > 110 ? `${mission.body.slice(0, 110)}...` : mission.body}
        </BionicText>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onSpeak();
            }}
            style={[styles.listenBtn, isSpeaking ? styles.listenBtnActive : {}]}
            accessibilityLabel={isSpeaking ? 'Stop speech reading' : 'Listen to mission speech'}
          >
            <Text style={[styles.listenBtnText, isSpeaking ? styles.listenBtnTextActive : {}]}>
              {isSpeaking ? '⏹ Stop' : '🔊 Listen'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            style={styles.openBtn}
          >
            <Text style={styles.openBtnText}>Open mission →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12
  },
  cardDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.line
  },
  cardDone: {
    backgroundColor: 'rgba(231, 249, 240, 0.35)',
    borderColor: '#C2EED7'
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  checkboxIdle: {
    borderColor: COLORS.line,
    backgroundColor: '#FFFFFF'
  },
  checkboxDone: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brand
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  content: {
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5
  },
  estBadge: {
    backgroundColor: '#F5F5FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  estText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.ink
  },
  doneBadge: {
    backgroundColor: COLORS.okBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ok
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 22,
    marginBottom: 4
  },
  snippet: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 12
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  listenBtn: {
    backgroundColor: '#F5F5FA',
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  listenBtnActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink
  },
  listenBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink
  },
  listenBtnTextActive: {
    color: '#FFFFFF'
  },
  openBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
