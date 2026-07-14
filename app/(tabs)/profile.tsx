import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import { getLevelTier } from '../../lib/levels';
import BadgeRow from '../../components/BadgeRow';
import XPBar from '../../components/XPBar';
import PixelText from '../../components/PixelText';

export default function Profile() {
  const { user } = useAuthStore();
  const { role, setRole, xp, level, badges } = usePregnancyStore();
  const insets = useSafeAreaInsets();
  const tier = getLevelTier(level, role);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isAnonymous = user?.is_anonymous ?? false;
  const displayName = isAnonymous ? '訪客冒險者' : (user?.user_metadata?.display_name ?? '冒險者');

  const handleLogout = () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '登出', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  const handleUpgrade = async () => {
    if (!email || !password) {
      Alert.alert('請填寫 Email 和密碼');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('升級失敗', error.message);
    } else {
      setUpgradeModal(false);
      Alert.alert('升級成功！', '請檢查 Email 完成驗證，資料已保留。');
    }
  };

  const inputStyle = {
    backgroundColor: '#F5EDD8',
    borderWidth: 2,
    borderColor: '#D9C9B0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'DotGothic16_400Regular',
    fontSize: 16,
    color: '#3B2A1A',
    marginBottom: 12,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5EDD8' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 8 }}>
        <PixelText size="sm" outlined color="#FFFFFF">👤 我的角色</PixelText>
      </View>

      {/* 訪客提示 */}
      {isAnonymous && (
        <TouchableOpacity
          style={{ marginHorizontal: 24, backgroundColor: '#C4885A', borderRadius: 8, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          onPress={() => setUpgradeModal(true)}
        >
          <View style={{ flex: 1 }}>
            <PixelText size="xs" color="#FDF6E3">訪客模式</PixelText>
            <PixelText size="xs" color="#FDF6E3" style={{ opacity: 0.8, marginTop: 4 }}>升級帳號以保存資料</PixelText>
          </View>
          <PixelText size="xs" outlined color="#FFFFFF">升級 →</PixelText>
        </TouchableOpacity>
      )}

      {/* 角色卡 */}
      <View style={{ marginHorizontal: 24, backgroundColor: tier.themeColor, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 40 }}>{isAnonymous ? '👻' : '🌟'}</Text>
        </View>
        <PixelText size="sm" outlined color="#FFFFFF" style={{ marginBottom: 4 }}>{displayName}</PixelText>
        <PixelText size="xs" color="#D9C9B0" style={{ marginBottom: 16 }}>Lv.{level} {tier.title}</PixelText>
        <View style={{ width: '100%' }}>
          <XPBar xp={xp} />
        </View>
        <PixelText size="xs" color="#D9C9B0" style={{ marginTop: 8 }}>累計 {xp} XP</PixelText>
      </View>

      {/* 成就 */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <PixelText size="xs" outlined color="#FFFFFF" style={{ marginBottom: 12 }}>🏆 已解鎖徽章 ({badges.length})</PixelText>
        {badges.length > 0 ? (
          <BadgeRow badges={badges} />
        ) : (
          <View style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 24, alignItems: 'center' }}>
            <PixelText size="xs" color="#9C8570">完成任務來解鎖徽章吧！</PixelText>
          </View>
        )}
      </View>

      {/* 設定 */}
      <View style={{ paddingHorizontal: 24 }}>
        <PixelText size="xs" outlined color="#FFFFFF" style={{ marginBottom: 12 }}>⚙️ 設定</PixelText>
        <View style={{ backgroundColor: '#FDF6E3', borderRadius: 8, overflow: 'hidden' }}>
          {isAnonymous && (
            <TouchableOpacity
              style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#D9C9B0' }}
              onPress={() => setUpgradeModal(true)}
            >
              <PixelText size="xs" color="#C4885A">升級為正式帳號</PixelText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#D9C9B0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() =>
              Alert.alert('切換角色', '選擇你的角色', [
                { text: '取消', style: 'cancel' },
                { text: '🤰 我是媽麻', onPress: () => setRole('mom') },
                { text: '👨 我是爸拔', onPress: () => setRole('dad') },
              ])
            }
          >
            <PixelText size="xs" color="#3B2A1A">切換角色</PixelText>
            <PixelText size="xs" color="#9C8570">{role === 'dad' ? '👨 爸拔' : '🤰 媽麻'}</PixelText>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#D9C9B0' }}>
            <PixelText size="xs" color="#3B2A1A">隱私權政策</PixelText>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#D9C9B0' }}>
            <PixelText size="xs" color="#3B2A1A">使用條款</PixelText>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 16 }} onPress={handleLogout}>
            <PixelText size="xs" color="#C0392B">登出</PixelText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 升級帳號 Modal */}
      <Modal visible={upgradeModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#F5EDD8', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, gap: 16 }}>
            <PixelText size="sm" outlined color="#FFFFFF">升級帳號</PixelText>
            <PixelText size="xs" color="#9C8570">綁定 Email 後資料永久保存，不會遺失</PixelText>

            <TextInput
              style={inputStyle}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={inputStyle}
              placeholder="設定密碼（至少 6 位）"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
              onPress={handleUpgrade}
              disabled={loading}
            >
              <PixelText size="xs" outlined color="#FFFFFF">{loading ? '升級中...' : '[ 確認升級 ]'}</PixelText>
            </TouchableOpacity>

            <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={() => setUpgradeModal(false)}>
              <PixelText size="xs" color="#9C8570">取消</PixelText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}
