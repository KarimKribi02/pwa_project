'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ShoppingBag, 
  Heart, 
  Ruler, 
  Paintbrush, 
  Trees, 
  Info,
  Maximize,
  Check,
  MoveRight
} from "lucide-react";
import Link from "next/link";

import { use } from "react";

// --- Configuration Data ---
const WOOD_TYPES = [
  { id: 'chene', name: 'Chêne Noble', multiplier: 1.8, desc: 'Robuste & Intemporel', color: '#8B5A2B' },
  { id: 'hetre', name: 'Hêtre Clair', multiplier: 1.2, desc: 'Moderne & Souple', color: '#D2B48C' },
  { id: 'frene', name: 'Frêne Blanc', multiplier: 1.4, desc: 'Élégant & Clair', color: '#E3DAC9' },
  { id: 'noyer', name: 'Noyer Sombre', multiplier: 2.5, desc: 'Luxe & Caractère', color: '#4E342E' },
];

const FINISHES = [
  { id: 'natural', name: 'Naturel', color: '#F5F5DC' },
  { id: 'honey', name: 'Miel', color: '#E49B0F' },
  { id: 'walnut', name: 'Noyer', color: '#5D4037' },
  { id: 'ebony', name: 'Ebène', color: '#1A1A1A' },
  { id: 'white', name: 'Céruse', color: '#FFFFFF' },
];

const BASE_PRICE = 1500;

