import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import PixelText from './PixelText';

export default function PackingItemCard({
  emoji,
  title,
  done,
  onPress,
}: {
  emoji: string;
  title: string;
  done: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const stamp = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    if (done) {
      stamp.setValue(0);
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 90, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
      ]).start();
      Animated.spring(stamp, { toValue: 1, useNativeDriver: true, friction: 5, delay: 60 }).start();
    }
  }, [done]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: '31%',
        aspectRatio: 1,
        backgroundColor: done ? '#EAF2E3' : '#FDF6E3',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: done ? '#5A7A4A' : '#D9C9B0',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        opacity: done ? 0.75 : 1,
      }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <PixelText size="lg">{emoji}</PixelText>
      </Animated.View>
      <PixelText
        size="xs"
        color="#3B2A1A"
        numberOfLines={2}
        style={{ textAlign: 'center', marginTop: 4, textDecorationLine: done ? 'line-through' : 'none' }}
      >
        {title}
      </PixelText>
      {done && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            transform: [{ scale: stamp }],
            backgroundColor: '#5A7A4A',
            borderRadius: 99,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PixelText size="xs" color="#FDF6E3">✓</PixelText>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}
