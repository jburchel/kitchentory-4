import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { fetchRecipes, fetchAvailableRecipes } from '../store/recipesSlice';
import { AppDispatch, RootState } from '../store';

interface RecipesScreenProps {
  navigation: any;
}

const RecipesScreen: React.FC<RecipesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { recipes, availableRecipes, loading } = useSelector((state: RootState) => state.recipes);
  const [refreshing, setRefreshing] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchRecipes({})),
      dispatch(fetchAvailableRecipes()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const displayRecipes = showAvailableOnly ? availableRecipes : recipes;

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      <Card className="mb-4">
        <CardContent className="p-4">
          <View>
            <Text className="text-lg font-semibold text-foreground mb-1">
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View className="flex-row items-center space-x-2 flex-wrap">
              {item.difficulty && (
                <View className="bg-secondary px-2 py-1 rounded mb-1">
                  <Text className="text-xs text-secondary-foreground capitalize">
                    {item.difficulty}
                  </Text>
                </View>
              )}
              {item.prep_time_minutes && (
                <View className="bg-accent px-2 py-1 rounded mb-1">
                  <Text className="text-xs text-accent-foreground">
                    ⏱️ {item.prep_time_minutes + (item.cook_time_minutes || 0)} min
                  </Text>
                </View>
              )}
              {item.servings && (
                <View className="bg-muted px-2 py-1 rounded mb-1">
                  <Text className="text-xs text-muted-foreground">
                    🍽️ {item.servings} servings
                  </Text>
                </View>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 border-b border-border flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-foreground">
          {showAvailableOnly ? 'Available Recipes' : 'All Recipes'}
        </Text>
        <Button
          variant={showAvailableOnly ? 'default' : 'outline'}
          size="sm"
          onPress={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          {showAvailableOnly ? 'Show All' : 'Available'}
        </Button>
      </View>

      {availableRecipes.length > 0 && !showAvailableOnly && (
        <View className="bg-primary/10 p-4 border-b border-primary/20">
          <Text className="text-primary font-medium">
            ✨ {availableRecipes.length} recipes you can make now!
          </Text>
        </View>
      )}

      <FlatList
        data={displayRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-muted-foreground text-center mb-4">
              {showAvailableOnly
                ? 'No recipes available with your current inventory'
                : 'No recipes found'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default RecipesScreen;
