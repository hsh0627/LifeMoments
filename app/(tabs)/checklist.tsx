import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import PixelText from '../../components/PixelText';

type CheckItem = { id: string; title: string; done: boolean; xp: number };

const DEFAULT_CHECKUP_LIST: CheckItem[] = [
  { id: 'c1', title: '初診（確認懷孕）', done: false, xp: 30 },
  { id: 'c2', title: '8-12週 第一孕期超音波', done: false, xp: 20 },
  { id: 'c3', title: '11-13週 唐氏症篩檢', done: false, xp: 20 },
  { id: 'c4', title: '20週 大排畸超音波', done: false, xp: 25 },
  { id: 'c5', title: '24-28週 妊娠糖尿病篩查', done: false, xp: 20 },
  { id: 'c6', title: '35-37週 乙型鏈球菌篩查', done: false, xp: 20 },
];

const DEFAULT_BAG_LIST: CheckItem[] = [
  { id: 'b1', title: '孕婦手冊、健保卡、身分證', done: false, xp: 10 },
  { id: 'b2', title: '換洗衣物（3套）', done: false, xp: 10 },
  { id: 'b3', title: '產褥墊', done: false, xp: 5 },
  { id: 'b4', title: '母乳墊', done: false, xp: 5 },
  { id: 'b5', title: '寶寶衣物（新生兒 2-3套）', done: false, xp: 10 },
  { id: 'b6', title: '包巾 2條', done: false, xp: 5 },
  { id: 'b7', title: '濕紙巾', done: false, xp: 5 },
  { id: 'b8', title: '充電器', done: false, xp: 5 },
];

type TabKey = 'checkup' | 'bag';

export default function Checklist() {
  const { addXP, unlockBadge } = usePregnancyStore();
  const [activeTab, setActiveTab] = useState<TabKey>('checkup');
  const [checkup, setCheckup] = useState(DEFAULT_CHECKUP_LIST);
  const [bag, setBag] = useState(DEFAULT_BAG_LIST);

  const list = activeTab === 'checkup' ? checkup : bag;
  const setList = activeTab === 'checkup' ? setCheckup : setBag;

  const toggle = (id: string) => {
    const item = list.find((i) => i.id === id);
    if (!item || item.done) return;
    setList((prev) => prev.map((i) => i.id === id ? { ...i, done: true } : i));
    addXP(item.xp);
    const doneCount = list.filter((i) => i.done).length + 1;
    if (doneCount === list.length) unlockBadge('checklist_pro');
  };

  const doneCount = list.filter((i) => i.done).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#F5EDD8' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <PixelText size="sm" outlined color="#FFFFFF">📋 任務清單</PixelText>
        <PixelText size="xs" color="#9C8570" style={{ marginTop: 4 }}>完成任務獲得 XP！</PixelText>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 24, backgroundColor: '#D9C9B0', borderRadius: 8, padding: 4, marginBottom: 16 }}>
        {([['checkup', '產檢行程'], ['bag', '待產包']] as [TabKey, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: activeTab === key ? '#FDF6E3' : 'transparent' }}
            onPress={() => setActiveTab(key)}
          >
            <PixelText size="xs" color={activeTab === key ? '#7C5C3E' : '#9C8570'}>{label}</PixelText>
          </TouchableOpacity>
        ))}
      </View>

      {/* 進度 */}
      <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <PixelText size="xs" color="#9C8570">進度</PixelText>
          <PixelText size="xs" color="#7C5C3E">{doneCount} / {list.length}</PixelText>
        </View>
        <View style={{ backgroundColor: '#D9C9B0', borderRadius: 4, height: 8 }}>
          <View style={{ backgroundColor: '#7C5C3E', borderRadius: 4, height: 8, width: `${list.length ? (doneCount / list.length) * 100 : 0}%` }} />
        </View>
      </View>

      <ScrollView style={{ paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 32, gap: 12 }}>
        {list.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: item.done ? 0.5 : 1, elevation: 1 }}
            onPress={() => toggle(item.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: item.done ? '#5A7A4A' : '#D9C9B0', backgroundColor: item.done ? '#5A7A4A' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {item.done && <Text style={{ color: '#FDF6E3', fontSize: 14 }}>✓</Text>}
              </View>
              <PixelText size="xs" color="#3B2A1A" style={{ flex: 1, textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.title}</PixelText>
            </View>
            {!item.done && (
              <View style={{ backgroundColor: '#FFF3CD', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 }}>
                <PixelText size="xs" color="#7C5C3E">+{item.xp} XP</PixelText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
