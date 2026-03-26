import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/src/theme';

type ValidationStatus = 'idle' | 'valid' | 'invalid' | 'checking';

interface CategoryInputProps {
  category: string;
  letter: string;
  value: string;
  status: ValidationStatus;
  errorMessage?: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  disabled?: boolean;
}

const STATUS_COLORS: Record<ValidationStatus, string> = {
  idle: Colors.border,
  valid: Colors.success,
  invalid: Colors.error,
  checking: Colors.textMuted,
};

const STATUS_ICONS: Record<ValidationStatus, string> = {
  idle: '',
  valid: '✓',
  invalid: '✗',
  checking: '…',
};

const CategoryInput: React.FC<CategoryInputProps> = ({
  category,
  letter,
  value,
  status,
  errorMessage,
  onChangeText,
  onBlur,
  disabled = false,
}) => {
  const borderColor = STATUS_COLORS[status];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.categoryLabel}>{category}</Text>
        {status !== 'idle' && (
          <Text
            style={[
              styles.statusIcon,
              {
                color:
                  status === 'checking' ? Colors.textMuted : STATUS_COLORS[status],
              },
            ]}
          >
            {STATUS_ICONS[status]}
          </Text>
        )}
      </View>

      <View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={`${letter}…`}
          placeholderTextColor={Colors.textDim}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
          returnKeyType="next"
          maxLength={50}
        />
      </View>

      {status === 'invalid' && (
        <Text style={styles.errorHint}>
          {errorMessage ?? 'Not found in dictionary — still counts if teammates agree!'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    ...Typography.label,
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    ...Typography.body,
    flex: 1,
    padding: 0,
    color: Colors.text,
  },
  inputDisabled: {
    color: Colors.textMuted,
  },
  errorHint: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});

export default CategoryInput;
