import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { subscriptionService, SUBSCRIPTION_PLANS, SubscriptionPlanId } from '../services/subscriptions/subscriptionService';
import { COLORS } from '../constants/theme';

interface SubscriptionScreenProps {
  onBack: () => void;
  onSubscriptionUpdated: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onSubscriptionUpdated
}) => {
  const [state, setState] = useState(subscriptionService.getState());
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('annual_pro');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await subscriptionService.purchasePlan(selectedPlan);
      setState(res.state);
      onSubscriptionUpdated();
      Alert.alert('Subscription Activated', `Welcome to Focus Edition Pro! Receipt: ${res.state.receiptToken}`);
    } catch (err: any) {
      Alert.alert('Purchase Error', err?.message || 'Failed to complete transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const res = await subscriptionService.restorePurchases();
      setState(res.state);
      onSubscriptionUpdated();
      if (res.restored) {
        Alert.alert('Purchases Restored', 'Your Pro entitlement has been restored successfully.');
      } else {
        Alert.alert('No Subscriptions Found', 'No previous active purchases were detected for this account.');
      }
    } catch (err: any) {
      Alert.alert('Restore Error', err?.message || 'Failed to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    subscriptionService.cancelSubscription();
    setState(subscriptionService.getState());
    onSubscriptionUpdated();
    Alert.alert('Subscription Canceled', 'Your plan has been reverted to the Free tier.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Settings</Text>
      </TouchableOpacity>

      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.proPill}>
          <Text style={styles.proPillText}>FOCUS EDITION PRO</Text>
        </View>
        <Text style={styles.heroTitle}>Deconstruct Every Document You Face</Text>
        <Text style={styles.heroSub}>
          Full OCR for multi-page PDF factsheets, scanned handbooks, contracts, and letters.
        </Text>
      </View>

      {/* Feature Comparison */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        {[
          { feature: 'Active Document Workspaces', free: 'Up to 3', pro: 'Unlimited' },
          { feature: 'Scanned PDF & Photo OCR', free: 'Limited', pro: 'Full Offline OCR' },
          { feature: 'Text-to-Speech Audio Toggle', free: '✓', pro: '✓ (High Fidelity)' },
          { feature: 'Private Cloud Storage & Sync', free: 'Local only', pro: 'Supabase Sync' },
          { feature: 'ADHD Quizzes & Flashcards', free: 'Basic', pro: 'Full Grounding' }
        ].map((item, idx) => (
          <View key={idx} style={styles.compRow}>
            <Text style={styles.compFeature}>{item.feature}</Text>
            <View style={styles.compValues}>
              <Text style={styles.compFree}>{item.free}</Text>
              <Text style={styles.compPro}>{item.pro}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Plan Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Choose a Plan</Text>

        {SUBSCRIPTION_PLANS.map(p => {
          const isSelected = selectedPlan === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.8}
              onPress={() => setSelectedPlan(p.id)}
              style={[styles.planCard, isSelected ? styles.planSelected : styles.planIdle]}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planPrice}>{p.priceFormatted}</Text>
              </View>
              <Text style={styles.planDesc}>{p.description}</Text>
              <Text style={styles.planTrial}>🎁 {p.trialDays}-day free trial included</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          disabled={loading}
          onPress={handlePurchase}
          style={styles.purchaseBtn}
        >
          <Text style={styles.purchaseBtnText}>
            {state.tier === 'pro' && state.isActive
              ? 'Update Active Subscription'
              : 'Start 7-Day Free Trial →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreBtnText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      {/* Test Mode Sandbox Toggle */}
      <View style={[styles.card, { borderColor: '#E0D8FF' }]}>
        <View style={styles.testModeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.testModeTitle}>🛠️ App Store Sandbox / Test Mode</Text>
            <Text style={styles.testModeSub}>
              Simulates Apple StoreKit & Google Play Billing receipt issuance without charging real cards.
            </Text>
          </View>
          <Switch
            value={state.isTestMode}
            onValueChange={(val) => {
              subscriptionService.setTestMode(val);
              setState(subscriptionService.getState());
            }}
            trackColor={{ false: COLORS.line, true: COLORS.brand }}
          />
        </View>

        {state.tier === 'pro' && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Simulate Cancellation / Revert to Free</Text>
          </TouchableOpacity>
        )}
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
  backBtn: {
    paddingVertical: 8
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted
  },
  heroCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    padding: 22,
    alignItems: 'flex-start'
  },
  proPill: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10
  },
  proPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 6
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 14
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F2F6'
  },
  compFeature: {
    fontSize: 13,
    color: COLORS.ink,
    fontWeight: '600',
    flex: 1
  },
  compValues: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  compFree: {
    fontSize: 12,
    color: COLORS.muted
  },
  compPro: {
    fontSize: 12,
    color: COLORS.brand,
    fontWeight: '800'
  },
  planCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    marginBottom: 12
  },
  planIdle: {
    borderColor: COLORS.line,
    backgroundColor: '#FAFAFB'
  },
  planSelected: {
    borderColor: COLORS.brand,
    backgroundColor: '#F0EFFF'
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink
  },
  planPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brand
  },
  planDesc: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
    marginBottom: 6
  },
  planTrial: {
    fontSize: 11,
    color: COLORS.ok,
    fontWeight: '700'
  },
  purchaseBtn: {
    backgroundColor: COLORS.brand,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10
  },
  purchaseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  restoreBtn: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  restoreBtnText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600'
  },
  testModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  testModeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.ink
  },
  testModeSub: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
    marginTop: 2
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700'
  }
});
