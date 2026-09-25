import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, useWindowDimensions } from 'react-native';
import { Edition, Mission } from '../types/mission';
import { UserProfile, UserAccessibilityPreferences } from '../types/user';
import { FocusTimer } from '../services/accessibility/focusTimer';
import { syncEngine } from '../services/offline/syncEngine';
import { ttsService } from '../services/accessibility/ttsService';
import { COLORS, DEFAULT_PREFERENCES, getFontFamilyString } from '../constants/theme';
import { loadOfflinePreferences, saveOfflinePreferences } from '../services/offline/storage';

// Screens
import { AuthScreen } from '../screens/AuthScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { EditionsScreen } from '../screens/EditionsScreen';
import { EditionDetailScreen } from '../screens/EditionDetailScreen';
import { MissionDetailScreen } from '../screens/MissionDetailScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';

// Overlays
import { ReadingRulerOverlay } from '../components/accessibility/ReadingRulerOverlay';
import { FocusExitBanner } from '../components/common/FocusExitBanner';

export type ScreenView =
  | 'dashboard'
  | 'editions'
  | 'editionDetail'
  | 'missionDetail'
  | 'upload'
  | 'library'
  | 'settings'
  | 'subscription';

export const AppNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktopOrTablet = width >= 768;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserAccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [currentView, setCurrentView] = useState<ScreenView>('dashboard');

  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const [timer] = useState<FocusTimer>(() => new FocusTimer(25));
  const [speakingMissionId, setSpeakingMissionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      const eds = await syncEngine.initialize();
      setEditions(eds);

      const prefs = await loadOfflinePreferences(DEFAULT_PREFERENCES);
      setPreferences(prefs);
    };
    init();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdatePreferences = async (updated: Partial<UserAccessibilityPreferences>) => {
    const newPrefs = { ...preferences, ...updated };
    setPreferences(newPrefs);
    await saveOfflinePreferences(newPrefs);
  };

  const selectedEdition = editions.find(e => e.id === selectedEditionId) || editions[0];
  const selectedMission =
    selectedEdition?.missions.find(m => m.id === selectedMissionId) || selectedEdition?.missions[0];

  // TTS Toggle action: 1st tap speaks, 2nd tap stops
  const handleToggleSpeakMission = async (missionId: string, text: string) => {
    if (speakingMissionId === missionId) {
      await ttsService.stop();
      setSpeakingMissionId(null);
      showToast('Stopped reading');
      return;
    }

    setSpeakingMissionId(missionId);
    showToast('Reading aloud 🔊 — tap again to stop');
    await ttsService.toggleSpeak(text, {
      rate: preferences.ttsRate,
      pitch: preferences.ttsPitch,
      onDone: () => setSpeakingMissionId(null),
      onStopped: () => setSpeakingMissionId(null),
      onError: () => setSpeakingMissionId(null)
    });
  };

  // Mission Toggle Done
  const handleToggleMissionDone = async (editionId: string, missionId: string) => {
    const updated = await syncEngine.toggleMissionDone(editionId, missionId);
    if (updated) {
      setEditions([...syncEngine.getEditions()]);
      showToast(updated.done ? 'Mission marked done ✓' : 'Mission marked in progress');
    }
  };

  // Mark all / unmark all
  const handleMarkAll = async (markDone: boolean) => {
    if (!selectedEditionId) return;
    await syncEngine.markAllMissions(selectedEditionId, markDone);
    setEditions([...syncEngine.getEditions()]);
    showToast(markDone ? 'All missions marked done ✓' : 'All unmarked');
  };

  // Duplicate edition
  const handleDuplicateEdition = async (id: string) => {
    const dup = await syncEngine.duplicateEdition(id);
    if (dup) {
      setEditions([...syncEngine.getEditions()]);
      setSelectedEditionId(dup.id);
      setCurrentView('editionDetail');
      showToast('Edition duplicated ✓');
    }
  };

  // Delete edition
  const handleDeleteEdition = async (id: string) => {
    await syncEngine.deleteEdition(id);
    setEditions([...syncEngine.getEditions()]);
    setSelectedEditionId(null);
    setCurrentView('editions');
    showToast('Edition deleted');
  };

  // Edition Created from Upload or Library Template
  const handleEditionCreated = async (newEdition: Edition) => {
    await syncEngine.addEdition(newEdition);
    setEditions([...syncEngine.getEditions()]);
    setSelectedEditionId(newEdition.id);
    setCurrentView('editionDetail');
    showToast('Focus Edition created ✓');
  };

  // Reset to seeds
  const handleWipeData = async () => {
    const { INITIAL_SEEDS } = await import('../constants/seeds');
    const { saveOfflineEditions } = await import('../services/offline/storage');
    await saveOfflineEditions(INITIAL_SEEDS);
    setEditions(INITIAL_SEEDS);
    setSelectedEditionId(null);
    setCurrentView('dashboard');
    showToast('Data reset to default seeds');
  };

  // Unauthenticated screen
  if (!user) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <AuthScreen onAuthenticated={(u) => setUser(u)} />
      </SafeAreaView>
    );
  }

  // Navigation tabs
  const navTabs: { id: ScreenView; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '◧' },
    { id: 'editions', label: 'My Editions', icon: '📚' },
    { id: 'upload', label: 'Upload New', icon: '⬆️' },
    { id: 'library', label: 'Library', icon: '✨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <SafeAreaView
      style={[
        styles.appContainer,
        preferences.darkMode ? styles.darkTheme : styles.lightTheme,
        preferences.highContrast ? styles.highContrastTheme : null
      ]}
    >
      <View style={[styles.mainLayout, isDesktopOrTablet ? styles.rowLayout : styles.colLayout]}>
        {/* Desktop / Tablet Sidebar (Hidden in Focus Mode) */}
        {isDesktopOrTablet && !preferences.focusMode && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <View style={styles.brandIconBox}>
                <Text style={styles.brandIconText}>F</Text>
              </View>
              <View>
                <Text style={styles.brandTitleText}>Focus Edition</Text>
                <Text style={styles.brandVersionText}>v6 Cross-Platform</Text>
              </View>
            </View>

            <View style={styles.sidebarNav}>
              {navTabs.map(tab => {
                const isActive = currentView === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      setCurrentView(tab.id);
                      if (tab.id === 'editions') setSelectedEditionId(null);
                    }}
                    style={[styles.sidebarBtn, isActive ? styles.sidebarBtnActive : null]}
                  >
                    <Text style={styles.sidebarBtnIcon}>{tab.icon}</Text>
                    <Text style={[styles.sidebarBtnLabel, isActive ? styles.sidebarBtnLabelActive : null]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.sidebarUserText}>{user.name}</Text>
              <Text style={styles.sidebarUserSub}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Central Content Area */}
        <View style={styles.screenArea}>
          {/* Top Bar (Hidden in Focus Mode) */}
          {!preferences.focusMode && (
            <View style={styles.topBar}>
              <Text style={styles.screenTitleText}>
                {currentView === 'dashboard'
                  ? 'Dashboard'
                  : currentView === 'editions'
                  ? 'My Editions'
                  : currentView === 'upload'
                  ? 'Upload New'
                  : currentView === 'library'
                  ? 'Library & Templates'
                  : currentView === 'settings'
                  ? 'Settings'
                  : currentView === 'subscription'
                  ? 'Subscription'
                  : selectedEdition?.title || 'Edition'}
              </Text>

              <TouchableOpacity
                onPress={() => setCurrentView('upload')}
                style={styles.newDocBtn}
              >
                <Text style={styles.newDocBtnText}>+ New</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Active Screen View */}
          <View style={styles.viewContainer}>
            {currentView === 'dashboard' && (
              <DashboardScreen
                user={user}
                editions={editions}
                timer={timer}
                onOpenEdition={(id) => {
                  setSelectedEditionId(id);
                  setCurrentView('editionDetail');
                }}
                onNavigateUpload={() => setCurrentView('upload')}
                onNavigateEditions={() => setCurrentView('editions')}
                preferences={preferences}
              />
            )}

            {currentView === 'editions' && (
              <EditionsScreen
                editions={editions}
                onOpenEdition={(id) => {
                  setSelectedEditionId(id);
                  setCurrentView('editionDetail');
                }}
                onNavigateUpload={() => setCurrentView('upload')}
                preferences={preferences}
              />
            )}

            {currentView === 'editionDetail' && selectedEdition && (
              <EditionDetailScreen
                edition={selectedEdition}
                onBack={() => setCurrentView('editions')}
                onOpenMission={(mid) => {
                  setSelectedMissionId(mid);
                  setCurrentView('missionDetail');
                }}
                onToggleMission={(mid) => handleToggleMissionDone(selectedEdition.id, mid)}
                onMarkAll={handleMarkAll}
                onEnterFocusMode={() => handleUpdatePreferences({ focusMode: true })}
                onDuplicate={() => handleDuplicateEdition(selectedEdition.id)}
                onDelete={() => handleDeleteEdition(selectedEdition.id)}
                speakingMissionId={speakingMissionId}
                onToggleSpeakMission={handleToggleSpeakMission}
                preferences={preferences}
              />
            )}

            {currentView === 'missionDetail' && selectedEdition && selectedMission && (
              <MissionDetailScreen
                edition={selectedEdition}
                mission={selectedMission}
                onBack={() => setCurrentView('editionDetail')}
                onToggleDone={() => handleToggleMissionDone(selectedEdition.id, selectedMission.id)}
                onPrevMission={() => {
                  const idx = selectedEdition.missions.findIndex(m => m.id === selectedMission.id);
                  if (idx > 0) setSelectedMissionId(selectedEdition.missions[idx - 1].id);
                }}
                onNextMission={() => {
                  const idx = selectedEdition.missions.findIndex(m => m.id === selectedMission.id);
                  if (idx < selectedEdition.missions.length - 1) {
                    setSelectedMissionId(selectedEdition.missions[idx + 1].id);
                  } else {
                    showToast('All missions completed!');
                    setCurrentView('editionDetail');
                  }
                }}
                hasPrev={selectedEdition.missions.findIndex(m => m.id === selectedMission.id) > 0}
                hasNext={
                  selectedEdition.missions.findIndex(m => m.id === selectedMission.id) <
                  selectedEdition.missions.length - 1
                }
                isSpeaking={speakingMissionId === selectedMission.id}
                onToggleSpeak={() =>
                  handleToggleSpeakMission(selectedMission.id, `${selectedMission.title}. ${selectedMission.body}`)
                }
                onEnterFocusMode={() => handleUpdatePreferences({ focusMode: true })}
                preferences={preferences}
              />
            )}

            {currentView === 'upload' && (
              <UploadScreen
                onEditionCreated={handleEditionCreated}
                onCancel={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'library' && (
              <LibraryScreen
                onUseTemplate={handleEditionCreated}
              />
            )}

            {currentView === 'settings' && (
              <SettingsScreen
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                user={user}
                onToggleAiPrivacy={(allow) => {
                  setUser({ ...user, allowAiProcessing: allow });
                  showToast(allow ? 'AI Processing Enabled' : 'AI Processing Disabled (Private)');
                }}
                onNavigateSubscription={() => setCurrentView('subscription')}
                onLogout={() => {
                  ttsService.stop();
                  timer.pause();
                  setUser(null);
                }}
                onWipeData={handleWipeData}
              />
            )}

            {currentView === 'subscription' && (
              <SubscriptionScreen
                onBack={() => setCurrentView('settings')}
                onSubscriptionUpdated={() => {
                  setEditions([...syncEngine.getEditions()]);
                }}
              />
            )}
          </View>

          {/* Mobile Bottom Navigation Bar (Hidden in Focus Mode or on desktop) */}
          {!isDesktopOrTablet && !preferences.focusMode && (
            <View style={styles.bottomNav}>
              {navTabs.map(tab => {
                const isActive = currentView === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      setCurrentView(tab.id);
                      if (tab.id === 'editions') setSelectedEditionId(null);
                    }}
                    style={styles.bottomNavBtn}
                  >
                    <Text style={[styles.bottomNavIcon, isActive ? styles.bottomNavIconActive : null]}>
                      {tab.icon}
                    </Text>
                    <Text style={[styles.bottomNavLabel, isActive ? styles.bottomNavLabelActive : null]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Reading Ruler Overlay */}
      <ReadingRulerOverlay enabled={preferences.readingRuler} />

      {/* Focus Mode Exit Banner */}
      <FocusExitBanner
        visible={preferences.focusMode}
        onExit={() => handleUpdatePreferences({ focusMode: false })}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1
  },
  lightTheme: {
    backgroundColor: '#F7F7F9'
  },
  darkTheme: {
    backgroundColor: '#0F0F12'
  },
  highContrastTheme: {
    borderWidth: 1.5,
    borderColor: '#000000'
  },
  mainLayout: {
    flex: 1
  },
  rowLayout: {
    flexDirection: 'row'
  },
  colLayout: {
    flexDirection: 'column'
  },
  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    justifyContent: 'space-between'
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.line
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.brand,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900'
  },
  brandTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink
  },
  brandVersionText: {
    fontSize: 10,
    color: COLORS.muted
  },
  sidebarNav: {
    gap: 6,
    marginTop: 16
  },
  sidebarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  sidebarBtnActive: {
    backgroundColor: '#F0EFFF'
  },
  sidebarBtnIcon: {
    fontSize: 16
  },
  sidebarBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink
  },
  sidebarBtnLabelActive: {
    color: COLORS.brand,
    fontWeight: '800'
  },
  sidebarFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: COLORS.line
  },
  sidebarUserText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink
  },
  sidebarUserSub: {
    fontSize: 11,
    color: COLORS.muted
  },
  screenArea: {
    flex: 1
  },
  topBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  screenTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink
  },
  newDocBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  newDocBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  viewContainer: {
    flex: 1
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  bottomNavBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4
  },
  bottomNavIcon: {
    fontSize: 18,
    color: COLORS.muted
  },
  bottomNavIconActive: {
    color: COLORS.brand
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: 2
  },
  bottomNavLabelActive: {
    color: COLORS.brand,
    fontWeight: '800'
  },
  toastWrap: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999
  },
  toastBox: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  }
});
