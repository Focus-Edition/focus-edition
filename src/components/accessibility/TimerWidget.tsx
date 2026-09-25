import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FocusTimer } from '../../services/accessibility/focusTimer';
import { COLORS } from '../../constants/theme';
import { ProgressBar } from '../common/ProgressBar';

interface TimerWidgetProps {
  timer: FocusTimer;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ timer }) => {
  const [formatted, setFormatted] = useState(timer.getFormattedTime());
  const [progress, setProgress] = useState(timer.getProgressPercentage());
  const [state, setState] = useState(timer.getState());

  useEffect(() => {
    const unsubscribe = timer.subscribe({
      onTick: (_rem, fmt, pct) => {
        setFormatted(fmt);
        setProgress(pct);
        setState(timer.getState());
      },
      onComplete: () => {
        setState('completed');
      }
    });

    return unsubscribe;
  }, [timer]);

  const handleToggle = () => {
    if (state === 'running') {
      timer.pause();
      setState('paused');
    } else {
      timer.start();
      setState('running');
    }
  };

  const handleSelectMinutes = (m: number) => {
    timer.setDuration(m);
    setFormatted(timer.getFormattedTime());
    setProgress(0);
    setState('idle');
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>FOCUS TIMER</Text>
        <Text style={styles.stateLabel}>
          {state === 'running' ? '● FOCUSING' : state === 'paused' ? '⏸ PAUSED' : 'READY'}
        </Text>
      </View>

      <Text style={styles.timeText}>{formatted}</Text>

      <ProgressBar progress={progress} height={6} color={COLORS.brand} style={{ marginVertical: 10 }} />

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={handleToggle}
          style={[styles.mainBtn, state === 'running' ? styles.pauseBtn : styles.startBtn]}
        >
          <Text style={styles.mainBtnText}>
            {state === 'running' ? '⏸ Pause' : '▶ Start Focus'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => timer.reset()} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>↺ Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.intervalRow}>
        {[15, 25, 35, 50].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => handleSelectMinutes(m)}
            style={styles.intervalPill}
          >
            <Text style={styles.intervalText}>{m}m</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5
  },
  stateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand
  },
  timeText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.ink,
    marginTop: 4
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  mainBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  startBtn: {
    backgroundColor: COLORS.ink
  },
  pauseBtn: {
    backgroundColor: COLORS.brand
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  resetBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resetBtnText: {
    color: COLORS.muted,
    fontWeight: '600',
    fontSize: 12
  },
  intervalRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10
  },
  intervalPill: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  intervalText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink
  }
});
