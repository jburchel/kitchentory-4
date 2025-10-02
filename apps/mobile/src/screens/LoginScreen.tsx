import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import { login, clearError } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    await dispatch(login({ email, password }));
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground text-center mb-2">
            Kitchentory
          </Text>
          <Text className="text-muted-foreground text-center">
            Smart Kitchen Inventory Management
          </Text>
        </View>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                disabled={loading}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                disabled={loading}
              />

              {error && (
                <View className="bg-destructive/10 p-3 rounded-md">
                  <Text className="text-destructive text-sm">{error}</Text>
                </View>
              )}

              <Button
                onPress={handleLogin}
                loading={loading}
                disabled={loading || !email || !password}
                className="mt-2"
              >
                Sign In
              </Button>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text className="text-center text-sm text-muted-foreground mt-4">
                  Don't have an account?{' '}
                  <Text className="text-primary font-medium">Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
