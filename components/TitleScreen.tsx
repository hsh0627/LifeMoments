import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore } from '../store/usePregnancyStore';
import { getLevelTier } from '../lib/levels';
import { supabase } from '../lib/supabase';
import PixelText from './PixelText';

const STORYLINE_LABEL: Record<string, string> = {
  pregnancy: '懷孕',
};

export default function TitleScreen({ onContinue }: { onContinue: () => void }) {
  const insets = useSafeAreaInsets();
  const { storyline, role, level } = usePregnancyStore();
  const tier = getLevelTier(level, role);

  const handleSwitchStoryline = () => {
    Alert.alert('切換人生大事', '要回到人生大事選擇畫面嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '切換',
        onPress: () => {
          usePregnancyStore.getState().archiveActiveAndGoToPicker();
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '登出', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5EDD8', paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, justifyContent: 'space-between' }}>
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <PixelText size="lg" outlined color="#FFFFFF">LifeMoments</PixelText>
        <PixelText size="xs" color="#9C8570" style={{ marginTop: 8 }}>
          {storyline ? `目前冒險：${STORYLINE_LABEL[storyline] ?? storyline}` : ''}
        </PixelText>
      </View>

      <View style={{ backgroundColor: tier.themeColor, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 40 }}>🌟</Text>
        <PixelText size="sm" outlined color="#FFFFFF">Lv.{level} {tier.title}</PixelText>
      </View>

      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#7C5C3E', paddingVertical: 18, borderRadius: 4, alignItems: 'center' }}
          onPress={onContinue}
        >
          <PixelText size="xs" outlined color="#FFFFFF">[ 繼續冒險 ]</PixelText>
        </TouchableOpacity>

        <TouchableOpacity style={{ paddingVertical: 10, alignItems: 'center' }} onPress={handleSwitchStoryline}>
          <PixelText size="xs" color="#9C8570">切換人生大事</PixelText>
        </TouchableOpacity>

        <TouchableOpacity style={{ paddingVertical: 10, alignItems: 'center' }} onPress={handleLogout}>
          <PixelText size="xs" color="#9C8570">登出</PixelText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
