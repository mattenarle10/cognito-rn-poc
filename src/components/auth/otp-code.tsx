import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';

interface OtpCodeInputProps {
  length?: number;
  value: string;
  onChangeCode: (code: string) => void;
  autoFocus?: boolean;
  isDisabled?: boolean;
}

export function OtpCodeInput({
  length = 6,
  value,
  onChangeCode,
  autoFocus = true,
  isDisabled = false,
}: OtpCodeInputProps) {
  const inputRef = useRef<TextInput>(null);

  const digits = useMemo(() => {
    const chars = value.split('').slice(0, length);
    while (chars.length < length) chars.push('');
    return chars;
  }, [value, length]);

  function handlePress() {
    if (isDisabled) return;
    inputRef.current?.focus();
  }

  function handleChangeText(text: string) {
    if (isDisabled) return;
    const sanitized = text.replace(/\D/g, '').slice(0, length);
    onChangeCode(sanitized);
  }

  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (isDisabled) return;
    if (e.nativeEvent.key === 'Backspace' && value.length > 0) {
      onChangeCode(value.slice(0, value.length - 1));
    }
  }

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel="Enter verification code">
      <View style={styles.container} pointerEvents="box-none">
        {digits.map((char, idx) => {
          const isActive = idx === activeIndex && !isDisabled;
          return (
            <View key={idx} style={[styles.box, isActive ? styles.boxActive : undefined, isDisabled ? styles.boxDisabled : undefined]}
              accessibilityLabel={`Digit ${idx + 1}`}
              accessibilityState={{ disabled: isDisabled }}
            >
              <Text style={styles.digit}>{char}</Text>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoFocus={autoFocus}
          maxLength={length}
          editable={!isDisabled}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: '#111827',
  },
  boxDisabled: {
    backgroundColor: '#F3F4F6',
  },
  digit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});


