import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { fetchInventory, fetchExpiringItems } from '../store/inventorySlice';
import { AppDispatch, RootState } from '../store';

interface InventoryScreenProps {
  navigation: any;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, expiringItems, loading } = useSelector((state: RootState) => state.inventory);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchInventory({})),
      dispatch(fetchExpiringItems(7)),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('InventoryItemDetail', { item })}
      activeOpacity={0.7}
    >
      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground mb-1">
                {item.product?.name || 'Unknown Product'}
              </Text>
              <View className="flex-row items-center space-x-2">
                <View className="bg-secondary px-2 py-1 rounded">
                  <Text className="text-xs text-secondary-foreground">
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View className="bg-accent px-2 py-1 rounded">
                  <Text className="text-xs text-accent-foreground capitalize">
                    {item.location}
                  </Text>
                </View>
              </View>
              {item.expiration_date && (
                <Text className="text-sm text-muted-foreground mt-2">
                  Expires: {new Date(item.expiration_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {expiringItems.length > 0 && (
        <View className="bg-destructive/10 p-4 border-b border-destructive/20">
          <Text className="text-destructive font-medium">
            ⚠️ {expiringItems.length} items expiring soon
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-muted-foreground text-center mb-4">
              No items in your inventory yet
            </Text>
            <Button onPress={() => navigation.navigate('AddInventoryItem')}>
              Add Your First Item
            </Button>
          </View>
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <View className="mb-4">
              <Button onPress={() => navigation.navigate('AddInventoryItem')}>
                + Add Item
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default InventoryScreen;
