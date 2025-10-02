import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@kitchentory/shared';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/profile');
  }

  // Products endpoints
  async getProducts(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/products${queryString}`);
  }

  async getProductByBarcode(barcode: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/products/barcode/${barcode}`);
  }

  async createProduct(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Inventory endpoints
  async getInventory(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/inventory${queryString}`);
  }

  async getExpiringItems(days: number = 7): Promise<ApiResponse<any>> {
    return this.request<any>(`/inventory/expiring?days=${days}`);
  }

  async createInventoryItem(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Recipes endpoints
  async getRecipes(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/recipes${queryString}`);
  }

  async getAvailableRecipes(): Promise<ApiResponse<any>> {
    return this.request<any>('/recipes/available');
  }

  async getRecipe(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/recipes/${id}`);
  }

  async createRecipe(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Shopping lists endpoints
  async getShoppingLists(): Promise<ApiResponse<any>> {
    return this.request<any>('/shopping/lists');
  }

  async getShoppingList(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/shopping/lists/${id}`);
  }

  async createShoppingList(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/shopping/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addItemToList(listId: string, data: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/shopping/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateListItem(listId: string, itemId: string, data: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/shopping/lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async generateShoppingList(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/shopping/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();
