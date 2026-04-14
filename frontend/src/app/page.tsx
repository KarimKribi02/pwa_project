'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Hammer, DoorOpen, Utensils, Table, ShieldCheck, Timer } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section: The Atelier Entrance */}
      <section className="relative h-[100vh] flex items-center overflow-hidden bg-surface">
        <div 
          className="absolute right-0 top-0 w-full h-[85vh] md:w-3/4 opacity-90 grayscale-[20%] hover:grayscale-0 transition-all duration-1000 z-0 overflow-hidden"
          style={{ backgroundImage: 'url("/hero.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 px-8 md:px-32 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-work text-xs uppercase tracking-[0.4em] text-secondary font-bold mb-12 block"
          >
            Héritage & Précision
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[3.5rem] md:text-[5.5rem] font-serif leading-[1.1] text-on-surface mb-12 italic"
          >
            L'Art du Bois à <br />
            <span className="text-secondary not-italic">Marrakech</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl offset-md-1"
          >
            <p className="text-lg md:text-xl text-on-surface/60 font-sans leading-[1.8] mb-12 font-light">
              Découvrez la synergie entre l'artisanat marocain traditionnel et la précision numérique. Créations sur mesure pour des espaces qui racontent une histoire d'héritage et d'âme.
            </p>
            <div className="flex gap-8">
              <Link href="/catalog" className="btn-primary group">
                Commencer un Projet <DoorOpen className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary">
                Notre Atelier
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Wood Texture Overlay (Organic Asymmetry) */}
        <div className="absolute bottom-10 right-10 w-64 h-64 border-[1px] border-outline/5 -rotate-6 hidden lg:block opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
      </section>

      {/* Categories: Surface Tonal Shift */}
      <section className="py-24 bg-surface-low px-8 md:px-16 section-gap relative">
        <header className="max-w-7xl mx-auto mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <h2 className="text-[3rem] font-serif text-on-surface leading-tight">Featured <br /> Categories</h2>
          <p className="text-stone-400 font-work text-xs uppercase tracking-widest max-w-sm text-right">Explore our curated collections, where every grain of wood is selected for its character and every joint is a testament to timeless durability.</p>
        </header>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <CategoryCard index={0} title="Doors" desc="Grand entrances that define the threshold between the world and your sanctuary." />
          <CategoryCard index={1} title="Tables" desc="Gathering pieces where memories are carved into the heart of solid cedar." />
          <CategoryCard index={2} title="Kitchens" desc="The hearth of the home, reimagined through precision joinery and modern utility." />
        </div>
      </section>

      {/* Our Process: The Blueprint Look */}
      <section className="py-32 bg-surface px-8 md:px-16 section-gap overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 text-[10rem] font-serif text-on-surface/5 font-bold italic select-none">01</div>
            <h2 className="text-5xl font-serif mb-12 text-on-surface relative z-10 leading-snug">Un Savoir-Faire <br /> Ancestral</h2>
            <p className="text-stone-500 text-lg leading-[1.8] mb-12 max-w-lg font-light">
              Chaque pièce commence par une sélection rigoureuse des essences locales. Notre processus combine la précision des outils modernes avec la main sensible du maître artisan.
            </p>
            <div className="space-y-12 pl-4 border-l border-outline/20">
              <ProcessItem number="01" title="Conceptualization" text="Collaborative design phase turning your vision into technical blueprints." />
              <ProcessItem number="02" title="Material Selection" text="Sourcing aromatic cedar or robust oak, each plank vetted for grain pattern." />
              <ProcessItem number="03" title="Master Crafting" text="Centuries-old joinery meets modern precision for a lifetime of beauty." />
            </div>
          </div>
          
          {/* Overlapping Img Gallery (Asymmetry) */}
          <div className="relative h-[600px] flex items-center">
            <motion.div 
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: 50, opacity: 0 }}
              className="absolute right-0 w-4/5 h-[500px] bg-surface-highest rounded-[0.5rem] shadow-2xl overflow-hidden z-0"
            >
              <img src="https://images.unsplash.com/photo-1581423346202-2640aa5ce675?w=800&auto=format" className="w-full h-full object-cover grayscale-[30%]" />
            </motion.div>
            <motion.div 
              whileInView={{ y: 0, opacity: 1 }}
              initial={{ y: 50, opacity: 0 }}
              className="absolute left-0 bottom-0 w-3/5 aspect-square bg-white rounded-[0.5rem] shadow-2xl p-10 z-10 border border-outline/5"
            >
              <div className="h-full w-full bg-surface-low border-dashed border border-outline/30 flex items-center justify-center text-stone-300 font-serif italic text-center p-8">
                "Precision is the respect we owe to the wood."
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProcessItem({ number, title, text }: { number: string, title: string, text: string }) {
  return (
    <div className="group">
      <h4 className="text-xs font-work uppercase tracking-widest text-secondary font-bold mb-2 flex items-center gap-4">
        {number} <span className="w-12 h-[1px] bg-outline/20" />
      </h4>
      <h3 className="text-xl font-serif mb-3 text-on-surface">{title}</h3>
      <p className="text-stone-400 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function CategoryCard({ index, title, desc }: { index: number, title: string, desc: string }) {
  const isAlt = (index + 1) % 3 === 0;
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`card-artisan p-12 flex flex-col justify-between h-[450px] group cursor-pointer ${isAlt ? 'wood-accent-bar' : ''}`}
    >
      <div className="h-48 w-full bg-surface-low rounded-[0.5rem] overflow-hidden">
        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] group-hover:scale-125 transition-transform duration-1000 ease-out" />
        <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <h3 className="text-3xl font-serif text-on-surface mb-6 group-hover:text-primary transition-colors italic">{title}</h3>
        <p className="text-stone-500 font-sans leading-relaxed text-sm">{desc}</p>
      </div>
      <div className="font-work text-[10px] uppercase tracking-[0.3em] font-black text-on-surface/30 group-hover:text-primary transition-all">
        Explorer la Collection →
      </div>
    </motion.div>
  );
}



