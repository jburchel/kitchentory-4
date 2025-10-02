import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InventoryScreen from '../screens/InventoryScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ShoppingListsScreen from '../screens/ShoppingListsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddInventoryItemScreen from '../screens/AddInventoryItemScreen';
import InventoryItemDetailScreen from '../screens/InventoryItemDetailScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import ShoppingListDetailScreen from '../screens/ShoppingListDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#fff' },
      tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <Tab.Screen
      name="Inventory"
      component={InventoryScreen}
      options={{
        title: 'Inventory',
        tabBarLabel: 'Inventory',
      }}
    />
    <Tab.Screen
      name="Recipes"
      component={RecipesScreen}
      options={{
        title: 'Recipes',
        tabBarLabel: 'Recipes',
      }}
    />
    <Tab.Screen
      name="Shopping"
      component={ShoppingListsScreen}
      options={{
        title: 'Shopping Lists',
        tabBarLabel: 'Shopping',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddInventoryItem"
      component={AddInventoryItemScreen}
      options={{
        title: 'Add Item',
      }}
    />
    <Stack.Screen
      name="InventoryItemDetail"
      component={InventoryItemDetailScreen}
      options={{
        title: 'Item Details',
      }}
    />
    <Stack.Screen
      name="RecipeDetail"
      component={RecipeDetailScreen}
      options={{
        title: 'Recipe',
      }}
    />
    <Stack.Screen
      name="ShoppingListDetail"
      component={ShoppingListDetailScreen}
      options={{
        title: 'Shopping List',
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
