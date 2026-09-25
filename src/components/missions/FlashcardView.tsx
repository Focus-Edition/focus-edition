import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flashcard } from '../../types/mission';
import { COLORS } from '../../constants/theme';
import { BionicText } from './BionicText';
import { UserAccessibilityPreferences } from '../../types/user';
import { SourceModal } from '../common/SourceModal';

interface FlashcardViewProps {
  card: Flashcard;
  index: number;
  preferences?: UserAccessibilityPreferences;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  card,
  index,
  preferences
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSource, setShowSource] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsFlipped(!isFlipped)}
        style={[
          styles.card,
          isFlipped ? styles.cardFlipped : styles.cardFront
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardBadge}>
            {isFlipped ? 'ANSWER / FACT' : `CARD ${index + 1}`}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setShowSource(true);
            }}
            style={styles.sourceBtn}
          >
            <Text style={styles.sourceBtnText}>🔍 Source</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <BionicText
            preferences={preferences}
            style={isFlipped ? styles.bodyTextAnswer : styles.bodyTextQuestion}
          >
            {isFlipped ? card.back : card.front}
          </BionicText>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.flipHint}>
            {isFlipped ? '↩ Tap to flip back' : '💡 Tap to reveal answer'}
          </Text>
        </View>
      </TouchableOpacity>

      <SourceModal
        visible={showSource}
        onClose={() => setShowSource(false)}
        sourceReference={card.sourceReference}
        itemTitle={`Source Grounding for Flashcard ${index + 1}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12
  },
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
    borderWidth: 1.5
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.line
  },
  cardFlipped: {
    backgroundColor: '#F0EFFF',
    borderColor: '#D4C9FF'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.brand,
    letterSpacing: 0.5
  },
  sourceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(109, 74, 255, 0.1)'
  },
  sourceBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand
  },
  cardBody: {
    marginVertical: 12
  },
  bodyTextQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 22
  },
  bodyTextAnswer: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.ink,
    lineHeight: 22
  },
  cardFooter: {
    borderTopWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 8
  },
  flipHint: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600'
  }
});
