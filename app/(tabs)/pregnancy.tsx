import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import PixelText from '../../components/PixelText';

const inputStyle = {
  backgroundColor: '#FDF6E3',
  borderWidth: 2,
  borderColor: '#D9C9B0',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontFamily: 'DotGothic16_400Regular',
  fontSize: 16,
  color: '#3B2A1A',
};

function WeekInfo({ week }: { week: number }) {
  const info: Record<number, { baby: string; size: string; tip: string }> = {
    4:  { baby: '🫘', size: '罌粟籽大小', tip: '早期確認懷孕，安排初診' },
    8:  { baby: '🫐', size: '藍莓大小', tip: '建議掛婦產科初診' },
    12: { baby: '🍋', size: '萊姆大小', tip: '第一孕期篩檢，唐氏症篩檢' },
    16: { baby: '🥑', size: '酪梨大小', tip: '可感受到胎動' },
    20: { baby: '🍌', size: '香蕉大小', tip: '第二次大排畸超音波' },
    24: { baby: '🌽', size: '玉米大小', tip: '妊娠糖尿病篩查' },
    28: { baby: '🍆', size: '茄子大小', tip: '進入第三孕期' },
    32: { baby: '🥬', size: '高麗菜大小', tip: '開始準備待產包' },
    36: { baby: '🍈', size: '蜜瓜大小', tip: '每週產檢，準備住院' },
    40: { baby: '🎃', size: '南瓜大小', tip: '預產期！寶寶快來了' },
  };

  const closest = Object.keys(info)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev));

  const data = info[closest];

  return (
    <View style={{ backgroundColor: '#FDF6E3', borderRadius: 12, padding: 16, marginTop: 16, marginHorizontal: 24 }}>
      <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 8 }}>{data.baby}</Text>
      <PixelText size="xs" color="#3B2A1A" style={{ textAlign: 'center', marginBottom: 4 }}>約 {data.size}</PixelText>
      <PixelText size="xs" color="#9C8570" style={{ textAlign: 'center' }}>💡 {data.tip}</PixelText>
    </View>
  );
}

export default function Pregnancy() {
  const { profile, currentWeek, setProfile, addXP, unlockBadge } = usePregnancyStore();
  const [lmpInput, setLmpInput] = useState('');
  const [isEditing, setIsEditing] = useState(!profile);

  const handleSave = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(lmpInput)) {
      Alert.alert('格式錯誤', '請輸入 YYYY-MM-DD 格式，例如：2024-10-01');
      return;
    }
    const lmp = new Date(lmpInput);
    const due = new Date(lmp);
    due.setDate(due.getDate() + 280);
    setProfile({ id: Date.now().toString(), lmpDate: lmpInput, dueDate: due.toISOString().split('T')[0] });
    addXP(30);
    unlockBadge('week_' + Math.floor(currentWeek / 4) * 4);
    setIsEditing(false);
  };

  if (isEditing || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5EDD8', paddingHorizontal: 24, justifyContent: 'center', gap: 16 }}>
        <PixelText size="sm" outlined color="#FFFFFF">🤰 懷孕資料</PixelText>
        <PixelText size="xs" color="#9C8570">輸入末次月經日期來計算週數</PixelText>

        <PixelText size="xs" color="#3B2A1A" style={{ marginTop: 8 }}>末次月經日期</PixelText>
        <TextInput
          style={inputStyle}
          placeholder="YYYY-MM-DD，例如：2024-10-01"
          value={lmpInput}
          onChangeText={setLmpInput}
        />

        <TouchableOpacity
          style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
          onPress={handleSave}
        >
          <PixelText size="xs" outlined color="#FFFFFF">[ 儲存 +30 XP ]</PixelText>
        </TouchableOpacity>
      </View>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(profile.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5EDD8' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <PixelText size="sm" outlined color="#FFFFFF">🤰 懷孕旅程</PixelText>
      </View>

      {/* 週數卡 */}
      <View style={{ marginHorizontal: 24, backgroundColor: '#C4885A', borderRadius: 16, padding: 20, marginTop: 8 }}>
        <PixelText size="xs" color="#FDF6E3" style={{ opacity: 0.8 }}>目前週數</PixelText>
        <PixelText size="xl" outlined color="#FFFFFF" style={{ marginTop: 4 }}>{currentWeek} 週</PixelText>
        <PixelText size="xs" color="#FDF6E3" style={{ marginTop: 8, opacity: 0.8 }}>距離預產期還有 {daysLeft} 天</PixelText>
        <PixelText size="xs" color="#FDF6E3" style={{ marginTop: 4, opacity: 0.6 }}>預產期：{profile.dueDate}</PixelText>
      </View>

      <WeekInfo week={currentWeek} />

      <TouchableOpacity
        style={{ marginHorizontal: 24, marginTop: 16, paddingVertical: 12, alignItems: 'center' }}
        onPress={() => setIsEditing(true)}
      >
        <PixelText size="xs" color="#9C8570">修改末次月經日期</PixelText>
      </TouchableOpacity>
    </ScrollView>
  );
}
