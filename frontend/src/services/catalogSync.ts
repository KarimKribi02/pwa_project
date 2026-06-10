import { db, type OfflineProduct, type OfflineCategory } from './db';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type CatalogSyncStatus = 'idle' | 'syncing' | 'success' | 'failed';

export const dispatchCatalogSyncEvent = (status: CatalogSyncStatus, message?: string) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('menuiserie-catalog-sync', { detail: { status, message } }),
  );
};

function mapProduct(p: Record<string, unknown>): OfflineProduct {
  const categories = p.categories as Record<string, unknown> | null | undefined;
  const images = p.produits_images as Array<Record<string, unknown>> | undefined;

  return {
    id: Number(p.id),
    nom: String(p.nom ?? ''),
    prix: Number(p.prix),
    description: String(p.description ?? ''),
    vedette: Boolean(p.vedette),
    categorie_id: p.categorie_id ? Number(p.categorie_id) : undefined,
    categories: categories
      ? { id: Number(categories.id), nom: String(categories.nom ?? '') }
      : undefined,
    produits_images: images?.map((img) => ({
      id: Number(img.id),
      url_image: String(img.url_image ?? ''),
      principale: Boolean(img.principale),
    })),
  };
}

function mapCategory(c: Record<string, unknown>): OfflineCategory {
  return {
    id: Number(c.id),
    nom: String(c.nom ?? ''),
    slug: String(c.slug ?? ''),
    description: c.description ? String(c.description) : undefined,
    image: c.image ? String(c.image) : undefined,
  };
}

export async function getLastSyncTime(): Promise<number | null> {
  const meta = await db.catalogMeta.get('catalog');
  return meta?.lastSyncAt ?? null;
}

export async function isCatalogCached(): Promise<boolean> {
  const count = await db.catalogProducts.count();
  return count > 0;
}

export async function getCatalogProducts(): Promise<OfflineProduct[]> {
  return db.catalogProducts.toArray();
}

export async function getCatalogCategories(): Promise<OfflineCategory[]> {
  return db.catalogCategories.toArray();
}

export async function getCatalogFeaturedProducts(): Promise<OfflineProduct[]> {
  const featured = await db.catalogProducts.filter((p) => p.vedette === true).toArray();
  if (featured.length > 0) return featured;
  const all = await db.catalogProducts.toArray();
  return all.slice(0, 4);
}

export async function getCatalogProduct(id: string): Promise<OfflineProduct | null> {
  const product = await db.catalogProducts.get(Number(id));
  return product ?? null;
}

/** Prefetch primary product images into the service worker cache. */
export function warmProductImages(products: OfflineProduct[]): void {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  for (const product of products) {
    const primary =
      product.produits_images?.find((img) => img.principale) ||
      product.produits_images?.[0];
    if (primary?.url_image) {
      const img = new Image();
      img.src = primary.url_image;
    }
  }
}

