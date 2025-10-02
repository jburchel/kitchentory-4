import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import { register, clearError } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    setValidationError('');

    if (!name || !email || !password || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    await dispatch(register({ name, email, password }));
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, []);

  const displayError = validationError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground text-center mb-2">
            Create Account
          </Text>
          <Text className="text-muted-foreground text-center">
            Join Kitchentory today
          </Text>
        </View>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                disabled={loading}
              />
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
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                disabled={loading}
              />

              {displayError && (
                <View className="bg-destructive/10 p-3 rounded-md">
                  <Text className="text-destructive text-sm">{displayError}</Text>
                </View>
              )}

              <Button
                onPress={handleRegister}
                loading={loading}
                disabled={loading || !name || !email || !password || !confirmPassword}
                className="mt-2"
              >
                Create Account
              </Button>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Text className="text-primary font-medium">Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
