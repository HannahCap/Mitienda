import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, Plus, X, ChevronDown, Info, Instagram, MessageCircle } from "lucide-react";

const OWNER = {
  brand: "Paws & Trades",
  tagline: "Compra, venta e intercambio de pets (fan-site, no oficial)",
  whatsapp: "+5491122880015",
  instagram: "https://instagram.com/tu_instagram",
  location: "Buenos Aires, AR",
  currency: "ARS",
};

const INITIAL_ITEMS = [
  { id: "p1", name: "Shadow Dragon", rarity: "legendario", price: 350000, img: "https://placehold.co/600x400/png?text=Shadow+Dragon", stock: 1, tags: ["montable", "neón"] },
  { id: "p2", name: "Frost Fury", rarity: "legendario", price: 210000, img: "https://placehold.co/600x400/png?text=Frost+Fury", stock: 3, tags: ["montable"] },
  { id: "p3", name: "Albino Monkey", rarity: "ultra-raro", price: 90000, img: "https://placehold.co/600x400/png?text=Albino+Monkey", stock: 2, tags: ["fly", "ride"] },
  { id: "p4", name: "Golden Penguin", rarity: "raro", price: 45000, img: "https://placehold.co/600x400/png?text=Golden+Penguin", stock: 5, tags: ["colección"] },
];

const RARITIES = [
  { value: "legendario", label: "Legendario" },
  { value: "ultra-raro", label: "Ultra-raro" },
  { value: "raro", label: "Raro" },
  { value: "común", label: "Común" },
];

function formatMoney(n, currency = OWNER.currency) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n);
  } catch {
    return new Intl.NumberFormat("es-AR").format(n) + ` ${currency}`;
  }
}

