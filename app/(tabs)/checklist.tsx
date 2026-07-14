import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore, ChecklistCategory } from '../../store/usePregnancyStore';
import { getItemStatus, STATUS_STYLE } from '../../lib/checklistStatus';
import PixelText from '../../components/PixelText';

type TabKey = ChecklistCategory;

export default function Checklist() {
  const { checklist, completeChecklistItem, currentWeek } = usePregnancyStore();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('checkup');

  const list = checklist.filter((i) => i.category === activeTab);
  const doneCount = list.filter((i) => i.done).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#F5EDD8' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 8 }}>
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
        {list.map((item) => {
          const status = getItemStatus(item, currentWeek);
          return (
          <TouchableOpacity
            key={item.id}
            style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: item.done ? 0.5 : 1, elevation: 1 }}
            onPress={() => completeChecklistItem(item.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: item.done ? '#5A7A4A' : '#D9C9B0', backgroundColor: item.done ? '#5A7A4A' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {item.done && <Text style={{ color: '#FDF6E3', fontSize: 14 }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <PixelText size="xs" color="#3B2A1A" style={{ textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.title}</PixelText>
                {status && (
                  <View style={{ alignSelf: 'flex-start', backgroundColor: STATUS_STYLE[status].bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 }}>
                    <PixelText size="xs" color={STATUS_STYLE[status].color}>{STATUS_STYLE[status].label}</PixelText>
                  </View>
                )}
              </View>
            </View>
            {!item.done && (
              <View style={{ backgroundColor: '#FFF3CD', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 }}>
                <PixelText size="xs" color="#7C5C3E">+{item.xp} XP</PixelText>
              </View>
            )}
          </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
