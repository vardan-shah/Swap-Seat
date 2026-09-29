import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import OfferSeatScreen from '../screens/OfferSeatScreen';
import FindSeatScreen from '../screens/FindSeatScreen';
import OpportunityListScreen from '../screens/OpportunityListScreen';
import ActiveMatchScreen from '../screens/ActiveMatchScreen';

export type RootStackParamList = {
  Home: undefined;
  OfferSeat: undefined;
  FindSeat: undefined;
  OpportunityList: { currentStationId: string; destinationStationId: string; direction: 'Northbound' | 'Southbound' };
  ActiveMatch: { matchId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{
        headerStyle: { backgroundColor: '#FF8200' }, // GMRC orange-ish
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Metro Seat Handoff' }} />
        <Stack.Screen name="OfferSeat" component={OfferSeatScreen} options={{ title: 'Offer a Seat' }} />
        <Stack.Screen name="FindSeat" component={FindSeatScreen} options={{ title: 'Find a Seat' }} />
        <Stack.Screen name="OpportunityList" component={OpportunityListScreen} options={{ title: 'Available Seats' }} />
        <Stack.Screen name="ActiveMatch" component={ActiveMatchScreen} options={{ title: 'Active Handoff', headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
