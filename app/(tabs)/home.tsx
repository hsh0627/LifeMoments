import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import { getLevelTier, AI_ASSISTANT_UNLOCK_LEVEL } from '../../lib/levels';
import { getTodayQuests } from '../../lib/tasks';
import { STATUS_STYLE } from '../../lib/checklistStatus';
import XPBar from '../../components/XPBar';
import BadgeRow from '../../components/BadgeRow';
import PixelText from '../../components/PixelText';

export default function Home() {
  const { user } = useAuthStore();
  const { role, profile, currentWeek, xp, level, badges, checklist } = usePregnancyStore();
  const displayName = user?.user_metadata?.display_name ?? '冒險者';
  const insets = useSafeAreaInsets();
  const tier = getLevelTier(level, role);
  const aiUnlocked = level >= AI_ASSISTANT_UNLOCK_LEVEL;
  const quests = getTodayQuests(role, checklist, currentWeek);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5EDD8' }} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 8 }}>
        <PixelText size="xs" color="#9C8570">歡迎回來</PixelText>
        <PixelText size="sm" outlined color="#FFFFFF" style={{ marginTop: 4 }}>{displayName} 👋</PixelText>
      </View>

      {/* RPG 角色卡 */}
      <View style={{ marginHorizontal: 24, backgroundColor: tier.themeColor, borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View>
            <PixelText size="xs" color="#D9C9B0">Lv.{level} {tier.title}</PixelText>
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
          {quests.length > 0 ? (
            quests.map((q) => (
              <QuestCard
                key={q.id}
                emoji={q.emoji}
                title={q.title}
                xpReward={q.xp}
                optional={q.optional}
                status={q.status}
                onPress={() => router.push('/(tabs)/checklist')}
              />
            ))
          ) : (
            <View style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16 }}>
              <PixelText size="xs" color="#9C8570">目前沒有待辦任務，太棒了！🎉</PixelText>
            </View>
          )}
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
          <ShortcutCard
            emoji={aiUnlocked ? '🤖' : '🔒'}
            label={aiUnlocked ? 'AI 助理' : `Lv.${AI_ASSISTANT_UNLOCK_LEVEL} 解鎖`}
            locked={!aiUnlocked}
            onPress={() => {
              if (aiUnlocked) {
                Alert.alert('AI 助理', '功能開發中，敬請期待！');
              } else {
                Alert.alert('尚未解鎖', `升到 Lv.${AI_ASSISTANT_UNLOCK_LEVEL} 即可使用 AI 助理`);
              }
            }}
          />
        </View>
      </View>

    </ScrollView>
  );
}

function QuestCard({ emoji, title, xpReward, onPress, optional, status }: {
  emoji: string; title: string; xpReward: number; onPress: () => void; optional?: boolean; status?: 'overdue' | 'soon' | 'future' | null;
}) {
  return (
    <TouchableOpacity
      style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 }}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <PixelText size="xs" color="#3B2A1A">{title}</PixelText>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {status && (
              <View style={{ backgroundColor: STATUS_STYLE[status].bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
                <PixelText size="xs" color={STATUS_STYLE[status].color}>{STATUS_STYLE[status].label}</PixelText>
              </View>
            )}
            {optional && (
              <PixelText size="xs" color="#9C8570">額外任務・可交給另一半</PixelText>
            )}
          </View>
        </View>
      </View>
      <View style={{ backgroundColor: '#FFF3CD', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 }}>
        <PixelText size="xs" color="#7C5C3E">+{xpReward} XP</PixelText>
      </View>
    </TouchableOpacity>
  );
}

function ShortcutCard({ emoji, label, onPress, locked }: {
  emoji: string; label: string; onPress: () => void; locked?: boolean;
}) {
  return (
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, alignItems: 'center', gap: 8, elevation: 2, opacity: locked ? 0.6 : 1 }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <PixelText size="xs" color="#7C5C3E" style={{ textAlign: 'center' }}>{label}</PixelText>
    </TouchableOpacity>
  );
}
