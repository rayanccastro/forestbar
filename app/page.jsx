"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Beer,
  Box,
  CookingPot,
  GlassWater,
  Moon,
  Receipt,
  ShoppingBasket,
  Trees,
  User,
  Users,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1484288942055620648/X0iL24wvswPOz_mUuL-J_yRpHy2TgRWrt3yvWuZjmFzc23bTVwURjvuK_CqLnfqJvgbz";
const UNIT_PRICE = 135;
const MULTIPLIER = 4;

const ITEMS = [
  {
    id: "milho-cozido",
    name: "Milho Cozido",
    price: UNIT_PRICE,
    icon: CookingPot,
    materials: { Milho: 4, "Sal Refinado": 1, Manteiga: 1, Água: 1 },
  },
  {
    id: "shot-tequila",
    name: "Shot de Tequila",
    price: UNIT_PRICE,
    icon: Wine,
    materials: { "Sal Refinado": 1, "Água Filtrada": 1, "Fermento Alcoólico": 1, Agave: 1 },
  },
  {
    id: "bolinho-bacalhau",
    name: "Bolinho de Bacalhau",
    price: UNIT_PRICE,
    icon: UtensilsCrossed,
    materials: { Tempero: 1, Batata: 1, Bacalhau: 1, Ovo: 1 },
  },
  {
    id: "suco-laranja",
    name: "Suco de Laranja",
    price: UNIT_PRICE,
    icon: GlassWater,
    materials: { "Água Filtrada": 1, Laranjas: 4, Açúcar: 1, Gelo: 1 },
  },
  {
    id: "cerveja",
    name: "Cerveja",
    price: UNIT_PRICE,
    icon: Beer,
    materials: { Água: 1, Lúpulo: 1, Cevada: 1, "Fermento Alcoólico": 1 },
  },
  {
    id: "espetinho",
    name: "Espetinho",
    price: UNIT_PRICE,
    icon: ShoppingBasket,
    materials: { Carvão: 1, "Carne Crua": 4, "Tempero Simples": 1, "Sal Grosso": 1 },
  },
];

const COMBOS = [
  {
    id: "brasa-malte",
    name: "Brasa & Malte",
    price: 2700,
    items: { Espetinho: 12, Cerveja: 8 },
  },
  {
    id: "fogo-mar",
    name: "Fogo no Mar",
    price: 2700,
    items: { "Bolinho de Bacalhau": 12, "Shot de Tequila": 8 },
  },
  {
    id: "colheita-solar",
    name: "Colheita Solar",
    price: 2700,
    items: { "Milho Cozido": 12, "Suco de Laranja": 8 },
  },
  {
    id: "tesouro-atlantico",
    name: "Tesouro do Atlântico",
    price: 1620,
    items: { "Bolinho de Bacalhau": 12 },
  },
];

const amber = "#c89b5d";
const bone = "#e8dbc2";
const barkSoft = "rgba(24,19,16,0.94)";
const pine = "#2f4737";
const greenSoft = "rgba(47,71,55,0.22)";
const fog = "#a59e93";
const line = "rgba(255,255,255,0.08)";

function createInitialMap(list) {
  return list.reduce((acc, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

function sumMaterials(materialMaps) {
  const total = {};
  for (const materialMap of materialMaps) {
    Object.entries(materialMap).forEach(([name, qty]) => {
      total[name] = (total[name] || 0) + qty;
    });
  }
  return total;
}

function multiplyMaterials(materials, factor) {
  return Object.fromEntries(Object.entries(materials).map(([name, qty]) => [name, qty * factor]));
}

function runTests() {
  const initial = createInitialMap([{ id: "a" }, { id: "b" }]);
  console.assert(initial.a === 0 && initial.b === 0, "Initial map should start with zeros");

  const multiplied = multiplyMaterials({ Água: 1, Milho: 4 }, 2);
  console.assert(multiplied["Água"] === 2 && multiplied["Milho"] === 8, "Materials should multiply correctly");

  const summed = sumMaterials([{ Água: 2, Sal: 1 }, { Água: 3, Gelo: 4 }]);
  console.assert(summed["Água"] === 5 && summed.Sal === 1 && summed.Gelo === 4, "Materials should sum correctly");

  console.assert(formatCurrency(135) === "$135", "Currency formatting should be stable for whole values");
}

function InputCard({ icon: Icon, ...props }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border px-4 py-3"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: line }}
    >
      {Icon ? <Icon size={18} style={{ color: amber }} /> : null}
      <input
        {...props}
        className="w-full bg-transparent outline-none placeholder:text-neutral-500"
        style={{ color: bone }}
      />
    </div>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <section
      className="rounded-[32px] border p-6"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        borderColor: line,
        boxShadow: "0 28px 70px rgba(0,0,0,.35)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.28em]" style={{ color: amber }}>
            {subtitle}
          </div>
          <h2 className="mt-2 text-3xl font-black" style={{ color: bone }}>
            {title}
          </h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function ProductCard({ title, price, quantity, onChange, icon: Icon, accent = amber }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[24px] border p-4"
      style={{ background: barkSoft, borderColor: line }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: bone }}>{title}</div>
          <div className="text-xs leading-5" style={{ color: fog }}>{price}</div>
        </div>
      </div>
      <input
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value || 0)))}
        className="w-full rounded-2xl border px-4 py-3 outline-none"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: line, color: bone }}
      />
    </motion.div>
  );
}

