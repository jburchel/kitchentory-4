import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InventoryItem } from '@kitchentory/shared';
import apiService from '../services/api';

interface InventoryState {
  items: InventoryItem[];
  expiringItems: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  expiringItems: [],
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    const response = await apiService.getInventory(params);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch inventory');
    }
    return response.data.items;
  }
);

export const fetchExpiringItems = createAsyncThunk(
  'inventory/fetchExpiring',
  async (days: number = 7, { rejectWithValue }) => {
    const response = await apiService.getExpiringItems(days);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch expiring items');
    }
    return response.data;
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/add',
  async (data: any, { rejectWithValue }) => {
    const response = await apiService.createInventoryItem(data);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to add item');
    }
    return response.data;
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    const response = await apiService.updateInventoryItem(id, data);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to update item');
    }
    return response.data;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/delete',
  async (id: string, { rejectWithValue }) => {
    const response = await apiService.deleteInventoryItem(id);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to delete item');
    }
    return id;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch expiring
      .addCase(fetchExpiringItems.fulfilled, (state, action) => {
        state.expiringItems = action.payload;
      })
      // Add item
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update item
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete item
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
