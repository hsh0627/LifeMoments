import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <Text className={`text-center ${focused ? 'opacity-100' : 'opacity-40'}`}>
      {emoji}{'\n'}
      <Text className={`text-xs ${focused ? 'text-primary font-bold' : 'text-muted'}`}>
        {label}
      </Text>
    </Text>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingTop: insets.top },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
          paddingBottom: insets.bottom || 8,
          height: 70 + (insets.bottom || 0),
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
  );
}