export default function Page() {
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [itemQuantities, setItemQuantities] = useState(() => createInitialMap(ITEMS));
  const [comboQuantities, setComboQuantities] = useState(() => createInitialMap(COMBOS));
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const expandedItems = useMemo(() => {
    const entries = [];

    ITEMS.forEach((item) => {
      const qty = Number(itemQuantities[item.id] || 0);
      if (qty > 0) {
        entries.push({
          type: "item",
          label: item.name,
          quantityInput: qty,
          quantityReady: qty * MULTIPLIER,
          unitPrice: item.price,
          total: qty * MULTIPLIER * item.price,
          materials: multiplyMaterials(item.materials, qty * MULTIPLIER),
        });
      }
    });

    COMBOS.forEach((combo) => {
      const qty = Number(comboQuantities[combo.id] || 0);
      if (qty > 0) {
        const comboMaterials = {};
        Object.entries(combo.items).forEach(([itemName, readyUnits]) => {
          const itemData = ITEMS.find((item) => item.name === itemName);
          if (!itemData) return;
          const multiplied = multiplyMaterials(itemData.materials, readyUnits * qty);
          Object.entries(multiplied).forEach(([material, amount]) => {
            comboMaterials[material] = (comboMaterials[material] || 0) + amount;
          });
        });

        entries.push({
          type: "combo",
          label: combo.name,
          quantityInput: qty,
          quantityReady: qty,
          unitPrice: combo.price,
          total: qty * combo.price,
          comboItems: combo.items,
          materials: comboMaterials,
        });
      }
    });

    return entries;
  }, [itemQuantities, comboQuantities]);

  const totalValue = expandedItems.reduce((sum, entry) => sum + entry.total, 0);
  const totalMaterials = useMemo(() => sumMaterials(expandedItems.map((entry) => entry.materials)), [expandedItems]);

  const resetForm = () => {
    setEmployeeName("");
    setEmployeeId("");
    setCustomerName("");
    setCustomerId("");
    setItemQuantities(createInitialMap(ITEMS));
    setComboQuantities(createInitialMap(COMBOS));
  };

  const handleSubmit = async () => {
    if (!employeeName || !employeeId || !customerName || !customerId) {
      setStatus("Preencha todos os dados do funcionário e do cliente.");
      return;
    }

    if (!expandedItems.length) {
      setStatus("Selecione pelo menos um item ou combo.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const itemLines = expandedItems
        .map((entry) => {
          if (entry.type === "combo") {
            const comboDescription = Object.entries(entry.comboItems)
              .map(([name, qty]) => `${qty * entry.quantityInput}x ${name}`)
              .join(" | ");
            return `• ${entry.label} | Qtd: ${entry.quantityInput} | Conteúdo: ${comboDescription} | Total: ${formatCurrency(entry.total)}`;
          }
          return `• ${entry.label} | Registro: ${entry.quantityInput} | Prontos: ${entry.quantityReady} | Total: ${formatCurrency(entry.total)}`;
        })
        .join("\n");

      const materialLines = Object.entries(totalMaterials)
        .map(([name, qty]) => `• ${name}: ${qty}`)
        .join("\n");

      const payload = {
        username: "Forest Bar",
        embeds: [
          {
            title: "🌲 Nova venda registrada - Forest Bar",
            color: 0x7b5a33,
            fields: [
              { name: "Funcionário", value: `${employeeName} (ID ${employeeId})`, inline: true },
              { name: "Cliente", value: `${customerName} (ID ${customerId})`, inline: true },
              { name: "Total da venda", value: formatCurrency(totalValue), inline: true },
              { name: "Total gasto pelo cliente", value: formatCurrency(totalValue), inline: true },
              { name: "Itens e combos", value: itemLines },
              { name: "Materiais gastos", value: materialLines },
            ],
            footer: { text: "Forest Bar • Sistema de Registro" },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao enviar webhook");

      setStatus("Venda registrada com sucesso.");
      setTimeout(() => {
        resetForm();
        setStatus("");
      }, 1200);
    } catch {
      setStatus("Erro ao registrar venda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 50% 12%, rgba(200,155,93,0.18), transparent 16%), radial-gradient(circle at 10% 20%, rgba(47,71,55,0.18), transparent 18%), radial-gradient(circle at 90% 18%, rgba(47,71,55,0.18), transparent 18%), linear-gradient(180deg, #090705 0%, #120e0b 100%)",
        color: bone,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/forest-bar.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top 48px",
          backgroundSize: "520px",
          opacity: 0.09,
          pointerEvents: "none",
          zIndex: 0,
          filter: "drop-shadow(0 20px 50px rgba(0,0,0,.45))",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "linear-gradient(180deg, rgba(6,4,3,0.20), rgba(6,4,3,0.55) 28%, rgba(6,4,3,0.84) 55%, rgba(6,4,3,0.96) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1650px] p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
          <section
            className="rounded-[34px] border p-7 md:p-9"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              borderColor: line,
              boxShadow: "0 30px 80px rgba(0,0,0,0.40)",
            }}
          >
            <div className="mb-6 flex justify-center">
              <img
                src="/forest-bar.png"
                alt="Forest Bar"
                style={{
                  width: "220px",
                  maxWidth: "100%",
                  height: "auto",
                  filter: "drop-shadow(0 18px 40px rgba(0,0,0,.45))",
                }}
              />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl border px-3 py-1 text-xs font-black uppercase tracking-[0.24em]" style={{ borderColor: `${amber}55`, color: amber }}>
                Forest Bar
              </div>
              <div className="rounded-2xl border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ borderColor: line, color: fog }}>
                Since 1846
              </div>
            </div>
            <div className="mb-3 flex items-center gap-3">
              <Moon size={20} style={{ color: amber }} />
              <Trees size={20} style={{ color: pine }} />
            </div>
            <h1 className="mb-3 text-4xl font-black leading-none md:text-6xl" style={{ color: bone }}>
              Forest Bar
              <span style={{ color: amber }}> Sales Log</span>
            </h1>
            <p className="max-w-3xl text-sm leading-7 md:text-base" style={{ color: fog }}>
              Agora com visual mais próximo da logo: clima noturno, tons amadeirados, dourado envelhecido,
              verde pinheiro e atmosfera de floresta sombria. O painel mantém a mesma lógica e ficou com uma
              identidade muito mais alinhada ao bar.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border p-5" style={{ background: barkSoft, borderColor: line }}>
                <div className="mb-3 flex items-center gap-3"><Box size={18} style={{ color: amber }} /><span className="text-xs uppercase tracking-[0.22em]" style={{ color: fog }}>Registros</span></div>
                <div className="text-3xl font-black">{expandedItems.length}</div>
                <div className="mt-1 text-sm" style={{ color: fog }}>linhas ativas na venda</div>
              </div>
              <div className="rounded-[24px] border p-5" style={{ background: barkSoft, borderColor: line }}>
                <div className="mb-3 flex items-center gap-3"><Receipt size={18} style={{ color: pine }} /><span className="text-xs uppercase tracking-[0.22em]" style={{ color: fog }}>Total</span></div>
                <div className="text-3xl font-black">{formatCurrency(totalValue)}</div>
                <div className="mt-1 text-sm" style={{ color: fog }}>valor da venda atual</div>
              </div>
              <div className="rounded-[24px] border p-5" style={{ background: barkSoft, borderColor: line }}>
                <div className="mb-3 flex items-center gap-3"><ShoppingBasket size={18} style={{ color: amber }} /><span className="text-xs uppercase tracking-[0.22em]" style={{ color: fog }}>Materiais</span></div>
                <div className="text-3xl font-black">{Object.keys(totalMaterials).length}</div>
                <div className="mt-1 text-sm" style={{ color: fog }}>tipos de insumos gastos</div>
              </div>
            </div>
          </section>

          <SectionCard
            title="Dados da venda"
            subtitle="Atendimento"
            right={<div className="grid h-14 w-14 place-items-center rounded-[20px]" style={{ background: greenSoft, color: pine }}><Users size={24} /></div>}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <InputCard icon={User} placeholder="Nome do Funcionário" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
              <InputCard icon={Receipt} placeholder="ID do Funcionário" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
              <InputCard icon={User} placeholder="Nome do cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <InputCard icon={Receipt} placeholder="ID do cliente" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
            </div>

            <div className="mt-5 rounded-[28px] border p-5" style={{ background: "linear-gradient(135deg, #3a2a1d, #65442a)", borderColor: "rgba(255,255,255,0.05)", color: bone }}>
              <div className="mb-1 text-xs font-black uppercase tracking-[0.24em] opacity-75">Resumo da venda</div>
              <div className="mb-2 text-3xl font-black">{formatCurrency(totalValue)}</div>
              <div className="mb-5 text-sm font-semibold opacity-90">{expandedItems.length} registro(s) ativo(s)</div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-2xl px-4 py-4 text-base font-black transition"
                style={{ background: "#0d0a08", color: amber, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Registrando venda..." : "Registrar venda"}
              </button>
            </div>

            <AnimatePresence>
              {status ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 rounded-2xl border px-4 py-3 text-sm font-bold"
                  style={{
                    background: status.toLowerCase().includes("sucesso") ? `${pine}22` : `${amber}16`,
                    borderColor: status.toLowerCase().includes("sucesso") ? `${pine}66` : `${amber}55`,
                    color: status.toLowerCase().includes("sucesso") ? "#9ed1af" : amber,
                  }}
                >
                  {status}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </SectionCard>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_420px]">
          <SectionCard
            title="Itens unitários"
            subtitle="Cardápio"
            right={<div className="grid h-14 w-14 place-items-center rounded-[20px]" style={{ background: `${amber}22`, color: amber }}><UtensilsCrossed size={24} /></div>}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {ITEMS.map((item) => (
                <ProductCard
                  key={item.id}
                  title={item.name}
                  price={`${formatCurrency(item.price)} por unidade pronta | 1 registro = 4 unidades`}
                  quantity={itemQuantities[item.id]}
                  onChange={(value) => setItemQuantities((prev) => ({ ...prev, [item.id]: value }))}
                  icon={item.icon}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Combos"
            subtitle="Promoções"
            right={<div className="grid h-14 w-14 place-items-center rounded-[20px]" style={{ background: `${pine}22`, color: pine }}><Beer size={24} /></div>}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {COMBOS.map((combo) => (
                <ProductCard
                  key={combo.id}
                  title={combo.name}
                  price={`${Object.entries(combo.items).map(([name, qty]) => `${qty}x ${name}`).join(" | ")} • ${formatCurrency(combo.price)}`}
                  quantity={comboQuantities[combo.id]}
                  onChange={(value) => setComboQuantities((prev) => ({ ...prev, [combo.id]: value }))}
                  icon={Box}
                  accent={pine}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Materiais gastos"
            subtitle="Consumo"
            right={<div className="grid h-14 w-14 place-items-center rounded-[20px]" style={{ background: `${amber}22`, color: amber }}><CookingPot size={24} /></div>}
          >
            <div className="grid gap-3">
              {Object.keys(totalMaterials).length ? (
                Object.entries(totalMaterials).map(([name, qty]) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl border px-4 py-3" style={{ background: barkSoft, borderColor: line }}>
                    <span style={{ color: bone, fontWeight: 700 }}>{name}</span>
                    <span style={{ color: amber, fontWeight: 900 }}>{qty}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border px-4 py-6 text-center" style={{ background: barkSoft, borderColor: line, color: fog }}>
                  Nenhum material calculado ainda.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
