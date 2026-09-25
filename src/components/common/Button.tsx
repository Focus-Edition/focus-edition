import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'brand' | 'ink' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'brand',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#D1D5DB';
    switch (variant) {
      case 'ink':
        return COLORS.ink;
      case 'outline':
        return '#FFFFFF';
      case 'danger':
        return COLORS.danger;
      case 'success':
        return COLORS.ok;
      case 'brand':
      default:
        return COLORS.brand;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#9CA3AF';
    return variant === 'outline' ? COLORS.ink : '#FFFFFF';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: 12, borderRadius: 10 };
      case 'lg':
        return { height: 50, paddingHorizontal: 24, borderRadius: 16 };
      case 'md':
      default:
        return { height: 44, paddingHorizontal: 16, borderRadius: 12 };
    }
  };

  const pad = getPadding();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.base,
        pad,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? COLORS.line : 'transparent'
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14 },
            textStyle
          ]}
        >
          {icon ? `${icon}  ` : ''}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    fontWeight: '600',
    textAlign: 'center'
  }
});