export default function App() {
  const [items] = useState(INITIAL_ITEMS);
  const [q, setQ] = useState("");
  const [rarity, setRarity] = useState("");
  const [sort, setSort] = useState("recent");
  const [sellOpen, setSellOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        i.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
    );
    if (rarity) list = list.filter((i) => i.rarity === rarity);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "stock") list = [...list].sort((a, b) => b.stock - a.stock);
    return list;
  }, [items, q, rarity, sort]);

  const contactWhatsApp = (item) => {
    const message = encodeURIComponent(
      `Hola! Me interesa *${item?.name || "vender/comprar/intercambiar"}* en ${OWNER.brand}.\n` +
        (item ? `Vi que está a ${formatMoney(item.price)}. ¿Sigue disponible?` : "Quiero venderte o proponerte un intercambio.")
    );
    return `https://wa.me/${OWNER.whatsapp.replace(/\D/g, "")}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-amber-400 to-violet-500"></div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-sky-400 to-fuchsia-500"></div>
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{OWNER.brand}</h1>
              <p className="mt-2 text-neutral-600">{OWNER.tagline}</p>
              <div className="mt-3 text-xs text-neutral-500">Ubicado en {OWNER.location} · Precios en {OWNER.currency}</div>
              <button onClick={() => setDisclaimerOpen(true)} className="mt-4 inline-flex items-center gap-2 text-sm underline decoration-dotted hover:no-underline">
                <Info size={16} /> Descargo de responsabilidad
              </button>
            </div>
            <div className="flex items-center gap-3">
              <a href={`https://wa.me/${OWNER.whatsapp.replace(/\D/g, "")}`} target="_blank" className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white">
                <MessageCircle size={18} /> WhatsApp
              </a>
              <a href={OWNER.instagram} target="_blank" className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm bg-pink-500 hover:bg-pink-600 text-white">
                <Instagram size={18} /> Instagram
              </a>
              <button onClick={() => setSellOpen(true)} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm bg-neutral-900 hover:bg-neutral-800 text-white">
                <Plus size={18} /> Vender mi pet
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
                <Search size={18} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o tag (p. ej. 'neón')" className="w-full outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              <div className="relative">
                <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="w-full appearance-none rounded-2xl border bg-white px-4 py-3 pr-9">
                  <option value="">Todas las rarezas</option>
                  {RARITIES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={18} />
              </div>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full appearance-none rounded-2xl border bg-white px-4 py-3 pr-9">
                  <option value="recent">Orden: Recientes</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="stock">Stock</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <motion.article key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group rounded-3xl border bg-white shadow-sm hover:shadow-md overflow-hidden">
              <div className="relative">
                <img src={item.img} alt={item.name} className="h-48 w-full object-cover" />
                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{item.rarity}</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
                <div className="mt-1 text-sm text-neutral-500">Stock: {item.stock}</div>
                <div className="mt-2 text-xl font-bold">{formatMoney(item.price)}</div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <a href={contactWhatsApp(item)} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <MessageCircle size={16} /> Contactar por WhatsApp
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <section className="mt-14">
          <div className="rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag size={20}/> ¿Querés proponerme un intercambio o venderme un pet?</h2>
            <p className="mt-2 text-neutral-600 max-w-3xl">
              Si querés ofrecerme tus pets o proponer un intercambio, escribime por WhatsApp. Podemos coordinar intercambios, combos o ventas directas de forma rápida y segura.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`https://wa.me/${OWNER.whatsapp.replace(/\D/g, "")}`} target="_blank" className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white"><MessageCircle size={18}/> WhatsApp</a>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Vender */}
      <AnimatePresence>
        {sellOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Vender mi pet</h3>
                <button onClick={() => setSellOpen(false)} className="rounded-full p-2 hover:bg-neutral-100"><X size={18}/></button>
              </div>
              <p className="mt-1 text-sm text-neutral-600">Completá el formulario y te respondo al toque.</p>
              <form className="mt-4 grid gap-3" onSubmit={(e)=>{
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                const text = encodeURIComponent(
                  `Hola! Quiero *vender un pet*.\n\n`+
                  `Nombre del pet: ${data.name || "-"}\n`+
                  `Rareza: ${data.rarity || "-"}\n`+
                  `Estado (fly/ride/neón): ${data.state || "-"}\n`+
                  `Precio deseado: ${data.price || "-"} ${OWNER.currency}\n`+
                  `Notas: ${data.notes || "-"}`
                );
                window.open(`https://wa.me/${OWNER.whatsapp.replace(/\D/g, "")}?text=${text}`, "_blank");
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Nombre del pet</label>
                    <input name="name" required className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Ej. Shadow Dragon"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rareza</label>
                    <select name="rarity" className="mt-1 w-full rounded-xl border px-3 py-2">
                      <option value="legendario">Legendario</option>
                      <option value="ultra-raro">Ultra-raro</option>
                      <option value="raro">Raro</option>
                      <option value="común">Común</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estado (fly/ride/neón)</label>
                    <input name="state" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Ej. fly + ride"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Precio deseado ({OWNER.currency})</label>
                    <input name="price" type="number" min="0" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Ej. 100000"/>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Notas</label>
                  <textarea name="notes" rows={4} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Detalles, combos, tiempos, etc."/>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={()=>setSellOpen(false)} className="rounded-xl border px-4 py-2">Cancelar</button>
                  <button type="submit" className="rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">Enviar por WhatsApp</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Disclaimer */}
      <AnimatePresence>
        {disclaimerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Descargo de responsabilidad</h3>
                <button onClick={() => setDisclaimerOpen(false)} className="rounded-full p-2 hover:bg-neutral-100"><X size={18}/></button>
              </div>
              <div className="mt-2 text-sm text-neutral-700 space-y-3">
                <p>Este es un fan-site independiente. No está afiliado ni patrocinado por los desarrolladores del juego.</p>
                <p>La compra/venta de ítems de juego puede estar limitada por los Términos de Servicio del juego. Usá cuentas alternativas y evitá compartir datos sensibles. Todas las transacciones son finales.</p>
                <p>Recomendamos documentar cada intercambio (capturas, IDs, fecha/hora) y usar métodos de pago con comprobante.</p>
              </div>
              <div className="flex justify-end pt-3">
                <button onClick={() => setDisclaimerOpen(false)} className="rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">Entendido</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbuja WhatsApp */}
      <a
        href={`https://wa.me/5491122880015?text=${encodeURIComponent("Hola! Quiero comprar o intercambiar un pet 🐾")}`}
        target="_blank"
        className="fixed bottom-5 right-5 z-50 rounded-full px-4 py-3 shadow-lg bg-emerald-500 text-white font-medium"
      >
        WhatsApp
      </a>
    </div>
  );
}
