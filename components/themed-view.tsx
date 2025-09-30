import { View, type ViewProps } from 'react-native';
import { useTheme } from '@react-navigation/native';

export type ThemedViewProps = ViewProps & {
  style?: any;
};

export function ThemedView({ style, ...props }: ThemedViewProps) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.background }, style]} {...props} />;
}
