import { db } from './db';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- Products ---
export async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/AllProduits`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    try {
      // Cache products
      await db.catalogProducts.bulkPut(data.map((p: any) => ({
        id: Number(p.id),
        nom: p.nom,
        prix: Number(p.prix),
        description: p.description,
        vedette: Boolean(p.vedette),
        categorie_id: p.categorie_id ? Number(p.categorie_id) : undefined,
        categories: p.categories,
        produits_images: p.produits_images
      })));
    } catch (dbErr) {
      console.warn('Failed to store catalog cache:', dbErr);
    }
    return data;
  } catch (err) {
    console.warn('Network offline, returning cached products from IndexedDB.');
    const cached = await db.catalogProducts.toArray();
    if (cached.length > 0) return cached;
    throw err;
  }
}

export async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/SingleProduit/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    const data = await res.json();
    try {
      await db.catalogProducts.put({
        id: Number(data.id),
        nom: data.nom,
        prix: Number(data.prix),
        description: data.description,
        vedette: Boolean(data.vedette),
        categorie_id: data.categorie_id ? Number(data.categorie_id) : undefined,
        categories: data.categories,
        produits_images: data.produits_images
      });
    } catch (dbErr) {
      console.warn('Failed to store product cache:', dbErr);
    }
    return data;
  } catch (err) {
    console.warn('Network offline, returning cached product detail.');
    const cached = await db.catalogProducts.get(Number(id));
    if (cached) return cached;
    throw err;
  }
}

export async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/ProduitsVedettes`);
    if (!res.ok) throw new Error('Failed to fetch featured products');
    const data = await res.json();
    try {
      await db.catalogProducts.bulkPut(data.map((p: any) => ({
        id: Number(p.id),
        nom: p.nom,
        prix: Number(p.prix),
        description: p.description,
        vedette: Boolean(p.vedette),
        categorie_id: p.categorie_id ? Number(p.categorie_id) : undefined,
        categories: p.categories,
        produits_images: p.produits_images
      })));
    } catch (dbErr) {
      console.warn('Failed to store featured cache:', dbErr);
    }
    return data;
  } catch (err) {
    console.warn('Network offline, returning cached featured products.');
    const cached = await db.catalogProducts.filter(p => p.vedette === true).toArray();
    if (cached.length > 0) return cached;
    // Fallback: return any 4 items
    const all = await db.catalogProducts.toArray();
    if (all.length > 0) return all.slice(0, 4);
    throw err;
  }
}

export async function getProductsByCategory(categoryId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/ProduitsByCategorie/${categoryId}`);
    if (!res.ok) throw new Error('Failed to fetch products by category');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Network offline, returning cached products by category.');
    const cached = await db.catalogProducts.filter(p => p.categorie_id === Number(categoryId)).toArray();
    if (cached.length > 0) return cached;
    throw err;
  }
}

// --- Categories ---
export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/AllCategories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    try {
      await db.catalogCategories.bulkPut(data.map((c: any) => ({
        id: Number(c.id),
        nom: c.nom,
        slug: c.slug,
        description: c.description,
        image: c.image
      })));
    } catch (dbErr) {
      console.warn('Failed to store category cache:', dbErr);
    }
    return data;
  } catch (err) {
    console.warn('Network offline, returning cached categories.');
    const cached = await db.catalogCategories.toArray();
    if (cached.length > 0) return cached;
    throw err;
  }
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

export async function getCommandeStatus(code: string) {
  const res = await fetch(`${API_BASE_URL}/commandes/suivi/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Failed to track order');
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

// --- Contact Messages ---
export async function submitContact(data: {
  nom: string;
  email: string;
  telephone?: string;
  objet: string;
  message: string;
}) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Une erreur est survenue lors de l\'envoi.');
  }
  return res.json();
}

export async function getContactMessages() {
  const res = await fetch(`${API_BASE_URL}/admin/contact`);
  if (!res.ok) throw new Error('Failed to fetch contact messages');
  return res.json();
}

export async function updateContactStatus(id: string, statut: string) {
  const res = await fetch(`${API_BASE_URL}/admin/contact/${id}/statut`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to update message status');
  }
  return res.json();
}


