import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import { RootState } from '../store';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import StudentsScreen from '../screens/StudentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
    </HomeStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Attendance') {
            iconName = 'how-to-reg';
          } else if (route.name === 'Students') {
            iconName = 'people';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsScreen}
        options={{ title: 'Students' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;