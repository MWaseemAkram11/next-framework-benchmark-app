// lib/api.ts
// API Service using Next.js proxy and persistent Redis state

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: { price: number };
  attributes: {
    name: string;
    brand: string;
    image: string;
    thumbnail: string;
    small_image: string;
    category_names: string;
    description?: string;
    short_description?: string;
    listing_highlights_section?: string;
    stock_msg?: string;
    manufacturer?: string;
    model?: string;
    fivetech_sku?: string;
    sku?: string;
  };
  media_gallery: Array<{ file: string }>;
  brand?: string;
  image?: string;
}

export interface Category {
  id: string | number;
  name: string;
  image: string;
}

class ApiService {
  private PDP_URL = 'https://admin.box.co.uk/api-buster/product-detail-page';
  private PLP_URL = 'https://admin.box.co.uk/api-buster/products';
  private USE_PROXY = true;

  public redisEnabled = false;
  private listeners: Array<(enabled: boolean) => void> = [];

  constructor() {
    // Initialize from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('redis_enabled');
      this.redisEnabled = saved === 'true';
    }
  }

  toggleRedis(enabled: boolean) {
    this.redisEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('redis_enabled', enabled.toString());
    }
    this.listeners.forEach(listener => listener(enabled));
  }

  onRedisToggle(callback: (enabled: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private async fetchWithProxy(url: string, params: URLSearchParams): Promise<any> {
    if (this.USE_PROXY && typeof window !== 'undefined') {
      const proxyParams = new URLSearchParams(params);
      proxyParams.set('endpoint', url);
      
      const response = await fetch(`/api/proxy?${proxyParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      const response = await fetch(`${url}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
  }

  async getProducts(page: number = 1, limit: number = 24): Promise<any> {
    const params = new URLSearchParams({
      category_id: '55873',
      page: page.toString(),
      limit: limit.toString(),
      showBy: 'price',
      sort_by: 'desc',
      priceRange: '0_905'
    });

    if (this.redisEnabled) {
      params.append('use_redis', 'true');
    }

    try {
      return await this.fetchWithProxy(this.PLP_URL, params);
    } catch (error) {
      console.error('API Error (getProducts):', error);
      throw error;
    }
  }

  async getProductDetail(id: number | string): Promise<any> {
    const params = new URLSearchParams({ id: id.toString() });

    if (this.redisEnabled) {
      params.append('use_redis', 'true');
    }

    try {
      return await this.fetchWithProxy(this.PDP_URL, params);
    } catch (error) {
      console.error('API Error (getProductDetail):', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const data = await this.getProducts(1, 100);
      if (!data || !data.products) return [];
      const categoriesMap = new Map<string, Category>();
      data.products.forEach((product: Product) => {
        if (product.attributes && product.attributes.category_names) {
          const cats = product.attributes.category_names.split(',').map(c => c.trim());
          cats.forEach((catName: string) => {
            if (!categoriesMap.has(catName) && 
                !['BoxLtd', 'Klarna Pay in 3', 'Paypal Finance', 'Paypal pay in 3'].includes(catName)) {
              categoriesMap.set(catName, {
                id: product.attributes.fivetech_sku || product.id,
                name: catName,
                image: product.attributes.thumbnail || product.attributes.small_image || product.attributes.image
              });
            }
          });
        }
      });
      return Array.from(categoriesMap.values()).slice(0, 8);
    } catch (error) {
      console.error('Failed to fetch categories dynamically', error);
      return [];
    }
  }
}

export const apiService = new ApiService();