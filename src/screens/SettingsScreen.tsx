import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { UserAccessibilityPreferences, UserProfile } from '../types/user';
import { COLORS } from '../constants/theme';
import { BionicText } from '../components/missions/BionicText';

interface SettingsScreenProps {
  preferences: UserAccessibilityPreferences;
  onUpdatePreferences: (updated: Partial<UserAccessibilityPreferences>) => void;
  user: UserProfile | null;
  onToggleAiPrivacy: (allow: boolean) => void;
  onNavigateSubscription: () => void;
  onLogout: () => void;
  onWipeData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  preferences,
  onUpdatePreferences,
  user,
  onToggleAiPrivacy,
  onNavigateSubscription,
  onLogout,
  onWipeData
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <Text style={styles.heading}>Accessibility & Reading Preferences</Text>
      <Text style={styles.subHeading}>
        Customise your reading layout for ADHD, AuDHD, dyslexia, and sensory focus.
      </Text>

      {/* Font Family */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Font Family</Text>
        <Text style={styles.cardSub}>Selected dyslexia-friendly and high-legibility typefaces.</Text>
        <View style={styles.btnGrid}>
          {[
            { id: 'inter', label: 'Inter' },
            { id: 'lexend', label: 'Lexend' },
            { id: 'opendyslexic', label: 'OpenDyslexic' },
            { id: 'hyper', label: 'Atkinson Hyper' },
            { id: 'verdana', label: 'Verdana' }
          ].map(f => {
            const isSelected = preferences.fontFamily === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => onUpdatePreferences({ fontFamily: f.id as any })}
                style={[styles.choiceBtn, isSelected ? styles.choiceBtnSelected : styles.choiceBtnIdle]}
              >
                <Text style={[styles.choiceBtnText, isSelected ? styles.choiceBtnTextSelected : styles.choiceBtnTextIdle]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sizing & Spacing */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Text Sizing & Line Spacing</Text>

        <Text style={styles.fieldLabel}>Font Size</Text>
        <View style={styles.btnRow}>
          {['small', 'medium', 'large', 'xl'].map(s => {
            const isSelected = preferences.fontSize === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => onUpdatePreferences({ fontSize: s as any })}
                style={[styles.smallChoiceBtn, isSelected ? styles.choiceBtnSelected : styles.choiceBtnIdle]}
              >
                <Text style={[styles.choiceBtnText, isSelected ? styles.choiceBtnTextSelected : styles.choiceBtnTextIdle]}>
                  {s.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Line Spacing</Text>
        <View style={styles.btnRow}>
          {['normal', 'relaxed', 'loose'].map(l => {
            const isSelected = preferences.lineSpacing === l;
            return (
              <TouchableOpacity
                key={l}
                onPress={() => onUpdatePreferences({ lineSpacing: l as any })}
                style={[styles.smallChoiceBtn, isSelected ? styles.choiceBtnSelected : styles.choiceBtnIdle]}
              >
                <Text style={[styles.choiceBtnText, isSelected ? styles.choiceBtnTextSelected : styles.choiceBtnTextIdle]}>
                  {l.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bionic Reading */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>📖 Bionic Reading Mode</Text>
            <Text style={styles.cardSub}>
              Bolds initial word anchors to guide eye fixation and reduce visual wandering.
            </Text>
          </View>
          <Switch
            value={preferences.bionicReading}
            onValueChange={(val) => onUpdatePreferences({ bionicReading: val })}
            trackColor={{ false: COLORS.line, true: COLORS.brand }}
          />
        </View>

        {preferences.bionicReading && (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
            <BionicText preferences={preferences} style={styles.previewText}>
              Bionic reading helps neurodivergent brains maintain rhythmic momentum across dense documents without losing focus.
            </BionicText>
          </View>
        )}
      </View>

      {/* Focus & Visual Aids */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Focus & Sensory Controls</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>📏 Reading Ruler</Text>
            <Text style={styles.itemSub}>Movable floating visual guide line to isolate single lines.</Text>
          </View>
          <Switch
            value={preferences.readingRuler}
            onValueChange={(val) => onUpdatePreferences({ readingRuler: val })}
            trackColor={{ false: COLORS.line, true: COLORS.brand }}
          />
        </View>

        <View style={[styles.switchRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>🎯 Focus Mode</Text>
            <Text style={styles.itemSub}>Hides all tabs, headers, and visual noise.</Text>
          </View>
          <Switch
            value={preferences.focusMode}
            onValueChange={(val) => onUpdatePreferences({ focusMode: val })}
            trackColor={{ false: COLORS.line, true: COLORS.brand }}
          />
        </View>

        <View style={[styles.switchRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>🔆 High Contrast</Text>
            <Text style={styles.itemSub}>Enforces clear borders and higher WCAG AAA contrast ratios.</Text>
          </View>
          <Switch
            value={preferences.highContrast}
            onValueChange={(val) => onUpdatePreferences({ highContrast: val })}
            trackColor={{ false: COLORS.line, true: COLORS.brand }}
          />
        </View>

        <View style={[styles.switchRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>🌙 Dark Theme</Text>
            <Text style={styles.itemSub}>Low-glare dark background for night focus.</Text>
          </View>
          <Switch
            value={preferences.darkMode}
            onValueChange={(val) => onUpdatePreferences({ darkMode: val })}
            trackColor={{ false: COLORS.line, true: COLORS.brand }}
          />
        </View>
      </View>

      {/* Document Privacy Guard */}
      <View style={[styles.card, { borderColor: '#E0D8FF' }]}>
        <Text style={styles.cardTitle}>🔒 Strict Document Privacy Guard</Text>
        <Text style={styles.cardSub}>
          Focus Edition prioritises confidentiality. Never send private document content to an external AI service unless explicitly enabled.
        </Text>

        <View style={[styles.switchRow, { marginTop: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Allow External AI Processing</Text>
            <Text style={styles.itemSub}>
              {user?.allowAiProcessing
                ? 'Enabled: Cloud AI enhancements permitted.'
                : 'Disabled (Recommended): All extraction runs strictly on-device.'}
            </Text>
          </View>
          <Switch
            value={user?.allowAiProcessing ?? false}
            onValueChange={onToggleAiPrivacy}
            trackColor={{ false: COLORS.line, true: COLORS.ok }}
          />
        </View>
      </View>

      {/* Subscription & Account */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Subscription & Cloud Account</Text>
        <Text style={styles.cardSub}>
          Current Tier:{' '}
          <Text style={{ fontWeight: '800', color: COLORS.brand }}>
            {user?.subscriptionTier ? user.subscriptionTier.toUpperCase() : 'FREE'}
          </Text>{' '}
          ({user?.testModeSubscription ? 'Sandbox Mode' : 'Standard'})
        </Text>

        <TouchableOpacity onPress={onNavigateSubscription} style={styles.subBtn}>
          <Text style={styles.subBtnText}>Manage Subscriptions & Test Mode →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Log Out ({user?.email})</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Storage</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Reset Data', 'Are you sure you want to restore original sample documents?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: onWipeData }
            ]);
          }}
          style={styles.wipeBtn}
        >
          <Text style={styles.wipeBtnText}>Reset to Default Seed Editions</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
    gap: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 4
  },
  subHeading: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 10
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 4
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 12
  },
  btnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6
  },
  choiceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1
  },
  smallChoiceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  choiceBtnIdle: {
    backgroundColor: '#FAFAFB',
    borderColor: COLORS.line
  },
  choiceBtnSelected: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink
  },
  choiceBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  choiceBtnTextIdle: {
    color: COLORS.ink
  },
  choiceBtnTextSelected: {
    color: '#FFFFFF'
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 6
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink
  },
  itemSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  previewBox: {
    marginTop: 14,
    backgroundColor: '#FAFAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0D8FF'
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.brand,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.ink
  },
  subBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  subBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  logoutBtn: {
    backgroundColor: '#FAFAFB',
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutBtnText: {
    color: COLORS.ink,
    fontWeight: '600',
    fontSize: 13
  },
  wipeBtn: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  wipeBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13
  }
});
