import { getProducts } from "@/services/api";
import Link from "next/link";
import { MoveRight } from "lucide-react";

export default async function CatalogPage() {
  let products = [];
  try {
    products = await getProducts();
  } catch (e) {
    // Fallback Mock for Demo
    products = [
      { id: 1, name: "Porte Sculptée", price: 4500, category: "Portes", image: "https://images.unsplash.com/photo-1515514759600-99767216a690?w=500&auto=format&fit=crop" },
      { id: 2, name: "Table en Cèdre", price: 3200, category: "Mobilier", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop" },
      { id: 3, name: "Cuisine Traditionnelle", price: 12000, category: "Cuisines", image: "https://images.unsplash.com/photo-1556911223-747f4f469950?w=500&auto=format&fit=crop" },
    ];
  }

  return (
    <div className="flex-1 bg-surface py-24">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <header className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
          <div>
            <h1 className="text-5xl md:text-[4rem] font-serif mb-8 text-on-surface leading-tight italic">Le Catalogue de <br /> l'Atelier</h1>
            <p className="text-stone-400 font-sans text-xl font-light leading-relaxed max-w-2xl">Découvrez notre collection de pièces uniques, façonnées à la main par les maîtres menuisiers de Marrakech. Chaque objet raconte l'histoire d'un bois noble et d'un savoir-faire ancestral.</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 w-full md:w-auto scrollbar-hide">
            {["Tous", "Portes", "Mobilier", "Cuisines"].map((cat) => (
              <button key={cat} className="px-10 py-3 rounded-full bg-surface-highest text-on-surface hover:bg-primary hover:text-surface transition-all font-work text-[10px] uppercase tracking-[0.2em] font-black">
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {products.map((product: any, index: number) => (
            <div 
              key={product.id} 
              className={`group card-artisan flex flex-col ${(index + 1) % 3 === 0 ? 'wood-accent-bar' : ''}`}
            >
              <div className="relative h-[450px] overflow-hidden bg-surface-low">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                />
                <div className="absolute top-8 right-8 bg-surface/90 backdrop-blur-md px-6 py-2 rounded-full border border-outline/5">
                  <span className="font-work text-[10px] uppercase tracking-widest font-bold text-on-surface/60">Prix Estimatif</span>
                </div>
              </div>
              
              <div className="p-12">
                <h3 className="text-[1.85rem] font-serif mb-4 text-on-surface group-hover:text-primary transition-colors leading-tight italic">{product.name}</h3>
                <p className="text-stone-400 font-sans text-sm mb-12 italic opacity-60">Bois de cèdre massif & finitions à la cire d'abeille.</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-serif text-secondary">{product.price} <span className="text-xs uppercase font-work tracking-widest opacity-40">MAD</span></span>
                  <Link 
                    href={`/products/${product.id}`}
                    className="w-12 h-12 bg-surface-highest rounded-full flex items-center justify-center text-on-surface hover:bg-primary hover:text-surface transition-all"
                  >
                    <MoveRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

