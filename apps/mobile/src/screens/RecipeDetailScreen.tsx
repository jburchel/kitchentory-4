import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { fetchRecipeDetail, clearSelectedRecipe } from '../store/recipesSlice';
import { AppDispatch, RootState } from '../store';

interface RecipeDetailScreenProps {
  navigation: any;
  route: any;
}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ navigation, route }) => {
  const { recipeId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedRecipe } = useSelector((state: RootState) => state.recipes);
  const { items: inventoryItems } = useSelector((state: RootState) => state.inventory);

  useEffect(() => {
    dispatch(fetchRecipeDetail(recipeId));

    return () => {
      dispatch(clearSelectedRecipe());
    };
  }, [recipeId]);

  if (!selectedRecipe) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const totalTime = (selectedRecipe.prep_time_minutes || 0) + (selectedRecipe.cook_time_minutes || 0);

  // Check which ingredients are available
  const inventoryProductIds = new Set(inventoryItems.map(item => item.product_id));
  const availableIngredients = selectedRecipe.ingredients?.filter(
    ing => ing.product_id && inventoryProductIds.has(ing.product_id)
  ) || [];
  const missingIngredients = selectedRecipe.ingredients?.filter(
    ing => !ing.product_id || !inventoryProductIds.has(ing.product_id)
  ) || [];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedRecipe.name}</CardTitle>
            {selectedRecipe.description && (
              <Text className="text-sm text-muted-foreground mt-2">
                {selectedRecipe.description}
              </Text>
            )}
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap mb-4">
              {selectedRecipe.difficulty && (
                <View className="bg-secondary px-3 py-1 rounded mr-2 mb-2">
                  <Text className="text-xs text-secondary-foreground capitalize">
                    {selectedRecipe.difficulty}
                  </Text>
                </View>
              )}
              {totalTime > 0 && (
                <View className="bg-accent px-3 py-1 rounded mr-2 mb-2">
                  <Text className="text-xs text-accent-foreground">
                    ⏱️ {totalTime} min
                  </Text>
                </View>
              )}
              {selectedRecipe.servings && (
                <View className="bg-muted px-3 py-1 rounded mr-2 mb-2">
                  <Text className="text-xs text-muted-foreground">
                    🍽️ {selectedRecipe.servings} servings
                  </Text>
                </View>
              )}
              {selectedRecipe.cuisine && (
                <View className="bg-primary/10 px-3 py-1 rounded mr-2 mb-2">
                  <Text className="text-xs text-primary capitalize">
                    {selectedRecipe.cuisine}
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <CardTitle>Ingredients</CardTitle>
              <Text className="text-sm text-muted-foreground">
                {availableIngredients.length}/{selectedRecipe.ingredients?.length || 0} available
              </Text>
            </View>
          </CardHeader>
          <CardContent>
            {selectedRecipe.ingredients?.map((ingredient, index) => {
              const isAvailable = ingredient.product_id && inventoryProductIds.has(ingredient.product_id);
              return (
                <View
                  key={index}
                  className={`flex-row justify-between items-center py-3 ${
                    index < selectedRecipe.ingredients!.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className={`text-foreground ${isAvailable ? '' : 'opacity-60'}`}>
                      {isAvailable ? '✓ ' : '• '}{ingredient.name}
                      {ingredient.is_optional && ' (optional)'}
                    </Text>
                    {ingredient.notes && (
                      <Text className="text-xs text-muted-foreground mt-1">{ingredient.notes}</Text>
                    )}
                  </View>
                  <Text className="text-sm text-muted-foreground ml-2">
                    {ingredient.quantity} {ingredient.unit}
                  </Text>
                </View>
              );
            })}
          </CardContent>
        </Card>

        {missingIngredients.length > 0 && (
          <Button variant="outline" className="mb-6">
            Add Missing Items to Shopping List ({missingIngredients.length})
          </Button>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRecipe.instructions?.map((step, index) => (
              <View
                key={index}
                className={`py-3 ${
                  index < selectedRecipe.instructions!.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View className="flex-row">
                  <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                    <Text className="text-primary-foreground font-semibold">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-foreground leading-6">{step}</Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {selectedRecipe.dietary_tags && selectedRecipe.dietary_tags.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Text className="text-sm font-medium text-foreground mb-2">Dietary Tags</Text>
              <View className="flex-row flex-wrap">
                {selectedRecipe.dietary_tags.map((tag, index) => (
                  <View key={index} className="bg-secondary px-2 py-1 rounded mr-2 mb-2">
                    <Text className="text-xs text-secondary-foreground">
                      {tag.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        <Button className="mb-8">
          Start Cooking
        </Button>
      </View>
    </ScrollView>
  );
};

export default RecipeDetailScreen;
