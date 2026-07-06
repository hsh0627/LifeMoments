import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import XPBar from '../../components/XPBar';
import BadgeRow from '../../components/BadgeRow';
import PixelText from '../../components/PixelText';

export default function Home() {
  const { user } = useAuthStore();
  const { profile, currentWeek, xp, level, badges } = usePregnancyStore();
  const displayName = user?.user_metadata?.display_name ?? '冒險者';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5EDD8' }} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <PixelText size="xs" color="#9C8570">歡迎回來</PixelText>
        <PixelText size="sm" outlined color="#FFFFFF" style={{ marginTop: 4 }}>{displayName} 👋</PixelText>
      </View>

      {/* RPG 角色卡 */}
      <View style={{ marginHorizontal: 24, backgroundColor: '#7C5C3E', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View>
            <PixelText size="xs" color="#D9C9B0">Lv.{level} 媽媽冒險者</PixelText>
          </View>
          <Text style={{ fontSize: 32 }}>🌟</Text>
        </View>
        {profile ? (
          <PixelText size="xs" color="#FDF6E3" style={{ marginBottom: 12 }}>懷孕第 {currentWeek} 週</PixelText>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', marginBottom: 12 }}
            onPress={() => router.push('/(tabs)/pregnancy')}
          >
            <PixelText size="xs" color="#FDF6E3">+ 設定懷孕資料</PixelText>
          </TouchableOpacity>
        )}
        <XPBar xp={xp} />
      </View>

      {/* 今日任務 */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <PixelText size="xs" outlined color="#FFFFFF" style={{ marginBottom: 12 }}>🗡️ 今日任務</PixelText>
        <View style={{ gap: 12 }}>
          <QuestCard emoji="📅" title="確認本週產檢行程" xpReward={20} onPress={() => router.push('/(tabs)/checklist')} />
          <QuestCard emoji="📦" title="更新待產包清單" xpReward={15} onPress={() => router.push('/(tabs)/checklist')} />
        </View>
      </View>

      {/* 成就徽章 */}
      {badges.length > 0 && (
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <PixelText size="xs" outlined color="#FFFFFF" style={{ marginBottom: 12 }}>🏆 我的徽章</PixelText>
          <BadgeRow badges={badges} />
        </View>
      )}

      {/* 快速入口 */}
      <View style={{ paddingHorizontal: 24 }}>
        <PixelText size="xs" outlined color="#FFFFFF" style={{ marginBottom: 12 }}>⚡ 快速入口</PixelText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <ShortcutCard emoji="🤰" label="週數計算" onPress={() => router.push('/(tabs)/pregnancy')} />
          <ShortcutCard emoji="💰" label="補助查詢" onPress={() => router.push('/(tabs)/pregnancy')} />
          <ShortcutCard emoji="🤖" label="AI 助理" onPress={() => {}} />
        </View>
      </View>

    </ScrollView>
  );
}

function QuestCard({ emoji, title, xpReward, onPress }: {
  emoji: string; title: string; xpReward: number; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 }}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
        <PixelText size="xs" color="#3B2A1A" style={{ flex: 1 }}>{title}</PixelText>
      </View>
      <View style={{ backgroundColor: '#FFF3CD', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 }}>
        <PixelText size="xs" color="#7C5C3E">+{xpReward} XP</PixelText>
      </View>
    </TouchableOpacity>
  );
}

function ShortcutCard({ emoji, label, onPress }: {
  emoji: string; label: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, alignItems: 'center', gap: 8, elevation: 2 }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <PixelText size="xs" color="#7C5C3E" style={{ textAlign: 'center' }}>{label}</PixelText>
    </TouchableOpacity>
  );
}
