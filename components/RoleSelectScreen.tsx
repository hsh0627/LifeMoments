import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore, ParentRole } from '../store/usePregnancyStore';
import { supabase } from '../lib/supabase';
import PixelText from './PixelText';

export default function RoleSelectScreen() {
  const setRole = usePregnancyStore((s) => s.setRole);
  const cancelOnboarding = usePregnancyStore((s) => s.cancelOnboarding);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '登出', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5EDD8', paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, justifyContent: 'center', gap: 24 }}>
      <TouchableOpacity style={{ position: 'absolute', top: insets.top + 12, left: 24 }} onPress={cancelOnboarding}>
        <PixelText size="xs" color="#9C8570">← 返回</PixelText>
      </TouchableOpacity>
      <TouchableOpacity style={{ position: 'absolute', top: insets.top + 12, right: 24 }} onPress={handleLogout}>
        <PixelText size="xs" color="#9C8570">登出</PixelText>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <PixelText size="lg" outlined color="#FFFFFF">你的角色是？</PixelText>
        <PixelText size="xs" color="#9C8570" style={{ marginTop: 8, textAlign: 'center' }}>
          我們會依照角色顯示不同的任務內容
        </PixelText>
      </View>

      <TouchableOpacity
        style={{ backgroundColor: '#C4885A', borderRadius: 16, padding: 28, alignItems: 'center', gap: 8 }}
        onPress={() => setRole('mom')}
      >
        <Text style={{ fontSize: 48 }}>🤰</Text>
        <PixelText size="sm" outlined color="#FFFFFF">我是媽麻</PixelText>
        <PixelText size="xs" color="#FDF6E3" style={{ opacity: 0.85, textAlign: 'center' }}>
          產檢、孕期追蹤、身體變化任務
        </PixelText>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: '#4A6FA5', borderRadius: 16, padding: 28, alignItems: 'center', gap: 8 }}
        onPress={() => setRole('dad')}
      >
        <Text style={{ fontSize: 48 }}>👨</Text>
        <PixelText size="sm" outlined color="#FFFFFF">我是爸拔</PixelText>
        <PixelText size="xs" color="#FDF6E3" style={{ opacity: 0.85, textAlign: 'center' }}>
          陪伴、準備、支援媽媽的任務
        </PixelText>
      </TouchableOpacity>
    </View>
  );
}
