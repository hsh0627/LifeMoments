import { View, Text, ScrollView, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePregnancyStore, PregnancyStage, ChecklistCategory, ChecklistItem } from '../../store/usePregnancyStore';
import { getItemStatus, STATUS_STYLE } from '../../lib/checklistStatus';
import { CATEGORY_META, STAGE_META, STAGE_ORDER, BAG_ITEM_EMOJI } from '../../lib/checklistMeta';
import PixelText from '../../components/PixelText';
import PackingItemCard from '../../components/PackingItemCard';
import PackCompleteModal from '../../components/PackCompleteModal';

function ChecklistRow({ item, onPress, showCategory }: { item: ChecklistItem; onPress: () => void; showCategory?: boolean }) {
  const { currentWeek } = usePregnancyStore();
  const status = getItemStatus(item, currentWeek);
  const category = CATEGORY_META[item.category];
  return (
    <TouchableOpacity
      style={{ backgroundColor: '#FDF6E3', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: item.done ? 0.5 : 1, elevation: 1 }}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: item.done ? '#5A7A4A' : '#D9C9B0', backgroundColor: item.done ? '#5A7A4A' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {item.done && <Text style={{ color: '#FDF6E3', fontSize: 14 }}>✓</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <PixelText size="xs" color="#3B2A1A" style={{ textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.title}</PixelText>
          {(showCategory || status) && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {showCategory && (
                <View style={{ alignSelf: 'flex-start', backgroundColor: '#EDE4D0', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <PixelText size="xs" color="#7C5C3E">{category.emoji} {category.label}</PixelText>
                </View>
              )}
              {status && (
                <View style={{ alignSelf: 'flex-start', backgroundColor: STATUS_STYLE[status].bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <PixelText size="xs" color={STATUS_STYLE[status].color}>{STATUS_STYLE[status].label}</PixelText>
                </View>
              )}
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
}

export default function Checklist() {
  const { checklist, completeChecklistItem, currentWeek } = usePregnancyStore();
  const insets = useSafeAreaInsets();
  const { stage: stageParam } = useLocalSearchParams<{ stage?: string }>();
  const [activeStage, setActiveStage] = useState<PregnancyStage>('early');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showCompleted, setShowCompleted] = useState<Record<string, boolean>>({});
  const [showPackComplete, setShowPackComplete] = useState(false);
  const wasBagFullyPackedRef = useRef(false);

  useEffect(() => {
    if (STAGE_ORDER.includes(stageParam as PregnancyStage)) {
      setActiveStage(stageParam as PregnancyStage);
    }
  }, [stageParam]);

  const activeStageRef = useRef(activeStage);
  activeStageRef.current = activeStage;

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const prevIndexRef = useRef(STAGE_ORDER.indexOf(activeStage));

  useEffect(() => {
    const index = STAGE_ORDER.indexOf(activeStage);
    const direction = index > prevIndexRef.current ? 1 : index < prevIndexRef.current ? -1 : 0;
    prevIndexRef.current = index;
    if (direction === 0) return;
    translateX.setValue(direction * 40);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [activeStage]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) < 50) return;
        const index = STAGE_ORDER.indexOf(activeStageRef.current);
        if (gesture.dx < 0 && index < STAGE_ORDER.length - 1) {
          setActiveStage(STAGE_ORDER[index + 1]);
        } else if (gesture.dx > 0 && index > 0) {
          setActiveStage(STAGE_ORDER[index - 1]);
        }
      },
    })
  ).current;

  const list = checklist.filter((i) => i.stage === activeStage);
  const doneCount = list.filter((i) => i.done).length;

  const pendingByCategory = useMemo(() => {
    const groups: { category: ChecklistCategory; items: ChecklistItem[] }[] = [];
    for (const item of list) {
      if (item.done || item.category === 'bag') continue;
      let group = groups.find((g) => g.category === item.category);
      if (!group) {
        group = { category: item.category, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [list]);

  const completedItems = useMemo(
    () =>
      list
        .filter((i) => i.done && i.category !== 'bag')
        .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0)),
    [list]
  );

  const bagItems = useMemo(() => list.filter((i) => i.category === 'bag'), [list]);

  useEffect(() => {
    const fullyPacked = bagItems.length > 0 && bagItems.every((i) => i.done);
    if (fullyPacked && !wasBagFullyPackedRef.current) {
      setShowPackComplete(true);
    }
    wasBagFullyPackedRef.current = fullyPacked;
  }, [bagItems]);

  const toggleCategory = (category: ChecklistCategory) => {
    const key = `${activeStage}:${category}`;
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5EDD8' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 8 }}>
        <PixelText size="sm" outlined color="#FFFFFF">📋 任務清單</PixelText>
        <PixelText size="xs" color="#9C8570" style={{ marginTop: 4 }}>完成任務獲得 XP！</PixelText>
      </View>

      {/* 孕期階段 Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 24, backgroundColor: '#D9C9B0', borderRadius: 8, padding: 4, marginBottom: 16 }}>
        {STAGE_ORDER.map((stage) => (
          <TouchableOpacity
            key={stage}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', backgroundColor: activeStage === stage ? '#FDF6E3' : 'transparent' }}
            onPress={() => setActiveStage(stage)}
          >
            <PixelText size="xs" color={activeStage === stage ? '#7C5C3E' : '#9C8570'}>{STAGE_META[stage].shortLabel}</PixelText>
          </TouchableOpacity>
        ))}
      </View>

      {/* 進度 */}
      <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <PixelText size="xs" color="#9C8570">{STAGE_META[activeStage].label} 進度</PixelText>
          <PixelText size="xs" color="#7C5C3E">{doneCount} / {list.length}</PixelText>
        </View>
        <View style={{ backgroundColor: '#D9C9B0', borderRadius: 4, height: 8 }}>
          <View style={{ backgroundColor: '#7C5C3E', borderRadius: 4, height: 8, width: `${list.length ? (doneCount / list.length) * 100 : 0}%` }} />
        </View>
      </View>

      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Animated.ScrollView style={[{ paddingHorizontal: 24 }, { opacity, transform: [{ translateX }] }]} contentContainerStyle={{ paddingBottom: 32, gap: 12 }}>
        {bagItems.length > 0 && (
          <View style={{ gap: 8 }}>
            <PixelText size="xs" color="#7C5C3E">🎒 待產包打包 ({bagItems.filter((i) => i.done).length} / {bagItems.length})</PixelText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '3%', rowGap: 12 }}>
              {bagItems.map((item) => (
                <PackingItemCard
                  key={item.id}
                  emoji={BAG_ITEM_EMOJI[item.id] ?? '🎒'}
                  title={item.title}
                  done={item.done}
                  onPress={() => completeChecklistItem(item.id)}
                />
              ))}
            </View>
          </View>
        )}

        {pendingByCategory.map(({ category, items }) => {
          const meta = CATEGORY_META[category];
          const key = `${activeStage}:${category}`;
          const collapsible = items.length > 1;
          const expanded = !collapsible || !!expandedCategories[key];
          return (
            <View key={category} style={{ gap: 8 }}>
              {collapsible && (
                <TouchableOpacity
                  style={{ backgroundColor: '#EDE4D0', borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  onPress={() => toggleCategory(category)}
                >
                  <PixelText size="xs" color="#7C5C3E">{meta.emoji} {meta.label} ({items.length})</PixelText>
                  <PixelText size="xs" color="#9C8570">{expanded ? '▲' : '▼'}</PixelText>
                </TouchableOpacity>
              )}
              {expanded && (
                <View style={{ gap: 12 }}>
                  {items.map((item) => (
                    <ChecklistRow key={item.id} item={item} onPress={() => completeChecklistItem(item.id)} showCategory={!collapsible} />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {completedItems.length > 0 && (
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#EDE4D0', borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={() => setShowCompleted((prev) => ({ ...prev, [activeStage]: !prev[activeStage] }))}
            >
              <PixelText size="xs" color="#7C5C3E">✅ 已完成 ({completedItems.length})</PixelText>
              <PixelText size="xs" color="#9C8570">{showCompleted[activeStage] ? '▲' : '▼'}</PixelText>
            </TouchableOpacity>
            {showCompleted[activeStage] && (
              <View style={{ gap: 12 }}>
                {completedItems.map((item) => (
                  <ChecklistRow key={item.id} item={item} onPress={() => completeChecklistItem(item.id)} />
                ))}
              </View>
            )}
          </View>
        )}
      </Animated.ScrollView>
      </View>
      <PackCompleteModal visible={showPackComplete} onClose={() => setShowPackComplete(false)} />
    </View>
  );
}
