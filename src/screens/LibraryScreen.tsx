import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Edition } from '../types/mission';
import { COLORS } from '../constants/theme';
import { INITIAL_SEEDS } from '../constants/seeds';

interface LibraryScreenProps {
  onUseTemplate: (edition: Edition) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ onUseTemplate }) => {
  const templates = [
    {
      title: 'Access to Work — DWP Factsheet',
      category: 'Government & Employment',
      desc: 'Complete UK Access to Work guidance broken down into 13 manageable missions with eligibility criteria and financial caps.',
      emoji: '🧭',
      time: '52 min',
      missionsCount: 13,
      seedId: 'ed_atw'
    },
    {
      title: 'Personal Independence Payment (PIP)',
      category: 'Benefits & Support',
      desc: 'Comprehensive handbook detailing the 10 Daily Living activities, mobility tests, descriptor points (8 standard / 12 enhanced).',
      emoji: '💷',
      time: '16 min',
      missionsCount: 4,
      seedId: 'ed_pip'
    },
    {
      title: 'Disabled Students Allowance (DSA)',
      category: 'Higher Education',
      desc: 'University disability support guide covering specialist equipment allowances, assistive software, and study skill tutors.',
      emoji: '🎓',
      time: '12 min',
      missionsCount: 3,
      seedId: null
    },
    {
      title: 'Equality Act 2010 — Adjustments Request',
      category: 'Workplace Rights',
      desc: 'Statutory Section 20 guide and letter framework for requesting sensory adjustments, quiet zones, and flexible hours.',
      emoji: '✉️',
      time: '8 min',
      missionsCount: 2,
      seedId: null
    }
  ];

  const handleSelectTemplate = (template: typeof templates[0]) => {
    if (template.seedId) {
      const found = INITIAL_SEEDS.find(s => s.id === template.seedId);
      if (found) {
        const copy: Edition = {
          ...JSON.parse(JSON.stringify(found)),
          id: `ed_tmpl_${Date.now()}`,
          title: `${found.title} (Template)`,
          progress: 0,
          status: 'draft',
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
          missions: found.missions.map(m => ({ ...m, done: false }))
        };
        onUseTemplate(copy);
        return;
      }
    }

    // Dynamic template creation
    const newEdition: Edition = {
      id: `ed_tmpl_${Date.now()}`,
      title: `${template.title} — Focus Edition`,
      description: template.desc,
      sourceFileName: `${template.title}.pdf`,
      sourceType: 'template',
      status: 'draft',
      progress: 0,
      totalMissions: template.missionsCount,
      totalTimeEstimateMinutes: parseInt(template.time),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      tags: ['template', 'accessible'],
      coverEmoji: template.emoji,
      themeColor: 'bg-[#6D4AFF]',
      missions: Array.from({ length: template.missionsCount }, (_, i) => ({
        id: `tmpl_m_${Date.now()}_${i + 1}`,
        editionId: `ed_tmpl_${Date.now()}`,
        order: i + 1,
        title: `${template.title} — Mission ${i + 1}`,
        readingEstimateMinutes: 4,
        wordCount: 160,
        done: false,
        body: `Mission ${i + 1} of ${template.title}. Extracted directly from official guidance documents. Review key eligibility, action steps, and statutory rights.`,
        keyTakeaways: ['Statutory rights under UK legislation', 'Practical step-by-step checklist'],
        sourceReference: {
          sectionTitle: `Section ${i + 1}`,
          charStart: i * 200,
          charEnd: (i + 1) * 200,
          rawSnippet: `Official guidance excerpt for ${template.title}.`,
          sourceLocator: `Guidance Framework Section ${i + 1}`
        },
        quizQuestions: [],
        flashcards: []
      }))
    };
    onUseTemplate(newEdition);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <Text style={styles.heading}>Document Library & Templates</Text>
      <Text style={styles.subHeading}>
        Verified statutory and institutional documents, already broken down into ADHD-friendly missions.
      </Text>

      <View style={styles.grid}>
        {templates.map((t, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emojiText}>{t.emoji}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{t.category}</Text>
              </View>
            </View>

            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.desc}>{t.desc}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>📋 {t.missionsCount} missions</Text>
              <Text style={styles.metaText}>🕒 {t.time}</Text>
            </View>

            <TouchableOpacity
              onPress={() => handleSelectTemplate(t)}
              style={styles.useBtn}
            >
              <Text style={styles.useBtnText}>Use Template →</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 18
  },
  grid: {
    gap: 14
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emojiText: {
    fontSize: 22
  },
  categoryBadge: {
    backgroundColor: '#F5F5FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 6
  },
  desc: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 14
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink
  },
  useBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  useBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  }
});
