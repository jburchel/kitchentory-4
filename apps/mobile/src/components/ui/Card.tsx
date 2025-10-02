import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm',
        className
      )}
    >
      {children}
    </View>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <View className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</View>;
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <Text className={cn('text-2xl font-semibold leading-none tracking-tight text-card-foreground', className)}>
      {children}
    </Text>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
  return <Text className={cn('text-sm text-muted-foreground', className)}>{children}</Text>;
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <View className={cn('p-6 pt-0', className)}>{children}</View>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return <View className={cn('flex flex-row items-center p-6 pt-0', className)}>{children}</View>;
};
