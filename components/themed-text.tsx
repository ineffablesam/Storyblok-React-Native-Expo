import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@react-navigation/native';

export type ThemedTextProps = TextProps & {
  style?: any;
};

export function ThemedText({ style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.text }, style]} {...props} />;
}
