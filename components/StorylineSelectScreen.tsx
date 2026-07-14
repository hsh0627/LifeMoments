import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore } from '../store/usePregnancyStore';
import { supabase } from '../lib/supabase';
import PixelText from './PixelText';

const AVAILABLE_LINE = { key: 'pregnancy' as const, emoji: '🤰', title: '懷孕', desc: '孕期追蹤、產檢提醒、待產準備' };

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
  const setStoryline = usePregnancyStore((s) => s.setStoryline);
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

      {/* 已開放人生大事 */}
      <TouchableOpacity
        style={{ backgroundColor: '#C4885A', borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 }}
        onPress={() => setStoryline(AVAILABLE_LINE.key)}
      >
        <Text style={{ fontSize: 44 }}>{AVAILABLE_LINE.emoji}</Text>
        <PixelText size="sm" outlined color="#FFFFFF">{AVAILABLE_LINE.title}</PixelText>
        <PixelText size="xs" color="#FDF6E3" style={{ opacity: 0.9, textAlign: 'center' }}>{AVAILABLE_LINE.desc}</PixelText>
      </TouchableOpacity>

      {/* 尚未開放人生大事 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <PixelText size="xs" color="#9C8570">更多人生大事・開發中</PixelText>
        <TouchableOpacity onPress={() => setEditing((e) => !e)}>
          <PixelText size="xs" color="#7C5C3E">{editing ? '完成' : '編輯順序'}</PixelText>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {lockedLines.map((line, index) => (
          <View
            key={line.title}
            style={{
              width: '30%',
              backgroundColor: '#D9C9B0',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              gap: 6,
              opacity: 0.75,
            }}
          >
            <TouchableOpacity
              style={{ alignItems: 'center', gap: 6 }}
              disabled={editing}
              onPress={() => Alert.alert('即將推出', `「${line.title}」正在開發中，敬請期待！`)}
            >
              <Text style={{ fontSize: 26 }}>{line.emoji}</Text>
              <PixelText size="xs" color="#7C5C3E" style={{ textAlign: 'center' }}>{line.title}</PixelText>
            </TouchableOpacity>
            {editing && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <TouchableOpacity onPress={() => move(index, -1)} disabled={index === 0}>
                  <PixelText size="xs" color={index === 0 ? '#B5A78E' : '#7C5C3E'}>◀</PixelText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => move(index, 1)} disabled={index === lockedLines.length - 1}>
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
