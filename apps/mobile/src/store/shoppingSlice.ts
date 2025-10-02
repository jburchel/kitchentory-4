import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ShoppingList, ShoppingListItem } from '@kitchentory/shared';
import apiService from '../services/api';

interface ShoppingState {
  lists: ShoppingList[];
  selectedList: (ShoppingList & { items: ShoppingListItem[] }) | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShoppingState = {
  lists: [],
  selectedList: null,
  loading: false,
  error: null,
};

export const fetchShoppingLists = createAsyncThunk(
  'shopping/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await apiService.getShoppingLists();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch shopping lists');
    }
    return response.data;
  }
);

export const fetchShoppingList = createAsyncThunk(
  'shopping/fetchOne',
  async (id: string, { rejectWithValue }) => {
    const response = await apiService.getShoppingList(id);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch shopping list');
    }
    return response.data;
  }
);

export const createShoppingList = createAsyncThunk(
  'shopping/create',
  async (data: any, { rejectWithValue }) => {
    const response = await apiService.createShoppingList(data);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to create shopping list');
    }
    return response.data;
  }
);

export const toggleItemChecked = createAsyncThunk(
  'shopping/toggleItem',
  async ({ listId, itemId, isChecked }: { listId: string; itemId: string; isChecked: boolean }, { rejectWithValue }) => {
    const response = await apiService.updateListItem(listId, itemId, { is_checked: !isChecked });
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to update item');
    }
    return response.data;
  }
);

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedList: (state) => {
      state.selectedList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShoppingLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchShoppingLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.selectedList = action.payload;
      })
      .addCase(createShoppingList.fulfilled, (state, action) => {
        state.lists.unshift(action.payload);
      })
      .addCase(toggleItemChecked.fulfilled, (state, action) => {
        if (state.selectedList) {
          const index = state.selectedList.items.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.selectedList.items[index] = action.payload;
          }
        }
      });
  },
});

export const { clearError, clearSelectedList } = shoppingSlice.actions;
export default shoppingSlice.reducer;
