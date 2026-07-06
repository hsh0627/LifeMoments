import { Text, View, TextProps, StyleProp, TextStyle } from 'react-native';

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

const STROKE = 2;
const OFFSETS = [
  [-STROKE, 0], [STROKE, 0], [0, -STROKE], [0, STROKE],
  [-STROKE, -STROKE], [STROKE, -STROKE], [-STROKE, STROKE], [STROKE, STROKE],
];

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
    fontFamily: 'DotGothic16_400Regular',
    fontSize,
    lineHeight: fontSize * 2,
  };

  if (!outlined) {
    return (
      <Text style={[baseStyle, { color }, style]} {...props}>
        {children}
      </Text>
    );
  }

  return (
    <View style={{ alignSelf: 'center' }}>
      {OFFSETS.map(([x, y], i) => (
        <Text
          key={i}
          style={[baseStyle, { color: '#1A0F00', position: 'absolute', left: x, top: y }, style]}
          {...props}
        >
          {children}
        </Text>
      ))}
      {/* 最後這層撐起 View 的大小，並顯示白字 */}
      <Text style={[baseStyle, { color }, style]} {...props}>
        {children}
      </Text>
    </View>
  );
}
