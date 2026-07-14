import { View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Redirect } from 'expo-router';
import { useState } from 'react';
import PixelText from '../../components/PixelText';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

const slides = [
  {
    title: '人生大事\n一起面對',
    desc: '懷孕、結婚、買房\n每個重要時刻都有\n你的專屬助手',
  },
  {
    title: '任務清單\n升級成就',
    desc: '完成每個里程碑\n解鎖專屬徽章\n記錄你的成長旅程',
  },
  {
    title: 'AI 助理\n隨時待命',
    desc: '有任何問題直接問\n還能幫你查補助\n規劃預算',
  },
];

export default function Welcome() {
  const session = useAuthStore((s) => s.session);
  const [page, setPage] = useState(0);
  const [guestLoading, setGuestLoading] = useState(false);
  const isLast = page === slides.length - 1;

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) Alert.alert('錯誤', error.message);
    } catch (e) {
      console.log('signInAnonymously exception:', e);
      Alert.alert('錯誤', e instanceof Error ? e.message : String(e));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDD8' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 32 }}>

        {/* 標題 */}
        <PixelText size="lg" outlined color="#FFFFFF" style={{ textAlign: 'center' }}>
          {slides[page].title}
        </PixelText>

        {/* 說明 */}
        <PixelText size="xs" outlined color="#FFFFFF" style={{ textAlign: 'center' }}>
          {slides[page].desc}
        </PixelText>

        {/* 頁碼點點 */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                height: 8,
                borderRadius: 4,
                width: i === page ? 24 : 8,
                backgroundColor: i === page ? '#7C5C3E' : '#D9C9B0',
              }}
            />
          ))}
        </View>

        {/* 按鈕 */}
        <View style={{ width: '100%', gap: 12 }}>
          {/* 主要按鈕 */}
          <TouchableOpacity
            style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
            onPress={() => {
              if (isLast) {
                router.push('/(auth)/register');
              } else {
                setPage(page + 1);
              }
            }}
          >
            <PixelText size="xs" outlined color="#FFFFFF">
              {isLast ? '[ 開始冒險 ]' : '[ 下一頁 ]'}
            </PixelText>
          </TouchableOpacity>

          {/* 訪客進入（只在最後一頁顯示） */}
          {isLast && (
            <TouchableOpacity
              style={{ backgroundColor: '#C4885A', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
              onPress={handleGuestLogin}
              disabled={guestLoading}
            >
              <PixelText size="xs" outlined color="#FFFFFF">
                {guestLoading ? '進入中...' : '[ 訪客進入 ]'}
              </PixelText>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={() => router.push('/(auth)/login')}>
            <PixelText size="xs" color="#9C8570">已有帳號？登入</PixelText>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
