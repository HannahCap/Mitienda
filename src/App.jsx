import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, ShoppingBag, Plus, X, ChevronDown, Info, MessageCircle,
  LogIn, LogOut, Trash2, Save
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ----- Supabase -----
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ----- Datos del sitio -----
const OWNER = {
  brand: "Paws & Trades",
  tagline: "Compra, venta e intercambio de pets (fan-site, no oficial)",
  whatsapp: "+5491122880015",
  location: "Buenos Aires, AR",
  currency: "ARS",
};

const RARITIES = [
  { value: "legendario", label: "Legendario" },
  { value: "ultra-raro", label: "Ultra-raro" },
  { value: "raro", label: "Raro" },
  { value: "común", label: "Común" },
];

function formatMoney(n, currency = OWNER.currency) {
  const num = Number(n ?? 0);
  try { return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(num); }
  catch { return new Intl.NumberFormat("es-AR").format(num) + ` ${currency}`; }
}

export default function App() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [rarity, setRarity] = useState("");
  const [sort, setSort] = useState("recent");
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [session, setSession] = useState(null);
  const isAuthed = Boolean(session);

  // ----- Carga inicial -----
  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        // Modo demo (si no hay Supabase)
        setItems([
          { id: "p1", name: "Shadow Dragon", rarity: "legendario", price: 350000, img: "https://placehold.co/600x600/png?text=Shadow+Dragon", stock: 1, tags: "montable,neón" },
          { id: "p2", name: "Frost Fury", rarity: "legendario", price: 210000, img: "https://placehold.co/600x600/png?text=Frost+Fury", stock: 3, tags: "montable" },
          { id: "p3", name: "Albino Monkey", rarity: "ultra-raro", price: 90000, img: "https://placehold.co/600x600/png?text=Albino+Monkey", stock: 2, tags: "fly,ride" },
          { id: "p4", name: "Golden Penguin", rarity: "raro", price: 45000, img: "https://placehold.co/600x600/png?text=Golden+Penguin", stock: 5, tags: "colección" },
        ]);
        return;
      }
      const { data, error } = await supabase.from("items").select("*").order("name");
      if (!error) setItems(data || []);
    };
    load();

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((_ev, sess) => setSession(sess));
      return () => sub?.subscription.unsubscribe();
    }
  }, []);

  // ----- Filtros -----
  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      const hay = (s) => (s || "").toLowerCase();
      return hay(i.name).includes(hay(q)) || hay(i.tags).includes(hay(q));
    });
    if (rarity) list = list.filter((i) => i.rarity === rarity);
    if (sort === "price-asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "stock") list = [...list].sort((a, b) => Number(b.stock) - Number(a.stock));
    return list;
  }, [items, q, rarity, sort]);

  // ----- WhatsApp -----
  const contactWhatsApp = (item) => {
    const message = encodeURIComponent(
      `Hola! Me interesa *${item?.name || "vender/comprar/intercambiar"}* en ${OWNER.brand}.\n` +
      (item ? `Vi que está a ${formatMoney(item.price)}. ¿Sigue disponible?` : "Quiero venderte o proponerte un intercambio.")
    );
    return `https://wa.me/${OWNER.whatsapp.replace(/\D/g, "")}?text=${message}`;
  };

  // ----- CRUD -----
  const addItem = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const payload = {
      name: data.name,
      rarity: data.rarity,
      price: Number(data.price || 0),
      img: data.img || "",
      stock: Number(data.stock || 0),
      tags: data.tags || "",
    };
    if (!supabase) return alert("Falta configurar Supabase (env vars en Vercel).");
    const { data: inserted, error } = await supabase.from("items").insert(payload).select();
    if (error) return alert("Error: " + error.message);
    setItems((prev) => [inserted[0], ...prev]);
    e.currentTarget.reset();
  };

  const deleteItem = async (id) => {
    if (!confirm("¿Eliminar este pet?")) return;
    if (!supabase) return alert("Falta configurar Supabase (env vars en Vercel).");
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return alert("Error: " + error.message);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ----- Auth -----
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Falta configurar Supabase (env vars en Vercel).");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) alert("Login falló: " + error.message);
    else setLoginOpen(false);
  };
  const handleLogout = async () => { await supabase?.auth.signOut(); };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* Header */}
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

              {!isAuthed ? (
                <button onClick={() => setLoginOpen(true)} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm bg-neutral-900 hover:bg-neutral-800 text-white">
                  <LogIn size={18} /> Iniciar sesión
                </button>
              ) : (
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm bg-neutral-200 hover:bg-neutral-300">
                  <LogOut size={18} /> Salir
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-8">
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
                  {RARITIES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
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

      {/* Agregar pet */}
      {isAuthed && (
        <section className="mx-auto max-w-6xl px-4 mt-6 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2"><Plus size={18}/> Agregar nuevo pet</h2>
          <form className="mt-4 grid gap-3" onSubmit={addItem}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input name="name" required className="rounded-xl border px-3 py-2" placeholder="Nombre (ej. Shadow Dragon)" />
              <select name="rarity" className="rounded-xl border px-3 py-2">
                {RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <input name="price" type="number" min="0" className="rounded-xl border px-3 py-2" placeholder="Precio (ARS)" />
              <input name="img" className="rounded-xl border px-3 py-2 md:col-span-2" placeholder="URL de imagen (cuadrada o rectangular)" />
              <input name="stock" type="number" min="0" className="rounded-xl border px-3 py-2" placeholder="Stock" />
              <input name="tags" className="rounded-xl border px-3 py-2 md:col-span-3" placeholder="Tags (neón,fly,ride)" />
            </div>
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"><Save size={16}/> Guardar</button>
            </div>
          </form>
        </section>
      )}

      {/* Listado */}
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <motion.article key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group rounded-3xl border bg-white shadow-sm hover:shadow-md overflow-hidden">
              {/* Imagen cuadrada con relleno difuminado */}
              <div className="relative">
                <div
                  className="relative w-full aspect-square overflow-hidden rounded-2xl"
                  style={{
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${item.img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(12px)",
                      transform: "scale(1.1)",
                    }}
                  />
                 {/* Imagen cuadrada con blur + fallback */}
<div className="relative w-full aspect-square overflow-hidden rounded-2xl">
  {/* Capa de fondo difuminada que rellena el cuadrado */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `url(${item.img || ""})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(12px)",
      transform: "scale(1.1)"
    }}
  />
  {/* Si falla la imagen real, mostramos un placeholder */}
  <img
    src={item.img}
    alt={item.name}
    className="relative z-10 h-full w-full object-contain"
    loading="lazy"
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "https://placehold.co/600x600?text=Sin+imagen";
      const bg = e.currentTarget.previousSibling;
      if (bg && bg.style) {
        bg.style.backgroundImage = "none";
        bg.style.filter = "none";
        bg.style.backgroundColor = "#f3f4f6";
      }
    }}
  />
</div>
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{item.rarity}</div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
                <div className="mt-1 text-sm text-neutral-500">Stock: {item.stock}</div>
                <div className="mt-2 text-xl font-bold">{formatMoney(item.price)}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
                  {(item.tags || "").split(",").filter(Boolean).map((t) => (
                    <span key={t} className="rounded-full border px-2 py-1">#{t.trim()}</span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <a href={contactWhatsApp(item)} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <MessageCircle size={16} /> Contactar por WhatsApp
                  </a>
                  {isAuthed && (
                    <button onClick={() => deleteItem(item.id)} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 border bg-white hover:bg-neutral-50 text-red-600">
                      <Trash2 size={16}/> Eliminar
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Sección intercambio */}
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

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="font-semibold">{OWNER.brand}</div>
              <div className="text-sm text-neutral-500">{OWNER.tagline}</div>
              <div className="mt-2 text-xs text-neutral
