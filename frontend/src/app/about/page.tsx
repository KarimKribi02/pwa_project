'use client';

import { motion } from 'framer-motion';
import { Shovel as Chisel, Trees, Zap, Ruler, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { 
      title: 'Matériaux Nobles', 
      desc: 'Selection rigoureuse de cèdre de l\'Atlas et de bois de rose sourcés localement.',
      icon: <Trees className="text-secondary" size={32} />
    },
    { 
      title: 'Précision Numérique', 
      desc: 'L\'alliance entre le geste de l\'artisan et la rigueur de la découpe laser.',
      icon: <Zap className="text-secondary" size={32} />
    },
    { 
      title: 'Sur Mesure Total', 
      desc: 'Chaque pièce est dessinée selon votre vision unique, sans compromis.',
      icon: <Ruler className="text-secondary" size={32} />
    },
  ];

  const gallery = [
    "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=800&auto=format&fit=crop", // Workshop wide
    "https://images.unsplash.com/photo-1555505012-4093c7849c00?q=80&w=800&auto=format&fit=crop", // Chisel detail
    "https://images.unsplash.com/photo-1426927308491-6380b6a9936f?q=80&w=800&auto=format&fit=crop", // Wood shavings
    "https://images.unsplash.com/photo-1610413340058-2936746ef921?q=80&w=800&auto=format&fit=crop"  // Wood texture detail
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section: Storytelling */}
      <section className="relative pt-32 pb-24 px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-6">Notre Héritage</h4>
            <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight mb-8 italic">
              L'écho du Maâlem <br /> à l'ère Digitale.
            </h1>
            <div className="space-y-6 text-stone-500 font-light leading-relaxed text-lg max-w-xl">
              <p>
                Fondée au cœur de Marrakech, **Menuiserie Digitale** est née d'une ambition simple : préserver les traditions séculaires du travail du bois marocain tout en les propulsant dans le futur.
              </p>
              <p>
                Chaque création qui sort de notre atelier porte en elle l'odeur du cèdre, la finesse des motifs ancestraux, et la précision mathématique que seul le numérique permet d'atteindre avec une telle constance.
              </p>
            </div>
          </motion.div>
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
            >
              <img 
                src="https://images.unsplash.com/photo-1541829081725-6f1c93bb8996?q=80&w=800&auto=format&fit=crop" 
                alt="Maître artisan travaillant le bois" 
                className="w-full h-full object-cover"
              />
              {/* Authenticity Badge Overlay */}
              <div className="absolute bottom-10 -right-4 bg-white p-6 shadow-2xl flex items-center gap-4 border border-primary/5">
                <ShieldCheck className="text-secondary" size={24} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Authenticité</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Garantie</p>
                </div>
              </div>
            </motion.div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <ShieldCheck className="text-secondary" size={32} />
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight">Authenticité <br /> Garantis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-surface-low px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif text-center text-primary mb-16">Nos Valeurs d'Atelier</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((v, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm text-center group hover:shadow-xl transition-all"
              >
                <div className="mx-auto w-20 h-20 bg-surface-low rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h3 className="text-xl font-serif text-primary mb-4">{v.title}</h3>
                <p className="text-sm font-light text-stone-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Behind the Scenes Gallery */}
      <section className="py-24 px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="text-4xl font-serif text-primary italic">L'Âme du <br /> Workshop</h2>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold max-w-xs text-right">Instantclichés capturés au cœur de Marrakech, où le sciage rencontre le dessin vectoriel.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 0.98 }}
                className={`rounded-3xl overflow-hidden aspect-[3/4] ${i % 2 === 1 ? "md:translate-y-8" : ""}`}
              >
                <img src={img} alt={`Artisanal work ${i}`} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
