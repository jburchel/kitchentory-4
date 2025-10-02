import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Recipe } from '@kitchentory/shared';
import apiService from '../services/api';

interface RecipesState {
  recipes: Recipe[];
  availableRecipes: Recipe[];
  selectedRecipe: (Recipe & { ingredients: any[] }) | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecipesState = {
  recipes: [],
  availableRecipes: [],
  selectedRecipe: null,
  loading: false,
  error: null,
};

export const fetchRecipes = createAsyncThunk(
  'recipes/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    const response = await apiService.getRecipes(params);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch recipes');
    }
    return response.data.items;
  }
);

export const fetchAvailableRecipes = createAsyncThunk(
  'recipes/fetchAvailable',
  async (_, { rejectWithValue }) => {
    const response = await apiService.getAvailableRecipes();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch available recipes');
    }
    return response.data;
  }
);

export const fetchRecipeDetail = createAsyncThunk(
  'recipes/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    const response = await apiService.getRecipe(id);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch recipe');
    }
    return response.data;
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRecipe: (state) => {
      state.selectedRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAvailableRecipes.fulfilled, (state, action) => {
        state.availableRecipes = action.payload;
      })
      .addCase(fetchRecipeDetail.fulfilled, (state, action) => {
        state.selectedRecipe = action.payload;
      });
  },
});

export const { clearError, clearSelectedRecipe } = recipesSlice.actions;
export default recipesSlice.reducer;
