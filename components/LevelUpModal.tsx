import { useEffect, useRef } from 'react';
import { Modal, View, Animated, TouchableOpacity } from 'react-native';
import { usePregnancyStore } from '../store/usePregnancyStore';
import { getLevelTier } from '../lib/levels';
import PixelText from './PixelText';

export default function LevelUpModal() {
  const { role, level, justLeveledUp, clearLevelUpFlag } = usePregnancyStore();
  const scale = useRef(new Animated.Value(0.5)).current;
  const tier = getLevelTier(level, role);

  useEffect(() => {
    if (justLeveledUp) {
      scale.setValue(0.5);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
  }, [justLeveledUp]);

  return (
    <Modal visible={justLeveledUp} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            transform: [{ scale }],
            backgroundColor: tier.themeColor,
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            marginHorizontal: 40,
          }}
        >
          <PixelText size="2xl">🌟</PixelText>
          <PixelText size="lg" outlined color="#FFFFFF" style={{ marginTop: 12 }}>Lv.{level}</PixelText>
          <PixelText size="sm" outlined color="#FFFFFF" style={{ marginTop: 4 }}>{tier.title}</PixelText>
          <PixelText size="xs" color="#FDF6E3" style={{ marginTop: 12, opacity: 0.9 }}>升級了！繼續加油 💪</PixelText>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 32 }}
            onPress={clearLevelUpFlag}
          >
            <PixelText size="xs" outlined color="#FFFFFF">[ 太棒了 ]</PixelText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
