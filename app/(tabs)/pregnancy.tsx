import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import PixelText from '../../components/PixelText';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function DatePickerModal({
  visible,
  initialDate,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}) {
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth() + 1);
  const [day, setDay] = useState(initialDate.getDate());

  const thisYear = new Date().getFullYear();
  const years = [thisYear - 1, thisYear];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay = daysInMonth(year, month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const Column = ({
    items,
    selected,
    onSelect,
    unit,
  }: {
    items: number[];
    selected: number;
    onSelect: (v: number) => void;
    unit: string;
  }) => (
    <ScrollView style={{ flex: 1, maxHeight: 220 }}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={{
            paddingVertical: 10,
            alignItems: 'center',
            backgroundColor: item === selected ? '#7C5C3E' : 'transparent',
            borderRadius: 6,
          }}
          onPress={() => onSelect(item)}
        >
          <PixelText size="xs" color={item === selected ? '#FFFFFF' : '#3B2A1A'}>
            {item}{unit}
          </PixelText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: '#F5EDD8', borderRadius: 16, padding: 20 }}>
          <PixelText size="xs" outlined color="#FFFFFF" style={{ marginBottom: 12, textAlign: 'center' }}>選擇日期</PixelText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Column items={years} selected={year} unit="年" onSelect={setYear} />
            <Column
              items={months}
              selected={month}
              unit="月"
              onSelect={(m) => {
                setMonth(m);
                if (day > daysInMonth(year, m)) setDay(daysInMonth(year, m));
              }}
            />
            <Column items={days} selected={day} unit="日" onSelect={setDay} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 4, backgroundColor: '#D9C9B0' }}
              onPress={onCancel}
            >
              <PixelText size="xs" color="#7C5C3E">取消</PixelText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 4, backgroundColor: '#7C5C3E' }}
              onPress={() => onConfirm(new Date(year, month - 1, day))}
            >
              <PixelText size="xs" outlined color="#FFFFFF">確定</PixelText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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

type InputMode = 'lmp' | 'weeks';

export default function Pregnancy() {
  const { profile, currentWeek, setProfile, addXP, unlockBadge } = usePregnancyStore();
  const [inputMode, setInputMode] = useState<InputMode>('lmp');
  const [lmpDate, setLmpDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [weeksInput, setWeeksInput] = useState('');
  const [daysInput, setDaysInput] = useState('0');
  const [isEditing, setIsEditing] = useState(!profile);
  const insets = useSafeAreaInsets();

  const saveProfile = (lmp: Date) => {
    const lmpStr = formatDate(lmp);
    const due = new Date(lmp);
    due.setDate(due.getDate() + 280);
    setProfile({ id: Date.now().toString(), lmpDate: lmpStr, dueDate: formatDate(due) });
    addXP(30);
    unlockBadge('week_' + Math.floor(currentWeek / 4) * 4);
    setIsEditing(false);
  };

  const handleSaveLmp = () => {
    saveProfile(lmpDate);
  };

  const handleSaveWeeks = () => {
    const weeks = parseInt(weeksInput, 10);
    const days = parseInt(daysInput || '0', 10);
    if (isNaN(weeks) || weeks < 0 || weeks > 42) {
      Alert.alert('格式錯誤', '請輸入正確的週數（0-42）');
      return;
    }
    if (isNaN(days) || days < 0 || days > 6) {
      Alert.alert('格式錯誤', '天數請輸入 0-6');
      return;
    }
    const totalDays = weeks * 7 + days;
    const computedLmp = new Date();
    computedLmp.setDate(computedLmp.getDate() - totalDays);
    saveProfile(computedLmp);
  };

  if (isEditing || !profile) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#F5EDD8' }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: 32, gap: 16 }}>
        <PixelText size="sm" outlined color="#FFFFFF">🤰 懷孕資料</PixelText>
        <PixelText size="xs" color="#9C8570">選擇輸入方式</PixelText>

        {/* 模式切換 */}
        <View style={{ flexDirection: 'row', backgroundColor: '#D9C9B0', borderRadius: 8, padding: 4 }}>
          {([['lmp', '末次月經日期'], ['weeks', '直接輸入週數']] as [InputMode, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: inputMode === key ? '#FDF6E3' : 'transparent' }}
              onPress={() => setInputMode(key)}
            >
              <PixelText size="xs" color={inputMode === key ? '#7C5C3E' : '#9C8570'}>{label}</PixelText>
            </TouchableOpacity>
          ))}
        </View>

        {inputMode === 'lmp' ? (
          <>
            <PixelText size="xs" color="#3B2A1A" style={{ marginTop: 8 }}>末次月經日期</PixelText>
            <TouchableOpacity style={inputStyle} onPress={() => setShowPicker(true)}>
              <Text style={{ fontFamily: 'DotGothic16_400Regular', fontSize: 16, color: '#3B2A1A' }}>
                {formatDate(lmpDate)}
              </Text>
            </TouchableOpacity>
            <DatePickerModal
              visible={showPicker}
              initialDate={lmpDate}
              onConfirm={(date) => {
                setLmpDate(date);
                setShowPicker(false);
              }}
              onCancel={() => setShowPicker(false)}
            />

            <TouchableOpacity
              style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
              onPress={handleSaveLmp}
            >
              <PixelText size="xs" outlined color="#FFFFFF">[ 儲存 +30 XP ]</PixelText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <PixelText size="xs" color="#3B2A1A" style={{ marginTop: 8 }}>目前懷孕幾週幾天</PixelText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={inputStyle}
                  placeholder="週數，例如：20"
                  keyboardType="number-pad"
                  value={weeksInput}
                  onChangeText={setWeeksInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={inputStyle}
                  placeholder="天數，例如：3"
                  keyboardType="number-pad"
                  value={daysInput}
                  onChangeText={setDaysInput}
                />
              </View>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
              onPress={handleSaveWeeks}
            >
              <PixelText size="xs" outlined color="#FFFFFF">[ 儲存 +30 XP ]</PixelText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(profile.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5EDD8' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 8 }}>
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
        <PixelText size="xs" color="#9C8570">修改懷孕資料</PixelText>
      </TouchableOpacity>
    </ScrollView>
  );
}
