import { View, Text, ScrollView } from 'react-native';

const BADGE_MAP: Record<string, { emoji: string; label: string }> = {
  first_checkup: { emoji: '🏥', label: '初診完成' },
  week_12: { emoji: '🌱', label: '第12週' },
  week_20: { emoji: '🌿', label: '第20週' },
  week_36: { emoji: '🌳', label: '第36週' },
  checklist_pro: { emoji: '📋', label: '清單達人' },
  budget_master: { emoji: '💰', label: '精打細算' },
  subsidy_hunter: { emoji: '🎯', label: '補助獵人' },
};

interface BadgeRowProps {
  badges: string[];
}

export default function BadgeRow({ badges }: BadgeRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-3">
        {badges.map((badge) => {
          const info = BADGE_MAP[badge];
          if (!info) return null;
          return (
            <View key={badge} className="items-center gap-1">
              <View className="bg-card rounded-2xl w-14 h-14 items-center justify-center"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
              >
                <Text className="text-2xl">{info.emoji}</Text>
              </View>
              <Text className="text-xs text-muted text-center">{info.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
