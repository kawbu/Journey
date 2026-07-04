import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DatesScreen from '../screens/DatesScreen';
import MapScreen from '../screens/MapScreen';
import BucketListScreen from '../screens/BucketListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlanDateScreen from '../screens/PlanDateScreen';
import PastDatesScreen from '../screens/PastDatesScreen';
import TabBar from './TabBar';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Dates" component={DatesScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="BucketList" component={BucketListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isAuthenticated) return <AuthNavigator />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="PlanDate" component={PlanDateScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="PastDates" component={PastDatesScreen} />
    </Stack.Navigator>
  );
}
