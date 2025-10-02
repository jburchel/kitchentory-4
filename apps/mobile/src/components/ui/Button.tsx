import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className,
}) => {
  const baseStyles = 'rounded-md flex-row items-center justify-center';

  const variantStyles = {
    default: 'bg-primary',
    destructive: 'bg-destructive',
    outline: 'border-2 border-input bg-background',
    secondary: 'bg-secondary',
    ghost: 'bg-transparent',
  };

  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
  };

  const textVariantStyles = {
    default: 'text-primary-foreground',
    destructive: 'text-destructive-foreground',
    outline: 'text-foreground',
    secondary: 'text-secondary-foreground',
    ghost: 'text-foreground',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#000' : '#fff'} />
      ) : (
        <Text className={cn('font-medium text-sm', textVariantStyles[variant])}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
