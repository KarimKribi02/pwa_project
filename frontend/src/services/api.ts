const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- Products ---
export async function getProducts() {
  const res = await fetch(`${API_BASE_URL}/AllProduits`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/SingleProduit/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function getFeaturedProducts() {
  const res = await fetch(`${API_BASE_URL}/ProduitsVedettes`);
  if (!res.ok) throw new Error('Failed to fetch featured products');
  return res.json();
}

export async function getProductsByCategory(categoryId: string) {
  const res = await fetch(`${API_BASE_URL}/ProduitsByCategorie/${categoryId}`);
  if (!res.ok) throw new Error('Failed to fetch products by category');
  return res.json();
}

// --- Categories ---
export async function getCategories() {
  const res = await fetch(`${API_BASE_URL}/AllCategories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// --- Orders ---
export async function createOrder(data: any) {
  const res = await fetch(`${API_BASE_URL}/addCommande`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create order');
  }
  return res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(`${API_BASE_URL}/SingleCommande/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function getAllOrders() {
  const res = await fetch(`${API_BASE_URL}/AllCommandes`);
  if (!res.ok) throw new Error('Failed to fetch all orders');
  return res.json();
}

// --- Users / Admin ---
export async function getUserByEmail(email: string) {
  const res = await fetch(`${API_BASE_URL}/UtilisateurByEmail/${email}`);
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export async function addProduct(data: any) {
  const res = await fetch(`${API_BASE_URL}/addProduit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateProduct(id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/UpdateProduit/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/DeleteProduit/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function addImage(data: any) {
  const res = await fetch(`${API_BASE_URL}/addImage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
