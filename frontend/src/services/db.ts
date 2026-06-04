import Dexie, { type Table } from 'dexie';

// --- Interfaces for Entities ---

export interface OfflineProduct {
  id: number;
  nom: string;
  prix: number;
  description: string;
  vedette: boolean;
  categorie_id?: number;
  categories?: {
    id: number;
    nom: string;
  };
  produits_images?: Array<{
    id: number;
    url_image: string;
    principale: boolean;
  }>;
}

export interface OfflineCategory {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface CustomizationDetails {
  dimensions: string;
  width: number;
  length: number;
  wood: string;
  finish: string;
}

export interface CartItem {
  id?: number; // Auto-incremented
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  customization: CustomizationDetails;
  image: string;
  updatedAt: number;
}

export interface PendingOrder {
  id?: number; // Auto-incremented
  orderData: {
    id_utilisateur?: string;
    clientNom: string;
    clientTel: string;
    clientEmail: string;
    adresse: string;
    statut: string;
    note?: string;
    largeur?: string;
    longueur?: string;
    couleur?: string;
    type_bois?: string;
    prix_total: number;
    id_produit: string;
    quantite: number;
  };
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
  createdAt: number;
}

// --- Dexie Database Class Definition ---

export class MenuiserieDatabase extends Dexie {
  catalogProducts!: Table<OfflineProduct, number>;
  catalogCategories!: Table<OfflineCategory, number>;
  cart!: Table<CartItem, number>;
  pendingOrders!: Table<PendingOrder, number>;

  constructor() {
    super('MenuiserieDigitalDB');
    
    // Schema versioning
    this.version(1).stores({
      catalogProducts: 'id, nom, prix, vedette, categorie_id',
      catalogCategories: 'id, nom, slug',
      cart: '++id, product_id, updatedAt',
      pendingOrders: '++id, status, createdAt'
    });
  }

  // Helper helper to clear cache
  async clearAllCache() {
    await this.catalogProducts.clear();
    await this.catalogCategories.clear();
  }
}

// Initialize database instance
export const db = new MenuiserieDatabase();
