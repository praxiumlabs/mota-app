/**
 * =====================================================
 * MOTA PAYMENT SYSTEM
 * =====================================================
 * 
 * Payment Hierarchy:
 * 1. Debit/Credit Card / Bank
 * 2. Credit Line (Crown Jewel feature)
 * 3. MOTA Equity (buyback mechanism)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#182952',
  gold: '#D4AF37',
  goldLight: '#E8C547',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
  success: '#48BB78',
  error: '#FC8181',
  warning: '#F6AD55',
};

const G = {
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
};


// =====================================================
// PAYMENT METHOD TYPES
// =====================================================
export const PaymentMethodType = {
  CARD: 'card',
  BANK: 'bank',
  CREDIT_LINE: 'credit_line',
  EQUITY: 'equity',
};


// =====================================================
// PAYMENT METHOD SELECTOR
// =====================================================
export const PaymentMethodSelector = ({
  methods = [],
  selectedMethod,
  onSelectMethod,
  user,
  amount = 0,
  showEquityOption = true,
}) => {
  const creditLineAvailable = user?.investorTier && user?.creditLineLimit > 0;
  const creditLineBalance = user?.creditLineLimit - (user?.creditLineUsed || 0);
  
  const equityAvailable = user?.investorTier && user?.equityValue > 0;
  const equityValue = user?.equityValue || 0;
  
  // Current equity exchange rate (fixed daily)
  const equityExchangeRate = user?.equityExchangeRate || 1.0;

  const renderMethodCard = (method) => {
    const isSelected = selectedMethod?.id === method.id;
    const isCard = method.type === PaymentMethodType.CARD;
    const isBank = method.type === PaymentMethodType.BANK;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          payStyles.methodCard,
          isSelected && payStyles.methodCardSelected,
        ]}
        onPress={() => onSelectMethod(method)}
      >
        <View style={payStyles.methodIcon}>
          <Ionicons 
            name={isBank ? 'business' : 'card'} 
            size={24} 
            color={isSelected ? C.gold : C.textSec} 
          />
        </View>
        <View style={payStyles.methodInfo}>
          <Text style={payStyles.methodName}>
            {method.brand || method.bankName || 'Card'} •••• {method.last4}
          </Text>
          <Text style={payStyles.methodDetail}>
            {isCard ? `Expires ${method.expiry}` : method.accountType || 'Checking'}
          </Text>
        </View>
        {method.isDefault && (
          <View style={payStyles.defaultBadge}>
            <Text style={payStyles.defaultText}>Default</Text>
          </View>
        )}
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={C.gold} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={payStyles.container}>
      <Text style={payStyles.sectionTitle}>Payment Method</Text>
      
      {/* Saved Cards & Banks */}
      {methods.length > 0 && (
        <View style={payStyles.section}>
          <Text style={payStyles.sectionLabel}>Saved Methods</Text>
          {methods.map(renderMethodCard)}
        </View>
      )}

      {/* Credit Line Option (Crown Jewel Feature) */}
      {creditLineAvailable && (
        <View style={payStyles.section}>
          <Text style={payStyles.sectionLabel}>Investor Credit</Text>
          <TouchableOpacity
            style={[
              payStyles.methodCard,
              payStyles.creditLineCard,
              selectedMethod?.type === PaymentMethodType.CREDIT_LINE && payStyles.methodCardSelected,
              creditLineBalance < amount && payStyles.methodCardDisabled,
            ]}
            onPress={() => creditLineBalance >= amount && onSelectMethod({
              id: 'credit_line',
              type: PaymentMethodType.CREDIT_LINE,
              name: 'MOTA Credit Line',
            })}
            disabled={creditLineBalance < amount}
          >
            <LinearGradient 
              colors={creditLineBalance >= amount ? G.gold : ['#444', '#333']} 
              style={payStyles.creditLineIcon}
            >
              <Ionicons name="diamond" size={20} color={creditLineBalance >= amount ? C.bg : C.textMuted} />
            </LinearGradient>
            <View style={payStyles.methodInfo}>
              <Text style={payStyles.methodName}>MOTA Credit Line</Text>
              <Text style={payStyles.methodDetail}>
                Available: ${creditLineBalance.toLocaleString()}
              </Text>
              {creditLineBalance < amount && (
                <Text style={payStyles.insufficientText}>Insufficient credit</Text>
              )}
            </View>
            <View style={payStyles.crownJewelBadge}>
              <Text style={payStyles.crownJewelText}>Crown Jewel</Text>
            </View>
            {selectedMethod?.type === PaymentMethodType.CREDIT_LINE && (
              <Ionicons name="checkmark-circle" size={24} color={C.gold} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* MOTA Equity Option */}
      {showEquityOption && equityAvailable && (
        <View style={payStyles.section}>
          <Text style={payStyles.sectionLabel}>Pay with Equity</Text>
          <TouchableOpacity
            style={[
              payStyles.methodCard,
              payStyles.equityCard,
              selectedMethod?.type === PaymentMethodType.EQUITY && payStyles.methodCardSelected,
            ]}
            onPress={() => onSelectMethod({
              id: 'equity',
              type: PaymentMethodType.EQUITY,
              name: 'MOTA Equity',
              equityValue,
              exchangeRate: equityExchangeRate,
            })}
          >
            <View style={payStyles.equityIcon}>
              <Ionicons name="trending-up" size={24} color={C.success} />
            </View>
            <View style={payStyles.methodInfo}>
              <Text style={payStyles.methodName}>MOTA Equity</Text>
              <Text style={payStyles.methodDetail}>
                Value: ${equityValue.toLocaleString()}
              </Text>
              <Text style={payStyles.exchangeRate}>
                Exchange Rate: 1 MOTA = ${equityExchangeRate.toFixed(4)}
              </Text>
            </View>
            <View style={payStyles.equityBadge}>
              <Ionicons name="shield-checkmark" size={14} color={C.success} />
              <Text style={payStyles.equityBadgeText}>Buyback</Text>
            </View>
            {selectedMethod?.type === PaymentMethodType.EQUITY && (
              <Ionicons name="checkmark-circle" size={24} color={C.gold} />
            )}
          </TouchableOpacity>
          
          {/* Equity Info */}
          <View style={payStyles.equityInfo}>
            <Ionicons name="information-circle" size={16} color={C.textMuted} />
            <Text style={payStyles.equityInfoText}>
              Pay using your MOTA equity. Company buyback ensures transaction never bounces.
              Exchange rate is fixed daily based on current valuation.
            </Text>
          </View>
        </View>
      )}

      {/* Add New Method */}
      <TouchableOpacity style={payStyles.addMethodBtn}>
        <Ionicons name="add-circle-outline" size={24} color={C.gold} />
        <Text style={payStyles.addMethodText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
};


// =====================================================
// PAYMENT CONFIRMATION MODAL
// =====================================================
export const PaymentConfirmationModal = ({
  visible,
  onClose,
  amount,
  paymentMethod,
  onConfirm,
  itemName = 'Purchase',
  user,
}) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('confirm'); // 'confirm' | 'processing' | 'fallback' | 'success' | 'failed'
  const [fallbackMethod, setFallbackMethod] = useState(null);

  const isEquityPayment = paymentMethod?.type === PaymentMethodType.EQUITY;
  const equityAmount = isEquityPayment ? (amount / (paymentMethod.exchangeRate || 1)).toFixed(4) : 0;

  const handlePayment = async () => {
    setProcessing(true);
    setStep('processing');

    try {
      // Attempt primary payment
      const result = await processPayment(paymentMethod, amount);
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onConfirm(result);
          onClose();
        }, 2000);
      } else if (result.fallbackAvailable) {
        // Primary failed, try fallback
        setFallbackMethod(result.fallbackMethod);
        setStep('fallback');
      } else {
        setStep('failed');
      }
    } catch (error) {
      setStep('failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleFallbackPayment = async () => {
    setProcessing(true);
    setStep('processing');

    try {
      const result = await processPayment(fallbackMethod, amount);
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onConfirm(result);
          onClose();
        }, 2000);
      } else {
        setStep('failed');
      }
    } catch (error) {
      setStep('failed');
    } finally {
      setProcessing(false);
    }
  };

  const processPayment = async (method, amt) => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate payment processing
    // In real implementation, this would call your payment backend
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      method: method.type,
      amount: amt,
    };
  };

  const renderConfirmStep = () => (
    <>
      <View style={confirmStyles.header}>
        <Text style={confirmStyles.title}>Confirm Payment</Text>
        <Text style={confirmStyles.subtitle}>{itemName}</Text>
      </View>

      <View style={confirmStyles.amountSection}>
        <Text style={confirmStyles.amountLabel}>Total Amount</Text>
        <Text style={confirmStyles.amount}>${amount.toLocaleString()}</Text>
        {isEquityPayment && (
          <Text style={confirmStyles.equityAmount}>
            ≈ {equityAmount} MOTA Equity
          </Text>
        )}
      </View>

      <View style={confirmStyles.methodPreview}>
        <Text style={confirmStyles.methodLabel}>Paying with</Text>
        <View style={confirmStyles.methodRow}>
          <Ionicons 
            name={
              paymentMethod?.type === PaymentMethodType.EQUITY ? 'trending-up' :
              paymentMethod?.type === PaymentMethodType.CREDIT_LINE ? 'diamond' :
              'card'
            } 
            size={24} 
            color={C.gold} 
          />
          <Text style={confirmStyles.methodName}>
            {paymentMethod?.name || paymentMethod?.brand || 'Payment Method'}
            {paymentMethod?.last4 && ` •••• ${paymentMethod.last4}`}
          </Text>
        </View>
      </View>

      {isEquityPayment && (
        <View style={confirmStyles.equityNotice}>
          <Ionicons name="shield-checkmark" size={18} color={C.success} />
          <Text style={confirmStyles.equityNoticeText}>
            Protected by MOTA Buyback Guarantee. Your transaction will never bounce.
          </Text>
        </View>
      )}

      <View style={confirmStyles.footer}>
        <TouchableOpacity style={confirmStyles.cancelBtn} onPress={onClose}>
          <Text style={confirmStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={confirmStyles.payBtn} onPress={handlePayment}>
          <LinearGradient colors={G.gold} style={confirmStyles.payBtnGrad}>
            <Ionicons name="lock-closed" size={18} color={C.bg} />
            <Text style={confirmStyles.payText}>Pay ${amount.toLocaleString()}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderProcessingStep = () => (
    <View style={confirmStyles.processingContainer}>
      <ActivityIndicator size="large" color={C.gold} />
      <Text style={confirmStyles.processingTitle}>Processing Payment</Text>
      <Text style={confirmStyles.processingText}>Please wait...</Text>
    </View>
  );

  const renderFallbackStep = () => (
    <>
      <View style={confirmStyles.header}>
        <Ionicons name="alert-circle" size={48} color={C.warning} />
        <Text style={confirmStyles.fallbackTitle}>Primary Payment Failed</Text>
        <Text style={confirmStyles.fallbackText}>
          Your {paymentMethod?.name || 'primary method'} couldn't process this payment.
        </Text>
      </View>

      <View style={confirmStyles.fallbackOption}>
        <Text style={confirmStyles.fallbackLabel}>Use Fallback Method:</Text>
        <View style={confirmStyles.methodRow}>
          <Ionicons 
            name={fallbackMethod?.type === PaymentMethodType.EQUITY ? 'trending-up' : 'card'} 
            size={24} 
            color={C.gold} 
          />
          <Text style={confirmStyles.methodName}>
            {fallbackMethod?.name || 'MOTA Equity'}
          </Text>
        </View>
      </View>

      <View style={confirmStyles.footer}>
        <TouchableOpacity style={confirmStyles.cancelBtn} onPress={onClose}>
          <Text style={confirmStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={confirmStyles.payBtn} onPress={handleFallbackPayment}>
          <LinearGradient colors={G.gold} style={confirmStyles.payBtnGrad}>
            <Text style={confirmStyles.payText}>Use Fallback</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSuccessStep = () => (
    <View style={confirmStyles.resultContainer}>
      <View style={confirmStyles.successIcon}>
        <Ionicons name="checkmark-circle" size={64} color={C.success} />
      </View>
      <Text style={confirmStyles.successTitle}>Payment Successful!</Text>
      <Text style={confirmStyles.successText}>
        Your payment of ${amount.toLocaleString()} has been processed.
      </Text>
    </View>
  );

  const renderFailedStep = () => (
    <View style={confirmStyles.resultContainer}>
      <View style={confirmStyles.failedIcon}>
        <Ionicons name="close-circle" size={64} color={C.error} />
      </View>
      <Text style={confirmStyles.failedTitle}>Payment Failed</Text>
      <Text style={confirmStyles.failedText}>
        We couldn't process your payment. Please try again or use a different payment method.
      </Text>
      <TouchableOpacity style={confirmStyles.retryBtn} onPress={() => setStep('confirm')}>
        <Text style={confirmStyles.retryText}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={confirmStyles.closeBtn} onPress={onClose}>
        <Text style={confirmStyles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={confirmStyles.overlay}>
        <View style={confirmStyles.modal}>
          {step === 'confirm' && renderConfirmStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'fallback' && renderFallbackStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'failed' && renderFailedStep()}
        </View>
      </View>
    </Modal>
  );
};


// =====================================================
// EQUITY PAYMENT DETAILS
// =====================================================
export const EquityPaymentDetails = ({
  amount,
  equityValue,
  exchangeRate,
  user,
}) => {
  const equityRequired = amount / exchangeRate;
  const remainingEquity = equityValue - equityRequired;
  const hasEnoughEquity = remainingEquity >= 0;

  return (
    <View style={equityStyles.container}>
      <View style={equityStyles.header}>
        <Ionicons name="trending-up" size={24} color={C.gold} />
        <Text style={equityStyles.title}>MOTA Equity Payment</Text>
      </View>

      <View style={equityStyles.breakdown}>
        <View style={equityStyles.row}>
          <Text style={equityStyles.label}>Payment Amount</Text>
          <Text style={equityStyles.value}>${amount.toLocaleString()}</Text>
        </View>
        <View style={equityStyles.row}>
          <Text style={equityStyles.label}>Exchange Rate</Text>
          <Text style={equityStyles.value}>1 MOTA = ${exchangeRate.toFixed(4)}</Text>
        </View>
        <View style={equityStyles.divider} />
        <View style={equityStyles.row}>
          <Text style={equityStyles.label}>Equity Required</Text>
          <Text style={equityStyles.valueHighlight}>{equityRequired.toFixed(4)} MOTA</Text>
        </View>
        <View style={equityStyles.row}>
          <Text style={equityStyles.label}>Your Equity Balance</Text>
          <Text style={equityStyles.value}>{equityValue.toFixed(4)} MOTA</Text>
        </View>
        <View style={equityStyles.row}>
          <Text style={equityStyles.label}>After Payment</Text>
          <Text style={[
            equityStyles.value,
            !hasEnoughEquity && equityStyles.valueError,
          ]}>
            {remainingEquity.toFixed(4)} MOTA
          </Text>
        </View>
      </View>

      {!hasEnoughEquity && (
        <View style={equityStyles.warning}>
          <Ionicons name="warning" size={18} color={C.warning} />
          <Text style={equityStyles.warningText}>
            Insufficient equity. {Math.abs(remainingEquity).toFixed(4)} MOTA short.
          </Text>
        </View>
      )}

      <View style={equityStyles.guarantee}>
        <Ionicons name="shield-checkmark" size={20} color={C.success} />
        <View style={equityStyles.guaranteeText}>
          <Text style={equityStyles.guaranteeTitle}>Buyback Guarantee</Text>
          <Text style={equityStyles.guaranteeDesc}>
            MOTA guarantees to buy back your equity at the current exchange rate.
            Your transaction will never bounce.
          </Text>
        </View>
      </View>
    </View>
  );
};

const equityStyles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  breakdown: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    color: C.textSec,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  valueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: C.gold,
  },
  valueError: {
    color: C.error,
  },
  divider: {
    height: 1,
    backgroundColor: C.cardLight,
    marginVertical: 8,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${C.warning}20`,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  warningText: {
    fontSize: 13,
    color: C.warning,
    flex: 1,
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    padding: 16,
    backgroundColor: `${C.success}15`,
    borderRadius: 12,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.success,
    marginBottom: 4,
  },
  guaranteeDesc: {
    fontSize: 12,
    color: C.textSec,
    lineHeight: 18,
  },
});


// =====================================================
// STYLES
// =====================================================
const payStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.cardLight,
  },
  methodCardSelected: {
    borderColor: C.gold,
    backgroundColor: `${C.gold}10`,
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  creditLineCard: {},
  equityCard: {},
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  creditLineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  equityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${C.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  methodDetail: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 2,
  },
  insufficientText: {
    fontSize: 12,
    color: C.error,
    marginTop: 2,
  },
  exchangeRate: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: C.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
  },
  crownJewelBadge: {
    backgroundColor: `${C.gold}30`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  crownJewelText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.gold,
  },
  equityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${C.success}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  equityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.success,
  },
  equityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: C.cardLight,
    borderRadius: 10,
    marginTop: 8,
  },
  equityInfoText: {
    fontSize: 12,
    color: C.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  addMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.cardLight,
    borderRadius: 12,
    marginTop: 10,
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.gold,
  },
});

const confirmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: C.bg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
  },
  amountSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: C.card,
  },
  amountLabel: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: C.text,
  },
  equityAmount: {
    fontSize: 14,
    color: C.gold,
    marginTop: 4,
  },
  methodPreview: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  methodLabel: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  equityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 20,
    padding: 14,
    backgroundColor: `${C.success}15`,
    borderRadius: 12,
  },
  equityNoticeText: {
    fontSize: 13,
    color: C.success,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSec,
  },
  payBtn: {
    flex: 2,
  },
  payBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  payText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 60,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginTop: 20,
  },
  processingText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 8,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
  },
  fallbackText: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 8,
  },
  fallbackOption: {
    padding: 20,
    backgroundColor: C.card,
    margin: 20,
    borderRadius: 12,
  },
  fallbackLabel: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 10,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {},
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.success,
    marginTop: 16,
  },
  successText: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 8,
  },
  failedIcon: {},
  failedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.error,
    marginTop: 16,
  },
  failedText: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  closeBtn: {
    marginTop: 16,
  },
  closeText: {
    fontSize: 14,
    color: C.textMuted,
  },
});


export default {
  PaymentMethodType,
  PaymentMethodSelector,
  PaymentConfirmationModal,
  EquityPaymentDetails,
};
