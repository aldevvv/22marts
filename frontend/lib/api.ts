const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  thumbnail: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// Auth
export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<AuthResponse>> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.message || 'Registrasi gagal' };
    }

    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan. Silakan coba lagi.' };
  }
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<ApiResponse<AuthResponse>> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.message || 'Login gagal' };
    }

    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan. Silakan coba lagi.' };
  }
}

// Profile
export async function updateProfile(userId: string, name: string): Promise<ApiResponse<{ message: string; user: { id: string; name: string; email: string; role: string } }>> {
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate profil' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const res = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengubah password' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Categories
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const res = await fetch(`${API_URL}/categories`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat kategori' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function createCategory(data: {
  name: string;
  icon?: string;
  isActive?: boolean;
}): Promise<ApiResponse<Category>> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal membuat kategori' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updateCategory(
  id: string,
  data: { name?: string; icon?: string; isActive?: boolean }
): Promise<ApiResponse<Category>> {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate kategori' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus kategori' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Products
export async function getProducts(categoryId?: string): Promise<ApiResponse<Product[]>> {
  try {
    const url = categoryId
      ? `${API_URL}/products?categoryId=${categoryId}`
      : `${API_URL}/products`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat produk' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Produk tidak ditemukan' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function createProduct(data: FormData): Promise<ApiResponse<Product>> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      body: data,
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal membuat produk' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updateProduct(
  id: string,
  data: FormData
): Promise<ApiResponse<Product>> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: data,
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate produk' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus produk' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Users
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  try {
    const res = await fetch(`${API_URL}/users`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat users' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updateUserRole(
  id: string,
  role: 'USER' | 'ADMIN'
): Promise<ApiResponse<User>> {
  try {
    const res = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate role' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Cart
export interface CartItem {
  id: string;
  quantity: number;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export async function getCart(userId: string): Promise<ApiResponse<Cart>> {
  try {
    const res = await fetch(`${API_URL}/cart?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat keranjang' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function getCartCount(userId: string): Promise<ApiResponse<{ count: number }>> {
  try {
    const res = await fetch(`${API_URL}/cart/count?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat keranjang' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal menambahkan ke keranjang' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updateCartItem(id: string, userId: string, quantity: number): Promise<ApiResponse<CartItem>> {
  try {
    const res = await fetch(`${API_URL}/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, quantity }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate keranjang' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function removeCartItem(id: string, userId: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/cart/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus item' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function clearCart(userId: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/cart?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal mengosongkan keranjang' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Payment
export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: Product;
}

export interface Order {
  id: string;
  orderId: string;
  status: string;
  subtotal: number;
  discount: number;
  promoCode: string | null;
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  notes: string | null;
  paymentStatus: string | null;
  paymentType: string | null;
  snapToken: string | null;
  userId: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export async function createPayment(data: {
  userId: string;
  addressId: string;
  notes?: string;
  idempotencyKey: string;
  promoCode?: string;
}): Promise<ApiResponse<{ order: Order; token: string; redirectUrl: string | null }>> {
  try {
    const res = await fetch(`${API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal membuat pembayaran' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function getPaymentStatus(orderId: string): Promise<ApiResponse<{
  found: boolean;
  status: string;
  isSuccess?: boolean;
  amount?: number;
  paymentType?: string;
  paidAt?: string;
}>> {
  try {
    const res = await fetch(`${API_URL}/payment/status/${orderId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengecek status' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function getOrders(userId?: string): Promise<ApiResponse<Order[]>> {
  try {
    const url = userId ? `${API_URL}/payment/orders?userId=${userId}` : `${API_URL}/payment/orders`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat pesanan' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<Order>> {
  try {
    const res = await fetch(`${API_URL}/payment/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate status' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function getOrderByOrderId(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const res = await fetch(`${API_URL}/payment/orders/${orderId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Pesanan tidak ditemukan' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Promos
export interface Promo {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getPromos(): Promise<ApiResponse<Promo[]>> {
  try {
    const res = await fetch(`${API_URL}/promos`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat promo' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function createPromo(data: Partial<Promo>): Promise<ApiResponse<Promo>> {
  try {
    const res = await fetch(`${API_URL}/promos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal membuat promo' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updatePromo(id: string, data: Partial<Promo>): Promise<ApiResponse<Promo>> {
  try {
    const res = await fetch(`${API_URL}/promos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate promo' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function deletePromo(id: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/promos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus promo' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function validatePromo(code: string, subtotal: number, userId?: string): Promise<ApiResponse<{
  valid: boolean;
  promo: Partial<Promo>;
  discount: number;
  total: number;
}>> {
  try {
    const res = await fetch(`${API_URL}/promos/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal, userId }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Kode promo tidak valid' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Favorites
export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export async function getFavorites(userId: string): Promise<ApiResponse<FavoriteItem[]>> {
  try {
    const res = await fetch(`${API_URL}/favorites?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat favorit' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function getFavoriteCount(userId: string): Promise<ApiResponse<{ count: number }>> {
  try {
    const res = await fetch(`${API_URL}/favorites/count?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat favorit' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function checkFavorite(userId: string, productId: string): Promise<ApiResponse<{ favorited: boolean }>> {
  try {
    const res = await fetch(`${API_URL}/favorites/check/${productId}?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function toggleFavorite(userId: string, productId: string): Promise<ApiResponse<{ favorited: boolean }>> {
  try {
    const res = await fetch(`${API_URL}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate favorit' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function removeFavorite(userId: string, productId: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/favorites/${productId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus favorit' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

// Addresses
export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  province: string;
  provinceId: string;
  city: string;
  cityId: string;
  district: string;
  districtId: string;
  village: string;
  villageId: string;
  postalCode: string;
  notes: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAddresses(userId: string): Promise<ApiResponse<Address[]>> {
  try {
    const res = await fetch(`${API_URL}/addresses?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal memuat alamat' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function createAddress(data: {
  userId: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  isDefault?: boolean;
}): Promise<ApiResponse<Address>> {
  try {
    const res = await fetch(`${API_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal menambahkan alamat' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function updateAddress(
  id: string,
  data: {
    userId: string;
    label?: string;
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
    isDefault?: boolean;
  }
): Promise<ApiResponse<Address>> {
  try {
    const res = await fetch(`${API_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengupdate alamat' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function deleteAddress(id: string, userId: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/addresses/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus alamat' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function setDefaultAddress(id: string, userId: string): Promise<ApiResponse<Address>> {
  try {
    const res = await fetch(`${API_URL}/addresses/${id}/default?userId=${userId}`, {
      method: 'PATCH',
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message || 'Gagal mengubah alamat utama' };
    return { data: json };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.message || 'Gagal menghapus user' };
    }
    return { data: undefined };
  } catch {
    return { error: 'Terjadi kesalahan' };
  }
}
