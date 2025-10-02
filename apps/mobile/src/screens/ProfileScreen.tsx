import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { logout } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const settingsOptions = [
    { title: 'Account Settings', icon: '👤', screen: 'AccountSettings' },
    { title: 'Notifications', icon: '🔔', screen: 'Notifications' },
    { title: 'Subscription', icon: '💳', screen: 'Subscription' },
    { title: 'Household', icon: '🏠', screen: 'Household' },
    { title: 'Help & Support', icon: '❓', screen: 'Support' },
    { title: 'About', icon: 'ℹ️', screen: 'About' },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
                <Text className="text-4xl text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <CardTitle className="text-center">{user?.name || 'User'}</CardTitle>
              <Text className="text-sm text-muted-foreground mt-1">{user?.email}</Text>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-around py-4 border-t border-border">
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">-</Text>
                <Text className="text-sm text-muted-foreground">Items</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">-</Text>
                <Text className="text-sm text-muted-foreground">Recipes</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">-</Text>
                <Text className="text-sm text-muted-foreground">Lists</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-0">
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={option.title}
                className={`flex-row items-center justify-between p-4 ${
                  index < settingsOptions.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{option.icon}</Text>
                  <Text className="text-foreground font-medium">{option.title}</Text>
                </View>
                <Text className="text-muted-foreground">›</Text>
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        <Button variant="destructive" onPress={handleLogout} className="mb-4">
          Sign Out
        </Button>

        <Text className="text-center text-xs text-muted-foreground mb-8">
          Kitchentory v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
