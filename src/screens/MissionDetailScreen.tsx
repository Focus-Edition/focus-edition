import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Edition, Mission } from '../types/mission';
import { UserAccessibilityPreferences } from '../types/user';
import { COLORS } from '../constants/theme';
import { ProgressBar } from '../components/common/ProgressBar';
import { BionicText } from '../components/missions/BionicText';
import { QuizCard } from '../components/missions/QuizCard';
import { FlashcardView } from '../components/missions/FlashcardView';
import { SourceModal } from '../components/common/SourceModal';

interface MissionDetailScreenProps {
  edition: Edition;
  mission: Mission;
  onBack: () => void;
  onToggleDone: () => void;
  onPrevMission: () => void;
  onNextMission: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isSpeaking: boolean;
  onToggleSpeak: () => void;
  onEnterFocusMode: () => void;
  preferences: UserAccessibilityPreferences;
}

export const MissionDetailScreen: React.FC<MissionDetailScreenProps> = ({
  edition,
  mission,
  onBack,
  onToggleDone,
  onPrevMission,
  onNextMission,
  hasPrev,
  hasNext,
  isSpeaking,
  onToggleSpeak,
  onEnterFocusMode,
  preferences
}) => {
  const [showSource, setShowSource] = useState(false);

  const missionIndex = edition.missions.findIndex(m => m.id === mission.id);
  const totalMissions = edition.totalMissions || edition.missions.length;
  const progressPct = Math.round(((missionIndex + 1) / totalMissions) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      {/* Back and Status Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to {edition.title.slice(0, 20)}...</Text>
        </TouchableOpacity>

        <View style={styles.statusBadges}>
          <View style={styles.estBadge}>
            <Text style={styles.estText}>🕒 {mission.readingEstimateMinutes} min</Text>
          </View>
          <View style={[styles.doneBadge, mission.done ? styles.doneActive : styles.doneIdle]}>
            <Text style={[styles.doneBadgeText, mission.done ? styles.doneActiveText : styles.doneIdleText]}>
              {mission.done ? 'Done ✓' : 'In Progress'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content Card */}
      <View style={styles.card}>
        <ProgressBar progress={progressPct} height={5} color={COLORS.brand} />

        <View style={styles.cardBody}>
          <View style={styles.stepperRow}>
            <Text style={styles.stepperText}>
              MISSION {missionIndex + 1} OF {totalMissions}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSource(true)}
              style={styles.sourceTagBtn}
            >
              <Text style={styles.sourceTagText}>🔍 Show Source</Text>
            </TouchableOpacity>
          </View>

          <BionicText preferences={preferences} style={styles.missionTitle}>
            {mission.title}
          </BionicText>

          <View style={styles.bodyWrap}>
            <BionicText preferences={preferences} style={styles.bodyText}>
              {mission.body}
            </BionicText>
          </View>

          {/* Action Toolbar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              onPress={onToggleDone}
              style={[styles.actionBtn, mission.done ? styles.actionBtnDone : styles.actionBtnPrimary]}
            >
              <Text style={[styles.actionBtnText, mission.done ? styles.actionBtnDoneText : styles.actionBtnPrimaryText]}>
                {mission.done ? '✓ Completed — Undo?' : '✓ Mark Mission Done'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onToggleSpeak}
              style={[styles.actionBtn, isSpeaking ? styles.actionBtnSpeaking : styles.actionBtnOutline]}
            >
              <Text style={[styles.actionBtnText, isSpeaking ? styles.actionBtnSpeakingText : styles.actionBtnOutlineText]}>
                {isSpeaking ? '⏹ Stop Reading' : '🔊 Listen Aloud'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onEnterFocusMode}
              style={[styles.actionBtn, styles.actionBtnDark]}
            >
              <Text style={[styles.actionBtnText, styles.actionBtnDarkText]}>
                🎯 Focus
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Check Quizzes */}
      {mission.quizQuestions && mission.quizQuestions.length > 0 && (
        <View style={styles.interactiveSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.interactiveTitle}>🧠 Quick Check — Unique to this mission</Text>
          </View>
          {mission.quizQuestions.map((q, idx) => (
            <QuizCard
              key={q.id}
              question={q}
              index={idx}
              preferences={preferences}
            />
          ))}
        </View>
      )}

      {/* Flashcards */}
      {mission.flashcards && mission.flashcards.length > 0 && (
        <View style={styles.interactiveSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.interactiveTitle}>🗂️ Flashcards — Unique to this mission</Text>
          </View>
          {mission.flashcards.map((c, idx) => (
            <FlashcardView
              key={c.id}
              card={c}
              index={idx}
              preferences={preferences}
            />
          ))}
        </View>
      )}

      {/* Navigation Footer */}
      <View style={styles.navFooter}>
        <TouchableOpacity
          disabled={!hasPrev}
          onPress={onPrevMission}
          style={[styles.navBtn, !hasPrev ? styles.navBtnDisabled : styles.navBtnActive]}
        >
          <Text style={[styles.navBtnText, !hasPrev ? styles.navBtnDisabledText : styles.navBtnActiveText]}>
            ← Previous Mission
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!hasNext}
          onPress={onNextMission}
          style={[styles.navBtn, !hasNext ? styles.navBtnDisabled : styles.navBtnBrand]}
        >
          <Text style={[styles.navBtnText, !hasNext ? styles.navBtnDisabledText : styles.navBtnBrandText]}>
            Next Mission →
          </Text>
        </TouchableOpacity>
      </View>

      <SourceModal
        visible={showSource}
        onClose={() => setShowSource(false)}
        sourceReference={mission.sourceReference}
        itemTitle={`Source Grounding for "${mission.title}"`}
      />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  backBtn: {
    paddingVertical: 8
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 6
  },
  estBadge: {
    backgroundColor: '#F5F5FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  estText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.ink
  },
  doneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  doneActive: {
    backgroundColor: COLORS.okBg
  },
  doneIdle: {
    backgroundColor: '#EEF0FF'
  },
  doneBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  doneActiveText: {
    color: COLORS.ok
  },
  doneIdleText: {
    color: COLORS.brand
  },
  card: {
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
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  stepperText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5
  },
  sourceTagBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#EEF0FF'
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brand
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink,
    lineHeight: 28,
    marginBottom: 14
  },
  bodyWrap: {
    marginVertical: 4
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.ink,
    lineHeight: 26
  },
  actionsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#F1F2F6'
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.brand
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  actionBtnDone: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.line
  },
  actionBtnDoneText: {
    color: COLORS.ink,
    fontWeight: '700',
    fontSize: 13
  },
  actionBtnOutline: {
    backgroundColor: '#FAFAFB',
    borderWidth: 1,
    borderColor: COLORS.line
  },
  actionBtnOutlineText: {
    color: COLORS.ink,
    fontWeight: '600',
    fontSize: 13
  },
  actionBtnSpeaking: {
    backgroundColor: COLORS.ink
  },
  actionBtnSpeakingText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  actionBtnDark: {
    backgroundColor: COLORS.ink
  },
  actionBtnDarkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  actionBtnText: {},
  interactiveSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 16
  },
  sectionTitleRow: {
    marginBottom: 14
  },
  interactiveTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink
  },
  navFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.line
  },
  navBtnActiveText: {
    color: COLORS.ink,
    fontWeight: '700',
    fontSize: 13
  },
  navBtnBrand: {
    backgroundColor: COLORS.brand
  },
  navBtnBrandText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  navBtnDisabled: {
    backgroundColor: '#F5F5FA',
    borderWidth: 1,
    borderColor: COLORS.line
  },
  navBtnDisabledText: {
    color: '#B0B4C3',
    fontWeight: '600',
    fontSize: 13
  },
  navBtnText: {}
});
