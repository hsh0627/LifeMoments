import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore } from '../store/usePregnancyStore';
import { supabase } from '../lib/supabase';
import PixelText from './PixelText';

const AVAILABLE_LINE = { key: 'pregnancy' as const, emoji: '🤰', title: '懷孕', desc: '孕期追蹤、產檢提醒、待產準備' };

const STORYLINE_LABEL: Record<string, { emoji: string; title: string }> = {
  pregnancy: { emoji: '🤰', title: '懷孕' },
};

const DEFAULT_LOCKED_LINES = [
  { emoji: '👶', title: '育兒' },
  { emoji: '💍', title: '結婚' },
  { emoji: '🏠', title: '買房' },
  { emoji: '🚗', title: '買車' },
  { emoji: '📦', title: '搬家' },
  { emoji: '💼', title: '創業/轉職' },
  { emoji: '🏖️', title: '退休規劃' },
  { emoji: '🐾', title: '寵物' },
];

const ORDER_STORAGE_KEY = 'lifemoments_locked_lines_order';

export default function StorylineSelectScreen() {
  const startNewLifeMoment = usePregnancyStore((s) => s.startNewLifeMoment);
  const switchToInstance = usePregnancyStore((s) => s.switchToInstance);
  const removeInstance = usePregnancyStore((s) => s.removeInstance);
  const instances = usePregnancyStore((s) => s.instances);
  const insets = useSafeAreaInsets();
  const [lockedLines, setLockedLines] = useState(DEFAULT_LOCKED_LINES);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ORDER_STORAGE_KEY).then((saved) => {
      if (!saved) return;
      try {
        const order: string[] = JSON.parse(saved);
        const byTitle = new Map(DEFAULT_LOCKED_LINES.map((l) => [l.title, l]));
        const restored = order.map((title) => byTitle.get(title)).filter((l): l is typeof DEFAULT_LOCKED_LINES[number] => !!l);
        const missing = DEFAULT_LOCKED_LINES.filter((l) => !order.includes(l.title));
        setLockedLines([...restored, ...missing]);
      } catch {
        // ignore corrupted data
      }
    });
  }, []);

  const persist = (lines: typeof DEFAULT_LOCKED_LINES) => {
    setLockedLines(lines);
    AsyncStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(lines.map((l) => l.title)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= lockedLines.length) return;
    const next = [...lockedLines];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };

  const handleLogout = () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '登出', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  const handleDeleteInstance = (id: string, title: string) => {
    Alert.alert('刪除紀錄', `確定要從背包移除「${title}」這筆紀錄嗎？此動作無法復原（本機資料會被刪除，雲端資料不受影響）。`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => removeInstance(id) },
    ]);
  };

  const handleStartNew = () => {
    const existing = instances.filter((i) => i.storyline === AVAILABLE_LINE.key).length;
    if (existing > 0) {
      Alert.alert(
        '要開新的一筆嗎？',
        `你的背包裡已經有 ${existing} 筆「${AVAILABLE_LINE.title}」紀錄了。這會另外開一筆全新的（例如懷第二胎），不會覆蓋原本的資料。`,
        [
          { text: '取消', style: 'cancel' },
          { text: '開新的', onPress: () => startNewLifeMoment(AVAILABLE_LINE.key) },
        ]
      );
    } else {
      startNewLifeMoment(AVAILABLE_LINE.key);
    }
  };

  const formatCreatedAt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const sortedInstances = [...instances].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5EDD8' }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, gap: 16 }}
    >
      <TouchableOpacity style={{ position: 'absolute', top: insets.top + 12, right: 24, zIndex: 1 }} onPress={handleLogout}>
        <PixelText size="xs" color="#9C8570">登出</PixelText>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <PixelText size="lg" outlined color="#FFFFFF">選擇你的人生大事</PixelText>
        <PixelText size="xs" color="#9C8570" style={{ marginTop: 8, textAlign: 'center' }}>
          人生有很多階段，先從一個開始冒險吧
        </PixelText>
      </View>

      {/* 背包：之前已經開始過、暫時放著的人生大事 */}
      {instances.length > 0 && (
        <View style={{ gap: 12 }}>
          <PixelText size="xs" color="#9C8570">繼續之前的冒險</PixelText>
          {sortedInstances.map((inst, index) => {
            const label = STORYLINE_LABEL[inst.storyline] ?? { emoji: '📌', title: inst.storyline };
            const sameTypeCount = sortedInstances.filter((i) => i.storyline === inst.storyline).length;
            return (
              <TouchableOpacity
                key={inst.id}
                activeOpacity={0.7}
                style={{ backgroundColor: '#7C5C3E', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                onPress={() => switchToInstance(inst.id)}
              >
                <Text style={{ fontSize: 28 }}>{label.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <PixelText size="xs" outlined color="#FFFFFF">
                    {label.title}{sameTypeCount > 1 ? `・第 ${index + 1} 筆` : ''}
                  </PixelText>
                  <PixelText size="xs" color="#D9C9B0" style={{ marginTop: 2 }}>
                    Lv.{inst.level}・{inst.xp} XP・建立於 {formatCreatedAt(inst.createdAt)}
                  </PixelText>
                </View>
                <PixelText size="xs" color="#FDF6E3">繼續 →</PixelText>
                <TouchableOpacity onPress={() => handleDeleteInstance(inst.id, label.title)} style={{ padding: 4 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <PixelText size="xs" color="#E0B8A8">🗑</PixelText>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 所有人生大事：已開放 + 開發中，統一排版 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <PixelText size="xs" color="#9C8570">開始新的冒險</PixelText>
        <TouchableOpacity onPress={() => setEditing((e) => !e)}>
          <PixelText size="xs" color="#7C5C3E">{editing ? '完成' : '編輯順序'}</PixelText>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            width: '30%',
            backgroundColor: '#C4885A',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            gap: 6,
          }}
          disabled={editing}
          onPress={handleStartNew}
        >
          <Text style={{ fontSize: 26 }}>{AVAILABLE_LINE.emoji}</Text>
          <PixelText size="xs" outlined color="#FFFFFF" style={{ textAlign: 'center' }}>{AVAILABLE_LINE.title}</PixelText>
        </TouchableOpacity>

        {lockedLines.map((line, index) => (
          <View
            key={line.title}
            style={{
              width: '30%',
              backgroundColor: '#D9C9B0',
              borderRadius: 12,
              alignItems: 'center',
              gap: 6,
              opacity: 0.75,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ width: '100%', alignItems: 'center', gap: 6, paddingVertical: 16 }}
              disabled={editing}
              onPress={() => Alert.alert('即將推出', `「${line.title}」正在開發中，敬請期待！`)}
            >
              <Text style={{ fontSize: 26 }}>{line.emoji}</Text>
              <PixelText size="xs" color="#7C5C3E" style={{ textAlign: 'center' }}>{line.title}</PixelText>
            </TouchableOpacity>
            {editing && (
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, marginTop: -6 }}>
                <TouchableOpacity onPress={() => move(index, -1)} disabled={index === 0} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <PixelText size="xs" color={index === 0 ? '#B5A78E' : '#7C5C3E'}>◀</PixelText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => move(index, 1)} disabled={index === lockedLines.length - 1} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <PixelText size="xs" color={index === lockedLines.length - 1 ? '#B5A78E' : '#7C5C3E'}>▶</PixelText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
