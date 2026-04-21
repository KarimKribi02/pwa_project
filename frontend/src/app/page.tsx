'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Hammer, DoorOpen, Utensils, Table, Search, Sofa, Layout, DraftingCompass, ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Portes");

  return (
    <div className="flex flex-col">
      {/* Hero Section: The Cinematic Atelier */}
      <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Video / Image */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            poster="/hero_workshop.png"
            className="w-full h-full object-cover brightness-[0.6] transition-all duration-1000"
          >
            <source src="https://res.cloudinary.com/digfptrqs/video/upload/v1776807476/Menuiserie_-_Le_travail_d_un_passionn_du_bois_x9ofgd.mp4" type="video/mp4" />
          </video>
          {/* Subtle Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </div>
        
        <div className="relative z-10 px-8 md:px-0 w-full max-w-6xl text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl md:text-7xl font-sans font-bold leading-[1.1] text-white mb-16 tracking-tight"
          >
            Menuiserie Digitale, <span className="text-secondary italic">Excellence.</span><br />
            L'Art du Bois, <span className="text-secondary italic">Signature.</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl"
          >
            {/* Search / Filter Container */}
            <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-2 md:p-4 overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
                {[
                  { id: "Portes", icon: <DoorOpen size={16} />, label: "PORTES" },
                  { id: "Cuisines", icon: <Utensils size={16} />, label: "CUISINES" },
                  { id: "Tables", icon: <Table size={16} />, label: "TABLES" },
                  { id: "Salons", icon: <Sofa size={16} />, label: "SALONS" },
                  { id: "Mobilier", icon: <Layout size={16} />, label: "MOBILIER" },
                  { id: "Concept", icon: <DraftingCompass size={16} />, label: "CONCEPT" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? "text-primary bg-primary/5" 
                        : "text-gray-400 hover:text-primary/70"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex flex-col md:flex-row items-stretch gap-4 p-4">
                <div className="flex-1 flex flex-col items-start px-4 border-r-0 md:border-r border-gray-200">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">PROJET</span>
                  <div className="flex items-center justify-between w-full cursor-pointer group">
                    <span className="text-primary font-medium">Sélectionner un type...</span>
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-start px-4 border-r-0 md:border-r border-gray-200">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">MÉTRARE</span>
                  <div className="flex items-center justify-between w-full cursor-pointer group">
                    <span className="text-primary font-medium">Demander un devis</span>
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="flex-[0.5] flex items-center justify-center pl-4">
                  <button className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 py-4 md:py-3 px-8 rounded-2xl md:rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                    <Search size={20} />
                    <span>Chercher</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories: Surface Tonal Shift */}
      <section className="py-24 bg-surface-low px-8 md:px-16 section-gap relative">
        <header className="max-w-7xl mx-auto mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <h2 className="text-[3rem] font-serif text-on-surface leading-tight">Featured <br /> Categories</h2>
          <p className="text-stone-400 font-work text-xs uppercase tracking-widest max-w-sm text-right">Explore our curated collections, where every grain of wood is selected for its character and every joint is a testament to timeless durability.</p>
        </header>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <CategoryCard 
            index={0} 
            title="Doors" 
            desc="Grand entrances that define the threshold between the world and your sanctuary." 
            image="/product_door.png"
          />
          <CategoryCard 
            index={1} 
            title="Tables" 
            desc="Gathering pieces where memories are carved into the heart of solid cedar." 
            image="/product_table.png"
          />
          <CategoryCard 
            index={2} 
            title="Kitchens" 
            desc="The hearth of the home, reimagined through precision joinery and modern utility." 
            image="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"
          />
        </div>
      </section>

      {/* Atelier Showcase: Premium Products */}
      <section className="py-32 bg-white px-8 md:px-16 section-gap relative">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20 text-center flex flex-col items-center">
            <span className="text-secondary font-bold tracking-[0.4em] text-[10px] mb-4 uppercase">Le prestige du sur-mesure</span>
            <h2 className="text-5xl font-serif text-primary mb-6 italic">L'Atelier Signature</h2>
            <div className="h-px w-24 bg-secondary/30 mt-4" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ShowcaseItem 
              id="4"
              title="Bibliothèque 'Modu'"
              price="4,500 €"
              desc="Structure modulaire en Chêne & Éclairage intégré"
              image="https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=800&auto=format&fit=crop"
            />
            <ShowcaseItem 
              id="5"
              title="Set de Bureau 'Organique'"
              price="850 €"
              desc="Accessoires en bois de Santal taillés main"
              image="https://images.unsplash.com/photo-1589311003463-5497b7b25e71?q=80&w=800&auto=format&fit=crop"
            />
            <ShowcaseItem 
              id="6"
              title="Porte 'Heritage'"
              price="7,200 €"
              desc="Cèdre massif sculpté, motifs traditionnels"
              image="https://images.unsplash.com/photo-1517646272486-a2c99a0b1840?q=80&w=800&auto=format&fit=crop"
            />
          </div>
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
              <img 
                src="https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=1200&auto=format&fit=crop" 
                alt="Artisanal Workshop" 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
              />
            </motion.div>
            <motion.div 
              whileInView={{ y: 0, opacity: 1 }}
              initial={{ y: 50, opacity: 0 }}
              className="absolute left-0 bottom-0 w-3/5 aspect-square bg-white rounded-[0.5rem] shadow-2xl p-1 z-10 border border-outline/5"
            >
              <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1622345426189-99464670081d?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-surface-low/90 flex items-center justify-center text-stone-600 font-serif italic text-center p-8 backdrop-blur-[2px]">
                  "La précision est le respect que nous devons au bois."
                </div>
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
      <h4 className="text-xs font-work uppercase tracking-widest text-accent font-bold mb-2 flex items-center gap-4">
        {number} <span className="w-12 h-[1px] bg-outline/20" />
      </h4>
      <h3 className="text-xl font-serif mb-3 text-on-surface">{title}</h3>
      <p className="text-stone-400 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function CategoryCard({ index, title, desc, image }: { index: number, title: string, desc: string, image: string }) {
  const isAlt = (index + 1) % 3 === 0;
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`card-artisan p-12 flex flex-col justify-between h-[500px] group cursor-pointer ${isAlt ? 'wood-accent-bar' : ''}`}
    >
      <div className="h-64 w-full bg-surface-low rounded-[0.5rem] overflow-hidden relative mb-8">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <h3 className="text-3xl font-serif text-on-surface mb-6 group-hover:text-accent transition-colors italic">{title}</h3>
        <p className="text-stone-500 font-sans leading-relaxed text-sm">{desc}</p>
      </div>
      <div className="font-work text-[10px] uppercase tracking-[0.3em] font-black text-on-surface/30 group-hover:text-accent transition-all mt-6">
        Explorer la Collection →
      </div>
    </motion.div>
  );
}

function ShowcaseItem({ id, title, price, desc, image }: { id: string, title: string, price: string, desc: string, image: string }) {
  return (
    <Link href={`/product/${id}`} className="block">
      <motion.div 
        whileHover={{ y: -10 }}
        className="flex flex-col group cursor-pointer"
      >
        <div className="relative aspect-[4/5] mb-8 overflow-hidden rounded-sm shadow-sm bg-surface-low">
          {/* Price Tag Overlay */}
          <div className="absolute top-6 right-6 z-20 bg-white px-6 py-4 shadow-2xl flex flex-col items-center">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Prix Estimatif</span>
            <span className="text-xl font-serif text-primary font-bold">{price}</span>
          </div>
          
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-2xl font-serif text-primary mb-2 group-hover:text-secondary transition-colors italic">{title}</h3>
            <p className="text-stone-400 font-sans text-xs italic">{desc}</p>
          </div>
          <div className="w-10 h-10 border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <ArrowRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}



