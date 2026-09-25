import React, { useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

interface ReadingRulerOverlayProps {
  enabled: boolean;
}

export const ReadingRulerOverlay: React.FC<ReadingRulerOverlayProps> = ({ enabled }) => {
  const [topPosition, setTopPosition] = useState(250);

  if (!enabled) return null;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_evt, gestureState) => {
      setTopPosition(Math.max(80, gestureState.moveY - 20));
    }
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.ruler,
        { top: topPosition }
      ]}
      pointerEvents="box-none"
    />
  );
};

const styles = StyleSheet.create({
  ruler: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: 'rgba(109, 74, 255, 0.16)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(109, 74, 255, 0.4)',
    zIndex: 9999
  }
});
