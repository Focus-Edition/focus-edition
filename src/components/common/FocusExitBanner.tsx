import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';

interface FocusExitBannerProps {
  visible: boolean;
  onExit: () => void;
}

export const FocusExitBanner: React.FC<FocusExitBannerProps> = ({ visible, onExit }) => {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onExit}
        style={styles.pill}
        accessibilityRole="button"
        accessibilityLabel="Exit Focus Mode"
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✕</Text>
        </View>
        <Text style={styles.pillText}>Exit Focus Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10000
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    gap: 10
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: '900'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
