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

export interface CatalogMeta {
  key: 'catalog' | 'categories';
  lastSyncAt: number;
  itemCount: number;
}

export interface CustomizationDetails {
  dimensions: string;
  width: number;
  length: number;
  wood: string;
  finish: string;
}

export interface CartItem {
  id?: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  customization: CustomizationDetails;
  image: string;
  updatedAt: number;
}

export interface OrderPayload {
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
}

export interface PendingOrder {
  id?: number;
  orderData: OrderPayload;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  localTrackingCode: string;
  serverTrackingCode?: string;
  syncAttempts: number;
  lastAttemptAt?: number;
  errorMessage?: string;
  createdAt: number;
}

export interface SyncedOrderCache {
  trackingCode: string;
  orderSnapshot: Record<string, unknown>;
  cachedAt: number;
}

// --- Dexie Database Class Definition ---

export class MenuiserieDatabase extends Dexie {
  catalogProducts!: Table<OfflineProduct, number>;
  catalogCategories!: Table<OfflineCategory, number>;
  catalogMeta!: Table<CatalogMeta, string>;
  cart!: Table<CartItem, number>;
  pendingOrders!: Table<PendingOrder, number>;
  syncedOrderCache!: Table<SyncedOrderCache, string>;

  constructor() {
    super('MenuiserieDigitalDB');

    this.version(1).stores({
      catalogProducts: 'id, nom, prix, vedette, categorie_id',
      catalogCategories: 'id, nom, slug',
      cart: '++id, product_id, updatedAt',
      pendingOrders: '++id, status, createdAt',
    });

    this.version(2).stores({
      catalogProducts: 'id, nom, prix, vedette, categorie_id',
      catalogCategories: 'id, nom, slug',
      catalogMeta: 'key',
      cart: '++id, product_id, updatedAt',
      pendingOrders: '++id, status, createdAt, localTrackingCode',
      syncedOrderCache: 'trackingCode, cachedAt',
    });
  }

  async clearAllCache() {
    await this.catalogProducts.clear();
    await this.catalogCategories.clear();
    await this.catalogMeta.clear();
  }
}

export const db = new MenuiserieDatabase();
