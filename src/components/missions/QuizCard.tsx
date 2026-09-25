import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { QuizQuestion } from '../../types/mission';
import { COLORS } from '../../constants/theme';
import { BionicText } from './BionicText';
import { UserAccessibilityPreferences } from '../../types/user';
import { SourceModal } from '../common/SourceModal';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  preferences?: UserAccessibilityPreferences;
  onCorrectAnswer?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  index,
  preferences,
  onCorrectAnswer
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  const selectedOption = question.options.find(o => o.id === selectedOptionId);
  const isAnswered = selectedOptionId !== null;
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelect = (optionId: string, isOptCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    if (isOptCorrect && onCorrectAnswer) {
      onCorrectAnswer();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.questionHeader}>
        <Text style={styles.qNum}>QUESTION {index + 1}</Text>
        <TouchableOpacity
          onPress={() => setShowSource(true)}
          style={styles.sourceBtn}
          accessibilityLabel="Show source evidence"
        >
          <Text style={styles.sourceBtnText}>🔍 Show Source</Text>
        </TouchableOpacity>
      </View>

      <BionicText preferences={preferences} style={styles.questionText}>
        {question.question}
      </BionicText>

      <View style={styles.optionsList}>
        {question.options.map((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const isSelected = selectedOptionId === opt.id;
          let btnBg = '#FFFFFF';
          let borderCol = COLORS.line;

          if (isAnswered) {
            if (opt.isCorrect) {
              btnBg = COLORS.okBg;
              borderCol = COLORS.ok;
            } else if (isSelected && !opt.isCorrect) {
              btnBg = '#FFF0F0';
              borderCol = COLORS.danger;
            }
          }

          return (
            <TouchableOpacity
              key={opt.id}
              disabled={isAnswered}
              onPress={() => handleSelect(opt.id, opt.isCorrect)}
              style={[
                styles.optionBtn,
                { backgroundColor: btnBg, borderColor: borderCol }
              ]}
            >
              <Text style={styles.optionLetter}>{letter}</Text>
              <View style={styles.optionContent}>
                <BionicText preferences={preferences} style={styles.optionText}>
                  {opt.text}
                </BionicText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAnswered && (
        <View style={[styles.feedbackBox, isCorrect ? styles.correctBox : styles.wrongBox]}>
          <Text style={[styles.feedbackTitle, isCorrect ? styles.correctText : styles.wrongText]}>
            {isCorrect ? '✓ Correct! +1 Point' : '✗ Not quite'}
          </Text>
          <Text style={styles.feedbackBody}>{question.explanation}</Text>
        </View>
      )}

      <SourceModal
        visible={showSource}
        onClose={() => setShowSource(false)}
        sourceReference={question.sourceReference}
        itemTitle={`Source Grounding for Question ${index + 1}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 16
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  qNum: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5
  },
  sourceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#EEF0FF'
  },
  sourceBtnText: {
    fontSize: 11,
    color: COLORS.brand,
    fontWeight: '700'
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 22,
    marginBottom: 14
  },
  optionsList: {
    gap: 8
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5
  },
  optionLetter: {
    width: 24,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.brand
  },
  optionContent: {
    flex: 1
  },
  optionText: {
    fontSize: 13,
    color: COLORS.ink,
    lineHeight: 18
  },
  feedbackBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  correctBox: {
    backgroundColor: COLORS.okBg,
    borderColor: COLORS.ok
  },
  wrongBox: {
    backgroundColor: '#FFF0F0',
    borderColor: COLORS.danger
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4
  },
  correctText: {
    color: COLORS.ok
  },
  wrongText: {
    color: COLORS.danger
  },
  feedbackBody: {
    fontSize: 12,
    color: COLORS.ink,
    lineHeight: 18
  }
});
