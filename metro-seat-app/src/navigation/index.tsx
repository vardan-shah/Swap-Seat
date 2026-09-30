import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store/mockStore';
import { translations } from '../i18n';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import OfferSeatScreen from '../screens/OfferSeatScreen';
import FindSeatScreen from '../screens/FindSeatScreen';
import OpportunityListScreen from '../screens/OpportunityListScreen';
import ActiveMatchScreen from '../screens/ActiveMatchScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TimetableScreen from '../screens/timetable/TimetableScreen';
import AboutScreen from '../screens/about/AboutScreen';
import { Direction } from '../types';

export type RootStackParamList = {
  Tabs: undefined;
  OfferSeat: undefined;
  FindSeat: undefined;
  OpportunityList: { currentStationId: string; destinationStationId: string; direction: Direction };
  ActiveMatch: { matchId: string };
};

export type AuthStackParamList = {
  Login: undefined;
};

export type TabParamList = {
  Home: undefined;
  Timetable: undefined;
  Profile: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const lang = useAppStore(state => state.language);
  const t = translations[lang];

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF8200' }}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: t.home, tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 16, paddingBottom: 10 } }} 
      />
      <Tab.Screen 
        name="Timetable" 
        component={TimetableScreen} 
        options={{ tabBarLabel: t.timetable, tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 16, paddingBottom: 10 } }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: t.profile, tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 16, paddingBottom: 10 } }} 
      />
      <Tab.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ tabBarLabel: 'About', tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 16, paddingBottom: 10 } }} 
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="OfferSeat" component={OfferSeatScreen} options={{ title: 'Offer a Seat' }} />
      <Stack.Screen name="FindSeat" component={FindSeatScreen} options={{ title: 'Find a Seat' }} />
      <Stack.Screen name="OpportunityList" component={OpportunityListScreen} options={{ title: 'Available Seats' }} />
      <Stack.Screen name="ActiveMatch" component={ActiveMatchScreen} options={{ title: 'Active Match' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
