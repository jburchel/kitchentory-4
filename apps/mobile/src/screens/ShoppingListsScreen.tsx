import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Button } from '../components/ui';
import { fetchShoppingLists } from '../store/shoppingSlice';
import { AppDispatch, RootState } from '../store';

interface ShoppingListsScreenProps {
  navigation: any;
}

const ShoppingListsScreen: React.FC<ShoppingListsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { lists, loading } = useSelector((state: RootState) => state.shopping);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchShoppingLists());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ShoppingListDetail', { listId: item.id })}
    >
      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground mb-1">
                {item.name}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Created {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded ${item.is_active ? 'bg-primary' : 'bg-muted'}`}>
              <Text className={`text-xs font-medium ${item.is_active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {item.is_active ? 'Active' : 'Completed'}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-muted-foreground text-center mb-4">
              No shopping lists yet
            </Text>
            <Button>Create Your First List</Button>
          </View>
        }
      />
    </View>
  );
};

export default ShoppingListsScreen;
