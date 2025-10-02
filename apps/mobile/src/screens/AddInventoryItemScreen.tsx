import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, Input, Card, CardContent } from '../components/ui';
import { addInventoryItem } from '../store/inventorySlice';
import { AppDispatch } from '../store';

interface AddInventoryItemScreenProps {
  navigation: any;
  route: any;
}

const AddInventoryItemScreen: React.FC<AddInventoryItemScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('item');
  const [location, setLocation] = useState('pantry');
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');

  const units = ['item', 'kg', 'g', 'l', 'ml', 'oz', 'lb', 'cup'];
  const locations = ['pantry', 'fridge', 'freezer', 'spice_rack', 'other'];

  const handleSave = async () => {
    if (!productName || !quantity) {
      return;
    }

    setLoading(true);
    try {
      // First create/get product
      const productData = {
        name: productName,
        default_unit: unit,
        default_quantity: parseFloat(quantity),
      };

      // For now, we'll create the inventory item directly
      // In production, you'd want to search for existing products first
      await dispatch(addInventoryItem({
        product_id: null, // This would be the actual product ID
        quantity: parseFloat(quantity),
        unit,
        location,
        expiration_date: expirationDate || null,
        notes,
      }));

      navigation.goBack();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          <Card className="mb-6">
            <CardContent className="p-4">
              <Input
                label="Product Name *"
                value={productName}
                onChangeText={setProductName}
                placeholder="e.g., Milk, Eggs, Tomatoes"
                className="mb-4"
              />

              <View className="flex-row space-x-2 mb-4">
                <View className="flex-1">
                  <Input
                    label="Quantity *"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">Unit</Text>
                  <View className="flex-row flex-wrap">
                    {units.slice(0, 3).map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setUnit(u)}
                        className={`px-3 py-2 rounded mr-2 mb-2 ${
                          unit === u ? 'bg-primary' : 'bg-secondary'
                        }`}
                      >
                        <Text className={`text-xs ${
                          unit === u ? 'text-primary-foreground' : 'text-secondary-foreground'
                        }`}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text className="text-sm font-medium text-foreground mb-2">Location</Text>
              <View className="flex-row flex-wrap mb-4">
                {locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => setLocation(loc)}
                    className={`px-3 py-2 rounded mr-2 mb-2 ${
                      location === loc ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Text className={`text-xs capitalize ${
                      location === loc ? 'text-primary-foreground' : 'text-secondary-foreground'
                    }`}>
                      {loc.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Expiration Date (Optional)"
                value={expirationDate}
                onChangeText={setExpirationDate}
                placeholder="YYYY-MM-DD"
                className="mb-4"
              />

              <Input
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes..."
                className="mb-4"
              />
            </CardContent>
          </Card>

          <View className="flex-row space-x-2">
            <Button
              variant="outline"
              onPress={() => navigation.goBack()}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              loading={loading}
              disabled={loading || !productName || !quantity}
              className="flex-1"
            >
              Add Item
            </Button>
          </View>

          <TouchableOpacity className="mt-4 p-4 bg-accent rounded-md">
            <Text className="text-accent-foreground text-center font-medium">
              📷 Scan Barcode Instead
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddInventoryItemScreen;
