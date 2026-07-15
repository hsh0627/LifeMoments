import { useEffect, useRef } from 'react';
import { Modal, View, Animated, TouchableOpacity } from 'react-native';
import PixelText from './PixelText';

export default function PackCompleteModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.5);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            transform: [{ scale }],
            backgroundColor: '#7C5C3E',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            marginHorizontal: 40,
          }}
        >
          <PixelText size="2xl">🎒</PixelText>
          <PixelText size="sm" outlined color="#FFFFFF" style={{ marginTop: 12 }}>待產包打包完成！</PixelText>
          <PixelText size="xs" color="#FDF6E3" style={{ marginTop: 12, opacity: 0.9 }}>準備好迎接寶寶了 🎉</PixelText>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 32 }}
            onPress={onClose}
          >
            <PixelText size="xs" outlined color="#FFFFFF">[ 太棒了 ]</PixelText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
