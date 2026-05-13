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

export async function addCategorie(data: { nom: string; slug: string; description?: string }) {
  const res = await fetch(`${API_BASE_URL}/addCategorie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to add categorie');
  }
  return res.json();
}

export async function updateCategorie(id: string, data: { nom?: string; slug?: string; description?: string }) {
  const res = await fetch(`${API_BASE_URL}/UpdateCategorie/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to update categorie');
  }
  return res.json();
}

export async function deleteCategorie(id: string) {
  const res = await fetch(`${API_BASE_URL}/DeleteCategorie/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to delete categorie');
  }
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

export async function getAllFactures() {
  const res = await fetch(`${API_BASE_URL}/AllFactures`);
  if (!res.ok) throw new Error('Failed to fetch factures');
  return res.json();
}

export async function addFacture(data: { id_commande: number; id_utilisateur: number; date_emission?: string; date_paiement?: string }) {
  const res = await fetch(`${API_BASE_URL}/addFacture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to add facture');
  }
  return res.json();
}

export async function deleteFacture(id: string) {
  const res = await fetch(`${API_BASE_URL}/DeleteFacture/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to delete facture');
  }
  return res.json();
}

export async function getOrdersByStatus(status: string) {
  const res = await fetch(`${API_BASE_URL}/CommandesByStatut/${encodeURIComponent(status)}`);
  if (!res.ok) throw new Error('Failed to fetch orders by status');
  return res.json();
}

export async function updateOrder(id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/UpdateCommande/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to update order');
  }
  return res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`${API_BASE_URL}/DeleteCommande/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to delete order');
  }
  return res.json();
}

export async function validateOrder(id: string, action: string) {
  const res = await fetch(`${API_BASE_URL}/ValidateCommande/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to validate order');
  }
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to add product');
  }
  return res.json();
}

export async function updateProduct(id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/UpdateProduit/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/DeleteProduit/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to delete product');
  }
  return res.json();
}

export async function addImage(produitId: string, imageFile: File, principale: boolean = true) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('produit_id', produitId);
  formData.append('principale', principale ? 'true' : 'false');

  const res = await fetch(`${API_BASE_URL}/addImage`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to add image');
  }
  return res.json();
}

