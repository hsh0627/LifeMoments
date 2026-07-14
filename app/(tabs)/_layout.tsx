import { Tabs, Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LevelUpModal from '../../components/LevelUpModal';
import RoleSelectScreen from '../../components/RoleSelectScreen';
import StorylineSelectScreen from '../../components/StorylineSelectScreen';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LIFEMOMENT_CONFIG } from '../../lib/lifemoments';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', opacity: focused ? 1 : 0.4 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 11,
          marginTop: 2,
          color: focused ? '#7C5C3E' : '#9C8570',
          fontWeight: focused ? '700' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const storyline = usePregnancyStore((s) => s.storyline);
  const role = usePregnancyStore((s) => s.role);
  const session = useAuthStore((s) => s.session);

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!storyline) {
    return <StorylineSelectScreen />;
  }

  const needsRole = LIFEMOMENT_CONFIG[storyline].needsRole;
  if (needsRole && !role) {
    return <RoleSelectScreen />;
  }

  return (
    <>
    <LevelUpModal />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
          paddingTop: 8,
          paddingBottom: insets.bottom || 8,
          height: 56 + (insets.bottom || 0),
        },
        tabBarItemStyle: {
          justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '首頁',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="首頁" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="pregnancy"
        options={{
          title: '懷孕',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🤰" label="懷孕" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: '清單',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="清單" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="我的" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
    </>
  );
}