export default function DynamicProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // --- States ---
  const [length, setLength] = useState(180);
  const [width, setWidth] = useState(90);
  const [selectedWood, setSelectedWood] = useState(WOOD_TYPES[3]); // Noyer par défaut
  const [selectedFinish, setSelectedFinish] = useState(FINISHES[0]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // --- Dynamic Price Selection with Animation Effect ---
  useEffect(() => {
    const calculatePrice = () => {
      const areaInM2 = (length * width) / 10000;
      const baseProductPrice = areaInM2 * 5500; // Base rate per m2
      const woodSurplus = areaInM2 * selectedWood.multiplier * 3200;
      const finalPrice = Math.round(BASE_PRICE + baseProductPrice + woodSurplus);
      setTotalPrice(finalPrice);
    };

    const timer = setTimeout(calculatePrice, 100); // Debounce
    return () => clearTimeout(timer);
  }, [length, width, selectedWood]);

  const product = {
    id: id,
    name: "L'Horizon : Table de Repas Directrice",
    category: "Collection Artisanale Marrakech",
    description: "Façonnée dans le respect des traditions de l'Atlas, cette pièce majeure allie la force du bois massif à la finesse du design contemporain. Chaque table est certifiée par notre atelier.",
    images: [
      "https://images.unsplash.com/photo-1577146333359-b9f4b304cf55?w=800",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800",
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800",
    ]
  };

  return (
    <div className="flex-1 bg-surface py-24 px-8 md:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-32">
        
        {/* Gallery Section - LEFT */}
        <div className="flex-1 space-y-12">
          <motion.div 
            layoutId={`img-${product.id}`}
            className="aspect-[4/5] rounded-[0.5rem] bg-surface-low overflow-hidden shadow-2xl relative"
          >
            <img 
              src={product.images[0]} 
              className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-110" 
            />
            <div className="absolute top-12 left-12 bg-surface/80 backdrop-blur-xl px-6 py-2 rounded-full border border-outline/5 font-work text-[8px] uppercase tracking-[0.4em] font-black">
              Pièce Unique : 001/2024
            </div>
            
            <button 
              onClick={() => setIsFavorited(!isFavorited)}
              className="absolute bottom-12 right-12 w-16 h-16 bg-surface/80 backdrop-blur-xl rounded-full flex items-center justify-center text-on-surface hover:text-primary transition-all group"
            >
              <Heart size={24} fill={isFavorited ? "currentColor" : "none"} className={isFavorited ? "text-primary" : "group-hover:scale-125 transition-transform"} />
            </button>
          </motion.div>

          <div className="grid grid-cols-3 gap-6">
            {product.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-[0.5rem] bg-surface-low overflow-hidden cursor-pointer hover:bg-surface-highest transition-all group">
                <img src={img} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all rounded-[0.375rem]" />
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Section - RIGHT */}
        <div className="flex-1">
          <div className="mb-24">
            <Link href="/catalog" className="font-work text-[10px] uppercase tracking-[0.4em] text-secondary font-black mb-12 block">
               ← Studio & Catalogue
            </Link>
            <h1 className="text-[3.5rem] md:text-[5rem] font-serif leading-[1.1] text-on-surface mb-8 italic">{product.name}</h1>
            <p className="text-xl text-on-surface/40 leading-loose italic max-w-lg mb-12">"{product.description}"</p>
                  
            <div className="flex items-baseline gap-6">
              <div className="flex flex-col">
                <span className="font-work text-[8px] uppercase tracking-[0.4em] text-secondary font-black mb-1">Prix Estimatif</span>
                <AnimatePrice value={totalPrice} />
              </div>
              <span className="text-2xl font-serif text-secondary pb-3 tracking-widest italic">MAD</span>
            </div>
          </div>

          <div className="space-y-20">
            <CustomizationSection 
              length={length} setLength={setLength}
              width={width} setWidth={setWidth}
              selectedWood={selectedWood} setSelectedWood={setSelectedWood}
              selectedFinish={selectedFinish} setSelectedFinish={setSelectedFinish}
            />
            
            <div className="flex flex-col gap-6 pt-12">
              <Link 
                href="/checkout"
                className="btn-primary w-full text-xl py-8 shadow-2xl shadow-primary/20 flex gap-4 items-center justify-center"
              >
                Direct Order <MoveRight size={24} />
              </Link>
              <button 
                className="btn-secondary w-full py-6 flex items-center justify-center gap-2 group"
              >
                Sauvegarder la Configuration <Heart size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <p className="text-[8px] text-stone-400 font-work uppercase tracking-[0.3em] italic text-center">
              * Validé par le maître artisan de l'atelier Marrakech avant le devis final.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function AnimatePrice({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 1000;
    const stepTime = 10;
    const totalSteps = duration / stepTime;
    const stepValue = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += stepValue;
      if ((stepValue > 0 && start >= end) || (stepValue < 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-[5rem] md:text-[6rem] font-serif text-charcoal italic tracking-tighter">
      {displayValue.toLocaleString()}
    </span>
  );
}

function CustomizationSection({ 
  length, setLength, 
  width, setWidth, 
  selectedWood, setSelectedWood,
  selectedFinish, setSelectedFinish 
}: any) {
  return (
    <div className="space-y-16">
      {/* 2nd Tiers: Dimensions */}
      <div className="grid grid-cols-2 gap-12 border-t border-outline/5 pt-12">
        <div className="space-y-4">
          <label className="font-work text-[8px] uppercase tracking-[0.4em] text-on-surface/40 font-black">Longueur (cm)</label>
          <input 
            type="number" 
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="input-minimalist text-4xl font-serif italic text-secondary w-full"
          />
        </div>
        <div className="space-y-4">
          <label className="font-work text-[8px] uppercase tracking-[0.4em] text-on-surface/40 font-black">Largeur (cm)</label>
          <input 
            type="number" 
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="input-minimalist text-4xl font-serif italic text-secondary w-full"
          />
        </div>
      </div>

      {/* 2nd Tiers: Wood Selector Chips */}
      <div>
        <label className="font-work text-[8px] uppercase tracking-[0.4em] text-on-surface/40 font-black mb-10 block">Choix de l'Essence</label>
        <div className="flex flex-wrap gap-4">
          {WOOD_TYPES.map((wood) => (
            <button
              key={wood.id}
              onClick={() => setSelectedWood(wood)}
              className={`px-8 py-4 rounded-full font-work text-[9px] uppercase tracking-[0.2em] font-black transition-all ${
                selectedWood.id === wood.id 
                ? 'bg-secondary text-surface shadow-2xl shadow-secondary/40 scale-105' 
                : 'bg-surface-low text-on-surface hover:bg-surface-highest'
              }`}
            >
              {wood.name}
            </button>
          ))}
        </div>
      </div>

      {/* Finishing Swatches */}
      <div>
        <label className="font-work text-[8px] uppercase tracking-[0.4em] text-on-surface/40 font-black mb-10 block">Finiton Artisanale</label>
        <div className="flex gap-8">
          {FINISHES.map((finish) => (
            <button
              key={finish.id}
              onClick={() => setSelectedFinish(finish)}
              className={`w-14 h-14 rounded-full border-2 transition-all p-1.5 relative group ${
                selectedFinish.id === finish.id ? 'border-primary scale-125 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100 grayscale hover:scale-110'
              }`}
            >
              <div className="w-full h-full rounded-full" style={{ backgroundColor: finish.color }} />
              <div className="absolute top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-work text-[7px] uppercase tracking-widest text-secondary font-black">{finish.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


