import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

interface PixelTextProps extends TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  outlined?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const sizeMap = {
  xs: 16,
  sm: 22,
  base: 28,
  lg: 36,
  xl: 44,
  '2xl': 56,
};

export default function PixelText({
  size = 'base',
  outlined = false,
  color = '#3B2A1A',
  style,
  children,
  ...props
}: PixelTextProps) {
  const fontSize = sizeMap[size];
  const baseStyle: TextStyle = {
    fontSize,
    lineHeight: fontSize * 1.4,
  };

  if (!outlined) {
    return (
      <Text style={[baseStyle, { color }, style]} {...props}>
        {children}
      </Text>
    );
  }

  return (
    <Text
      style={[
        baseStyle,
        {
          color,
          textShadowColor: '#1A0F00',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
