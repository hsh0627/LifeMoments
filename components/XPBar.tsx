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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12, opacity: 0.8 }}>經驗值</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 12, opacity: 0.8 }}>{currentLevelXP} / {xpPerLevel} XP</Text>
      </View>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, height: 8 }}>
        <View
          style={{ backgroundColor: '#FFD700', borderRadius: 99, height: 8, width: `${Math.round(progress * 100)}%` }}
        />
      </View>
    </View>
  );
}
