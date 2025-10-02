import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { cn } from '../../lib/utils';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  multiline?: boolean;
  numberOfLines?: number;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  label,
  error,
  className,
  disabled,
  keyboardType = 'default',
  multiline,
  numberOfLines,
}) => {
  return (
    <View className="w-full">
      {label && <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#9ca3af"
        className={cn(
          'flex w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm text-foreground',
          multiline ? 'min-h-20' : 'h-10',
          disabled && 'opacity-50',
          error && 'border-destructive',
          className
        )}
      />
      {error && <Text className="text-sm text-destructive mt-1">{error}</Text>}
    </View>
  );
};

export default Input;
