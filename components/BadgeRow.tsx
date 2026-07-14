import { View, Text, ScrollView } from 'react-native';

const BADGE_MAP: Record<string, { emoji: string; label: string }> = {
  first_checkup: { emoji: '🏥', label: '初診完成' },
  week_12: { emoji: '🌱', label: '第12週' },
  week_20: { emoji: '🌿', label: '第20週' },
  week_36: { emoji: '🌳', label: '第36週' },
  checklist_pro: { emoji: '📋', label: '清單達人' },
  budget_master: { emoji: '💰', label: '精打細算' },
  subsidy_hunter: { emoji: '🎯', label: '補助獵人' },
  stage_early_done: { emoji: '🌸', label: '孕早期達成' },
  stage_mid_done: { emoji: '🌻', label: '孕中期達成' },
  stage_late_done: { emoji: '🎉', label: '孕晚期達成' },
  stage_postpartum_stage_done: { emoji: '👶', label: '產後任務達成' },
};

interface BadgeRowProps {
  badges: string[];
}

export default function BadgeRow({ badges }: BadgeRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {badges.map((badge) => {
          const info = BADGE_MAP[badge];
          if (!info) return null;
          return (
            <View key={badge} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={{ backgroundColor: '#FDF6E3', borderRadius: 16, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
              >
                <Text style={{ fontSize: 24 }}>{info.emoji}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#9C8570', textAlign: 'center' }}>{info.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
