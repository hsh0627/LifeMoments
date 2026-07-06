import { View, Text } from 'react-native';

interface XPBarProps {
  xp: number;
  xpPerLevel?: number;
}

export default function XPBar({ xp, xpPerLevel = 100 }: XPBarProps) {
  const currentLevelXP = xp % xpPerLevel;
  const progress = currentLevelXP / xpPerLevel;

  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <Text className="text-white text-xs opacity-80">經驗值</Text>
        <Text className="text-white text-xs opacity-80">{currentLevelXP} / {xpPerLevel} XP</Text>
      </View>
      <View className="bg-white/30 rounded-full h-2">
        <View
          className="bg-xp rounded-full h-2"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </View>
    </View>
  );
}