/** Fetch all catalog data from API and persist to Dexie. */
export async function syncCatalog(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  dispatchCatalogSyncEvent('syncing', 'Mise à jour du catalogue...');

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/AllProduits`),
      fetch(`${API_BASE_URL}/AllCategories`),
    ]);

    if (!productsRes.ok || !categoriesRes.ok) {
      throw new Error('Failed to fetch catalog');
    }

    const [productsData, categoriesData] = await Promise.all([
      productsRes.json(),
      categoriesRes.json(),
    ]);

    const products = (productsData as Record<string, unknown>[]).map(mapProduct);
    const categories = (categoriesData as Record<string, unknown>[]).map(mapCategory);
    const now = Date.now();

    await db.catalogProducts.bulkPut(products);
    await db.catalogCategories.bulkPut(categories);
    await db.catalogMeta.put({ key: 'catalog', lastSyncAt: now, itemCount: products.length });
    await db.catalogMeta.put({ key: 'categories', lastSyncAt: now, itemCount: categories.length });

    warmProductImages(products);
    dispatchCatalogSyncEvent('success', `${products.length} produits en cache`);
  } catch (err) {
    console.warn('Catalog sync failed:', err);
    dispatchCatalogSyncEvent('failed', 'Échec de la mise à jour du catalogue');
    throw err;
  }
}

export interface CatalogLoadResult<T> {
  data: T[];
  fromCache: boolean;
  isEmpty: boolean;
}

/** Stale-while-revalidate: return cache immediately, refresh in background when online. */
export async function loadProductsWithRevalidate(
  onUpdate?: (products: OfflineProduct[]) => void,
): Promise<CatalogLoadResult<OfflineProduct>> {
  const cached = await getCatalogProducts();
  const hasCache = cached.length > 0;

  if (hasCache && onUpdate) onUpdate(cached);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE_URL}/AllProduits`);
      if (res.ok) {
        const raw = await res.json();
        const products = (raw as Record<string, unknown>[]).map(mapProduct);
        await db.catalogProducts.bulkPut(products);
        await db.catalogMeta.put({
          key: 'catalog',
          lastSyncAt: Date.now(),
          itemCount: products.length,
        });
        warmProductImages(products);
        if (onUpdate) onUpdate(products);
        return { data: products, fromCache: false, isEmpty: false };
      }
    } catch (err) {
      console.warn('Product revalidation failed:', err);
    }
  }

  return { data: cached, fromCache: hasCache, isEmpty: !hasCache };
}

export async function loadCategoriesWithRevalidate(
  onUpdate?: (categories: OfflineCategory[]) => void,
): Promise<CatalogLoadResult<OfflineCategory>> {
  const cached = await getCatalogCategories();
  const hasCache = cached.length > 0;

  if (hasCache && onUpdate) onUpdate(cached);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE_URL}/AllCategories`);
      if (res.ok) {
        const raw = await res.json();
        const categories = (raw as Record<string, unknown>[]).map(mapCategory);
        await db.catalogCategories.bulkPut(categories);
        await db.catalogMeta.put({
          key: 'categories',
          lastSyncAt: Date.now(),
          itemCount: categories.length,
        });
        if (onUpdate) onUpdate(categories);
        return { data: categories, fromCache: false, isEmpty: false };
      }
    } catch (err) {
      console.warn('Category revalidation failed:', err);
    }
  }

  return { data: cached, fromCache: hasCache, isEmpty: !hasCache };
}

export async function loadFeaturedWithRevalidate(
  onUpdate?: (products: OfflineProduct[]) => void,
): Promise<CatalogLoadResult<OfflineProduct>> {
  const cached = await getCatalogFeaturedProducts();
  const hasCache = cached.length > 0;

  if (hasCache && onUpdate) onUpdate(cached);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE_URL}/ProduitsVedettes`);
      if (res.ok) {
        const raw = await res.json();
        const products = (raw as Record<string, unknown>[]).map(mapProduct);
        await db.catalogProducts.bulkPut(products);
        if (onUpdate) onUpdate(products);
        return { data: products, fromCache: false, isEmpty: false };
      }
    } catch (err) {
      console.warn('Featured revalidation failed:', err);
    }
  }

  return { data: cached, fromCache: hasCache, isEmpty: !hasCache };
}

export async function loadProductWithRevalidate(
  id: string,
  onUpdate?: (product: OfflineProduct) => void,
): Promise<{ product: OfflineProduct | null; fromCache: boolean; isEmpty: boolean }> {
  const cached = await getCatalogProduct(id);
  if (cached && onUpdate) onUpdate(cached);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE_URL}/SingleProduit/${id}`);
      if (res.ok) {
        const raw = await res.json();
        const product = mapProduct(raw as Record<string, unknown>);
        await db.catalogProducts.put(product);
        warmProductImages([product]);
        if (onUpdate) onUpdate(product);
        return { product, fromCache: false, isEmpty: false };
      }
    } catch (err) {
      console.warn('Product detail revalidation failed:', err);
    }
  }

  return { product: cached, fromCache: !!cached, isEmpty: !cached };
}
