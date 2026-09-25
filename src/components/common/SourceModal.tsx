import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { SourceReference } from '../../types/document';
import { COLORS } from '../../constants/theme';
import { Button } from './Button';

interface SourceModalProps {
  visible: boolean;
  onClose: () => void;
  sourceReference?: SourceReference;
  itemTitle?: string;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  visible,
  onClose,
  sourceReference,
  itemTitle = 'Source Evidence'
}) => {
  if (!sourceReference) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Source Grounded</Text>
              </View>
              {sourceReference.pageNumber && (
                <View style={styles.pageBadge}>
                  <Text style={styles.pageBadgeText}>Page {sourceReference.pageNumber}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentPadding}>
            <Text style={styles.title}>{itemTitle}</Text>
            <Text style={styles.locatorText}>📍 {sourceReference.sourceLocator}</Text>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteLabel}>EXACT VERBATIM SOURCE EXTRACT</Text>
              <Text style={styles.quoteBody}>"{sourceReference.rawSnippet}"</Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaRow}>
                <Text style={styles.metaKey}>Section: </Text>
                <Text style={styles.metaVal}>{sourceReference.sectionTitle || 'General'}</Text>
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaKey}>Character Offset: </Text>
                <Text style={styles.metaVal}>{sourceReference.charStart} – {sourceReference.charEnd}</Text>
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaKey}>Document Integrity: </Text>
                <Text style={styles.metaVal}>100% Traceable (Zero Artificial Content)</Text>
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Close Source View" onPress={onClose} variant="ink" style={{ width: '100%' }} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 19, 26, 0.65)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.line
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  verifiedBadge: {
    backgroundColor: COLORS.okBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  verifiedText: {
    color: COLORS.ok,
    fontWeight: '700',
    fontSize: 12
  },
  pageBadge: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  pageBadgeText: {
    color: COLORS.brand,
    fontWeight: '600',
    fontSize: 12
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink
  },
  contentScroll: {
    paddingHorizontal: 20
  },
  contentPadding: {
    paddingVertical: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 4
  },
  locatorText: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 16
  },
  quoteCard: {
    backgroundColor: '#FAFAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0D8FF',
    padding: 16,
    marginBottom: 16
  },
  quoteLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.brand,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  quoteBody: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.ink,
    fontStyle: 'italic'
  },
  metaBox: {
    backgroundColor: '#F7F7F9',
    borderRadius: 12,
    padding: 12,
    gap: 6
  },
  metaRow: {
    fontSize: 12,
    color: COLORS.ink
  },
  metaKey: {
    fontWeight: '700',
    color: COLORS.muted
  },
  metaVal: {
    fontWeight: '600'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.line
  }
});
