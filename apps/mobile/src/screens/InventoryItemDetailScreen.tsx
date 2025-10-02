import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { updateInventoryItem, deleteInventoryItem } from '../store/inventorySlice';
import { AppDispatch } from '../store';

interface InventoryItemDetailScreenProps {
  navigation: any;
  route: any;
}

const UNITS = ['item', 'kg', 'g', 'l', 'ml', 'oz', 'lb', 'cup', 'tbsp', 'tsp'];
const LOCATIONS = ['fridge', 'freezer', 'pantry', 'spice_rack', 'other'];

const InventoryItemDetailScreen: React.FC<InventoryItemDetailScreenProps> = ({ navigation, route }) => {
  const { item } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity?.toString() || '1');
  const [unit, setUnit] = useState(item.unit || 'item');
  const [location, setLocation] = useState(item.location || 'pantry');
  const [expirationDate, setExpirationDate] = useState(
    item.expiration_date ? new Date(item.expiration_date).toISOString().split('T')[0] : ''
  );
  const [notes, setNotes] = useState(item.notes || '');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(updateInventoryItem({
        id: item.id,
        data: {
          quantity: parseFloat(quantity),
          unit,
          location,
          expiration_date: expirationDate || null,
          notes: notes.trim() || null,
        },
      })).unwrap();
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteInventoryItem(item.id)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleMarkConsumed = () => {
    Alert.alert(
      'Mark as Consumed',
      'Mark this item as consumed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(updateInventoryItem({
                id: item.id,
                data: { is_consumed: true, consumed_at: new Date().toISOString() },
              })).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark item as consumed');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysUntilExpiration = () => {
    if (!item.expiration_date) return null;
    const today = new Date();
    const expiration = new Date(item.expiration_date);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiration = getDaysUntilExpiration();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <CardTitle>{item.product?.name || 'Inventory Item'}</CardTitle>
                {item.product?.brand && (
                  <Text className="text-sm text-muted-foreground mt-1">{item.product.brand}</Text>
                )}
              </View>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text className="text-primary font-medium">Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>

          <CardContent>
            {/* Expiration Alert */}
            {daysUntilExpiration !== null && daysUntilExpiration <= 7 && (
              <View
                className={`mb-4 p-3 rounded-lg ${
                  daysUntilExpiration < 0
                    ? 'bg-destructive/10'
                    : daysUntilExpiration <= 3
                    ? 'bg-destructive/10'
                    : 'bg-accent/10'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    daysUntilExpiration < 0
                      ? 'text-destructive'
                      : daysUntilExpiration <= 3
                      ? 'text-destructive'
                      : 'text-accent-foreground'
                  }`}
                >
                  {daysUntilExpiration < 0
                    ? `⚠️ Expired ${Math.abs(daysUntilExpiration)} days ago`
                    : daysUntilExpiration === 0
                    ? '⚠️ Expires today!'
                    : `⏰ Expires in ${daysUntilExpiration} days`}
                </Text>
              </View>
            )}

            {/* Quantity */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Quantity</Text>
              {isEditing ? (
                <Input
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholder="1"
                />
              ) : (
                <Text className="text-lg text-foreground">
                  {item.quantity} {item.unit}
                </Text>
              )}
            </View>

            {/* Unit */}
            {isEditing && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Unit</Text>
                <TouchableOpacity
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                  className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2"
                >
                  <Text className="text-foreground capitalize">{unit}</Text>
                </TouchableOpacity>
                {showUnitPicker && (
                  <View className="mt-2 border border-border rounded-lg bg-card">
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => {
                          setUnit(u);
                          setShowUnitPicker(false);
                        }}
                        className="p-3 border-b border-border"
                      >
                        <Text className={`capitalize ${u === unit ? 'text-primary font-medium' : 'text-foreground'}`}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Location */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Location</Text>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowLocationPicker(!showLocationPicker)}
                    className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2"
                  >
                    <Text className="text-foreground capitalize">{location.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                  {showLocationPicker && (
                    <View className="mt-2 border border-border rounded-lg bg-card">
                      {LOCATIONS.map((loc) => (
                        <TouchableOpacity
                          key={loc}
                          onPress={() => {
                            setLocation(loc);
                            setShowLocationPicker(false);
                          }}
                          className="p-3 border-b border-border"
                        >
                          <Text
                            className={`capitalize ${loc === location ? 'text-primary font-medium' : 'text-foreground'}`}
                          >
                            {loc.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View className="bg-secondary px-3 py-2 rounded-lg inline-flex">
                  <Text className="text-secondary-foreground capitalize">
                    {item.location?.replace('_', ' ') || 'Not set'}
                  </Text>
                </View>
              )}
            </View>

            {/* Expiration Date */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Expiration Date</Text>
              {isEditing ? (
                <Input
                  value={expirationDate}
                  onChangeText={setExpirationDate}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text className="text-foreground">{formatDate(item.expiration_date)}</Text>
              )}
            </View>

            {/* Purchase Date */}
            {item.purchase_date && !isEditing && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Purchase Date</Text>
                <Text className="text-foreground">{formatDate(item.purchase_date)}</Text>
              </View>
            )}

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Notes</Text>
              {isEditing ? (
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes..."
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text className="text-foreground">{item.notes || 'No notes'}</Text>
              )}
            </View>

            {/* Category */}
            {item.product?.category && !isEditing && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
                <View className="bg-primary/10 px-3 py-2 rounded-lg inline-flex">
                  <Text className="text-primary">{item.product.category.name}</Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing ? (
          <View className="space-y-3">
            <Button onPress={handleSave} loading={loading} disabled={loading}>
              Save Changes
            </Button>
            <Button variant="outline" onPress={() => setIsEditing(false)} disabled={loading}>
              Cancel
            </Button>
          </View>
        ) : (
          <View className="space-y-3">
            <Button onPress={handleMarkConsumed} disabled={loading}>
              Mark as Consumed
            </Button>
            <Button variant="destructive" onPress={handleDelete} disabled={loading}>
              Delete Item
            </Button>
          </View>
        )}

        {/* Metadata */}
        {!isEditing && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <Text className="text-xs text-muted-foreground">
                Added {formatDate(item.created_at)}
              </Text>
              {item.updated_at !== item.created_at && (
                <Text className="text-xs text-muted-foreground mt-1">
                  Last updated {formatDate(item.updated_at)}
                </Text>
              )}
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default InventoryItemDetailScreen;
