/**
 * AppModal — Reusable modal component to replace all Alert.alert() calls
 * Supports: info, error, success, confirm, destructive confirm
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

export type AppModalType = 'info' | 'error' | 'success' | 'confirm' | 'destructive';

export interface AppModalConfig {
  visible: boolean;
  type: AppModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const INITIAL_MODAL: AppModalConfig = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
};

// Hook to manage modal state
export function useAppModal() {
  const [modal, setModal] = React.useState<AppModalConfig>(INITIAL_MODAL);

  const showModal = (config: Omit<AppModalConfig, 'visible'>) => {
    setModal({ ...config, visible: true });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };

  const showError = (title: string, message: string) => {
    showModal({ type: 'error', title, message });
  };

  const showSuccess = (title: string, message: string) => {
    showModal({ type: 'success', title, message });
  };

  const showInfo = (title: string, message: string) => {
    showModal({ type: 'info', title, message });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; destructive?: boolean }
  ) => {
    showModal({
      type: options?.destructive ? 'destructive' : 'confirm',
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    });
  };

  return { modal, showModal, hideModal, showError, showSuccess, showInfo, showConfirm };
}

// Icon & color config per type
const MODAL_CONFIG: Record<AppModalType, {
  icon: keyof typeof Ionicons.glyphMap;
  getColor: (colors: any) => string;
}> = {
  info: { icon: 'information-circle', getColor: (c) => c.accent || '#0D9488' },
  error: { icon: 'close-circle', getColor: (c) => c.error || '#EF4444' },
  success: { icon: 'checkmark-circle', getColor: (c) => c.success || '#10B981' },
  confirm: { icon: 'help-circle', getColor: (c) => c.accent || '#0D9488' },
  destructive: { icon: 'warning', getColor: (c) => c.error || '#EF4444' },
};

interface AppModalProps {
  config: AppModalConfig;
  onDismiss: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({ config, onDismiss }) => {
  const { colors } = useThemeStore();

  if (!config.visible) return null;

  const { icon, getColor } = MODAL_CONFIG[config.type];
  const accentColor = getColor(colors);
  const isConfirmType = config.type === 'confirm' || config.type === 'destructive';

  const handleConfirm = () => {
    onDismiss();
    config.onConfirm?.();
  };

  const handleCancel = () => {
    onDismiss();
    config.onCancel?.();
  };

  return (
    <Modal
      visible={config.visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
            <Ionicons name={icon} size={48} color={accentColor} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {config.title}
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {config.message}
          </Text>

          {isConfirmType ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                  {config.cancelText || 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.confirmBtn, { backgroundColor: accentColor }]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>
                  {config.confirmText || 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.btn, styles.singleBtn, { backgroundColor: accentColor }]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
  },
  confirmBtn: {
    flex: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  singleBtn: {
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cancelBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
  },
  confirmBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#fff',
    fontSize: 16,
  },
});
