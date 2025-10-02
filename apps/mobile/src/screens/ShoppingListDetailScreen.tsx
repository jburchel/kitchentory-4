import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Button } from '../components/ui';
import { fetchShoppingList, toggleItemChecked, clearSelectedList } from '../store/shoppingSlice';
import { AppDispatch, RootState } from '../store';

interface ShoppingListDetailScreenProps {
  navigation: any;
  route: any;
}

const ShoppingListDetailScreen: React.FC<ShoppingListDetailScreenProps> = ({ navigation, route }) => {
  const { listId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedList } = useSelector((state: RootState) => state.shopping);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();

    return () => {
      dispatch(clearSelectedList());
    };
  }, [listId]);

  const loadData = async () => {
    await dispatch(fetchShoppingList(listId));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    await dispatch(toggleItemChecked({ listId, itemId, isChecked }));
  };

  if (!selectedList) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const items = selectedList.items || [];
  const checkedItems = items.filter(item => item.is_checked);
  const uncheckedItems = items.filter(item => !item.is_checked);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleToggleItem(item.id, item.is_checked)}
      activeOpacity={0.7}
    >
      <Card className="mb-3">
        <CardContent className="p-4">
          <View className="flex-row items-center">
            <View
              className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                item.is_checked
                  ? 'bg-primary border-primary'
                  : 'border-border bg-background'
              }`}
            >
              {item.is_checked && (
                <Text className="text-primary-foreground text-sm font-bold">✓</Text>
              )}
            </View>
            <View className="flex-1">
              <Text
                className={`text-foreground font-medium ${
                  item.is_checked ? 'line-through opacity-60' : ''
                }`}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit}
                </Text>
                {item.category?.name && (
                  <View className="ml-2 bg-secondary px-2 py-0.5 rounded">
                    <Text className="text-xs text-secondary-foreground">
                      {item.category.name}
                    </Text>
                  </View>
                )}
              </View>
              {item.notes && (
                <Text className="text-xs text-muted-foreground mt-1">{item.notes}</Text>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">{selectedList.name}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-sm text-muted-foreground">
            {checkedItems.length}/{items.length} items completed
          </Text>
          {selectedList.is_active ? (
            <View className="ml-3 bg-primary px-2 py-1 rounded">
              <Text className="text-xs text-primary-foreground font-medium">Active</Text>
            </View>
          ) : (
            <View className="ml-3 bg-muted px-2 py-1 rounded">
              <Text className="text-xs text-muted-foreground font-medium">Completed</Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={[...uncheckedItems, ...checkedItems]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-muted-foreground text-center mb-4">
              No items in this list yet
            </Text>
            <Button>Add Items</Button>
          </View>
        }
        ListFooterComponent={
          items.length > 0 && checkedItems.length === items.length ? (
            <View className="mt-4 p-4 bg-primary/10 rounded-lg">
              <Text className="text-primary text-center font-medium">
                🎉 All items checked! Great job!
              </Text>
            </View>
          ) : null
        }
      />

      {items.length > 0 && selectedList.is_active && (
        <View className="p-4 border-t border-border">
          <Button>Mark List as Complete</Button>
        </View>
      )}
    </View>
  );
};

export default ShoppingListDetailScreen;
