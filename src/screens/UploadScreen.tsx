import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ingestDocument } from '../services/ingestion/documentIngestion';
import { generateMissionsFromIngestion } from '../services/generators/missionGenerator';
import { Edition } from '../types/mission';
import { COLORS } from '../constants/theme';
import { ProgressBar } from '../components/common/ProgressBar';

interface UploadScreenProps {
  onEditionCreated: (edition: Edition) => void;
  onCancel: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onEditionCreated,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    buffer?: any;
    text?: string;
    mimeType?: string;
  } | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loadingStage, setLoadingStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [generatedEdition, setGeneratedEdition] = useState<Edition | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  // Handle Document Picker (PDF, DOCX, TXT, MD, HTML)
  const handlePickDocument = async () => {
    try {
      setErrorMsg(null);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        // Read file content if on web / mobile
        const resp = await fetch(file.uri);
        const arrayBuf = await resp.arrayBuffer();

        setSelectedFile({
          name: file.name,
          buffer: Buffer.from(arrayBuf),
          mimeType: file.mimeType || undefined
        });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to select document: ${err?.message || err}`);
    }
  };

  // Handle Photo Picker (Camera / Gallery OCR)
  const handlePickImage = async () => {
    try {
      setErrorMsg(null);
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const resp = await fetch(asset.uri);
        const arrayBuf = await resp.arrayBuffer();

        setSelectedFile({
          name: asset.fileName || 'photo_document.jpg',
          buffer: Buffer.from(arrayBuf),
          mimeType: asset.mimeType || 'image/jpeg'
        });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to select image: ${err?.message || err}`);
    }
  };

  // Use preloaded test sample
  const handleUseSample = () => {
    setErrorMsg(null);
    const sampleTxt = `ACCESS TO WORK STATUTORY GRANT GUIDANCE
SECTION 1: OVERVIEW AND GRANT PURPOSE
Access to Work is a publicly funded employment support programme that helps individuals with disabilities, neurodivergence (including ADHD and Autism), and mental health conditions to start work, remain in work, or move into self-employment. The grant covers practical support beyond what employers are legally required to provide as reasonable adjustments under the Equality Act 2010. Crucially, Access to Work awards are non-repayable grants, not loans.

SECTION 2: ELIGIBILITY CRITERIA
To qualify for Access to Work assistance, applicants must meet the following statutory requirements:
1. Be aged 16 years or older.
2. Normally live and work in England, Scotland, or Wales.
3. Have a condition that impacts your ability to do your job.
4. Have paid employment starting within 4 weeks, be currently in paid work, or be registered as self-employed.
A formal diagnosis is not required. Eligibility is evaluated based on functional workplace barriers.

SECTION 3: FUNDED SUPPORT AND ANNUAL CAPS
Since April 2026, the maximum annual Access to Work grant award is capped at £69,260 per financial year. Funded categories include specialist equipment, job coaches, note-takers, and taxi fares. Claimants have 9 months from expenditure to submit reimbursement receipts electronically.`;

    setSelectedFile({
      name: 'access_to_work_guidance.txt',
      text: sampleTxt,
      mimeType: 'text/plain'
    });
    setPastedText(sampleTxt);
  };

  // Run the real Ingestion & Generator Pipeline!
  const handleStartConversion = async () => {
    try {
      setErrorMsg(null);
      setStep(2);
      setProgress(15);
      setLoadingStage('Analyzing file and detecting structure...');

      const input = selectedFile?.buffer
        ? { name: selectedFile.name, buffer: selectedFile.buffer, mimeType: selectedFile.mimeType }
        : {
            name: selectedFile?.name || 'Pasted Document.txt',
            text: pastedText || selectedFile?.text || '',
            mimeType: 'text/plain'
          };

      if (!input.buffer && (!input.text || input.text.trim().length < 30)) {
        throw new Error('Please select a file or paste at least 30 characters of text.');
      }

      setProgress(35);
      setLoadingStage('Extracting sections, headings, and character offsets...');

      const ingestion = await ingestDocument(input);

      setProgress(65);
      setLoadingStage('Generating source-grounded ADHD missions...');

      const edition = generateMissionsFromIngestion(ingestion);

      setProgress(90);
      setLoadingStage('Validating quizzes and flashcard citations...');

      setGeneratedEdition(edition);
      setCustomTitle(edition.title);
      setCustomDesc(edition.description);
      setProgress(100);

      setTimeout(() => {
        setStep(3);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process document.');
      setStep(1);
    }
  };

  const handleSave = () => {
    if (!generatedEdition) return;
    const finalEdition: Edition = {
      ...generatedEdition,
      title: customTitle.trim() || generatedEdition.title,
      description: customDesc.trim() || generatedEdition.description
    };
    onEditionCreated(finalEdition);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      {/* Wizard Stepper Header */}
      <View style={styles.stepperHeader}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 1 ? styles.stepCircleActive : styles.stepCircleIdle]}>
            <Text style={[styles.stepNum, step >= 1 ? styles.stepNumActive : styles.stepNumIdle]}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Upload</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 2 ? styles.stepCircleActive : styles.stepCircleIdle]}>
            <Text style={[styles.stepNum, step >= 2 ? styles.stepNumActive : styles.stepNumIdle]}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Convert</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 3 ? styles.stepCircleActive : styles.stepCircleIdle]}>
            <Text style={[styles.stepNum, step >= 3 ? styles.stepNumActive : styles.stepNumIdle]}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Review</Text>
        </View>
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Conversion Error</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Upload any document or photo</Text>
          <Text style={styles.cardSub}>
            Real extraction for TXT, Markdown, HTML, PDF, Scanned PDF, DOCX, and photos with OCR.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickDocument}
            style={styles.dropZone}
          >
            <View style={styles.dropIconBox}>
              <Text style={styles.dropIcon}>📄</Text>
            </View>
            <Text style={styles.dropMainText}>
              {selectedFile?.name ? `Selected: ${selectedFile.name}` : 'Tap to select document'}
            </Text>
            <Text style={styles.dropSubText}>
              PDF, DOCX, Markdown, HTML, TXT
            </Text>
          </TouchableOpacity>

          <View style={styles.pickerRow}>
            <TouchableOpacity onPress={handlePickImage} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>📷 Photo / OCR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleUseSample} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>✨ Use Real Sample</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pasteSection}>
            <Text style={styles.pasteLabel}>Or paste document text directly:</Text>
            <TextInput
              multiline
              numberOfLines={6}
              value={pastedText}
              onChangeText={(t) => {
                setPastedText(t);
                if (t.length > 20 && !selectedFile) {
                  setSelectedFile({ name: 'Pasted Document.txt', text: t, mimeType: 'text/plain' });
                }
              }}
              placeholder="Paste contracts, factsheets, guides, or policies here..."
              placeholderTextColor={COLORS.muted}
              style={styles.pasteInput}
            />
          </View>

          <TouchableOpacity
            disabled={!selectedFile && pastedText.trim().length < 30}
            onPress={handleStartConversion}
            style={[
              styles.primaryBtn,
              !selectedFile && pastedText.trim().length < 30 ? styles.btnDisabled : styles.btnEnabled
            ]}
          >
            <Text style={styles.primaryBtnText}>Continue → Convert to Missions</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Ingestion & Conversion Progress */}
      {step === 2 && (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <ActivityIndicator size="large" color={COLORS.brand} style={{ marginBottom: 20 }} />
          <Text style={styles.convertingTitle}>Converting Document</Text>
          <Text style={styles.convertingStage}>{loadingStage}</Text>

          <ProgressBar progress={progress} height={8} color={COLORS.brand} style={{ width: '80%', marginVertical: 18 }} />

          <Text style={styles.progressPctText}>{progress}% complete</Text>
          <Text style={styles.pipelineNote}>
            Grounded local extraction · Detecting headings · Creating traceable quizzes
          </Text>
        </View>
      )}

      {/* Step 3: Review & Save */}
      {step === 3 && generatedEdition && (
        <View style={styles.card}>
          <View style={styles.readyHeader}>
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>✓ Ready</Text>
            </View>
            <Text style={styles.readyTitle}>Focus Edition Generated!</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              📊 <Text style={{ fontWeight: '800' }}>{generatedEdition.totalMissions} missions</Text> created
              · 🕒 <Text style={{ fontWeight: '800' }}>{generatedEdition.totalTimeEstimateMinutes} min</Text> estimated
              focus time
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Edition Title</Text>
            <TextInput
              value={customTitle}
              onChangeText={setCustomTitle}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={customDesc}
              onChangeText={setCustomDesc}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            />
          </View>

          <TouchableOpacity onPress={handleSave} style={[styles.primaryBtn, styles.btnEnabled]}>
            <Text style={styles.primaryBtnText}>Save to My Editions & Start</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      )}
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
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  stepIndicator: {
    alignItems: 'center'
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  stepCircleIdle: {
    backgroundColor: '#EEF0FF'
  },
  stepCircleActive: {
    backgroundColor: COLORS.brand
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800'
  },
  stepNumIdle: {
    color: COLORS.brand
  },
  stepNumActive: {
    color: '#FFFFFF'
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.line,
    marginHorizontal: 12,
    marginBottom: 16
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.danger,
    marginBottom: 2
  },
  errorText: {
    fontSize: 12,
    color: COLORS.ink
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 4
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 18
  },
  dropZone: {
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D4C9FF',
    backgroundColor: '#FAFAFB',
    padding: 24,
    alignItems: 'center',
    marginBottom: 14
  },
  dropIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  dropIcon: {
    fontSize: 22
  },
  dropMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center'
  },
  dropSubText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18
  },
  secondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink
  },
  pasteSection: {
    marginBottom: 18
  },
  pasteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 6
  },
  pasteInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#FAFAFB',
    padding: 12,
    fontSize: 13,
    color: COLORS.ink,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  primaryBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  btnEnabled: {
    backgroundColor: COLORS.brand
  },
  btnDisabled: {
    backgroundColor: '#D1D5DB'
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  cancelBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBtnText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600'
  },
  convertingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 6
  },
  convertingStage: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center'
  },
  progressPctText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 6
  },
  pipelineNote: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 280
  },
  readyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14
  },
  readyBadge: {
    backgroundColor: COLORS.okBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  readyBadgeText: {
    color: COLORS.ok,
    fontWeight: '800',
    fontSize: 12
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink
  },
  summaryBox: {
    backgroundColor: '#F0EFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.brand,
    lineHeight: 18
  },
  formGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 6
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
    backgroundColor: '#FAFAFB'
  }
});
