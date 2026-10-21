import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, CircleHelp,
  Coffee, Command, CreditCard, Download, Edit2, Filter, Home, IndianRupee,
  LayoutDashboard, ListFilter, MoreHorizontal, Plus, Search, Settings2,
  ShoppingBag, Sparkles, Trash2, TrendingDown, Wallet, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

const STORAGE_KEY = "pocket-expenses-v1";
const palette = ["#9be870", "#8b9bff", "#f7b267", "#f08b9c", "#67d9d0", "#c7a5ff", "#f5dc75", "#7db8f5"];
const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2
}).format(n || 0);
const localDateKey = (date = new Date()) => {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const parseEntry = (raw) => {
  const match = raw.trim().match(/^(.+?)\s*(?::|=|-)\s*₹?\s*(\d+(?:\.\d{1,2})?)\s*$/);
  if (!match) return null;
  const name = match[1].trim().replace(/\s+/g, " ");
  const amount = Number(match[2]);
  if (!name || !Number.isFinite(amount) || amount <= 0) return null;
  return { name, amount };
};
const categoryIcon = (name) => {
  const s = name.toLowerCase();
  if (/milk|grocery|vegetable|fruit|food|snack|bread|rice/.test(s)) return ShoppingBag;
  if (/chai|tea|coffee/.test(s)) return Coffee;
  if (/rent|home|electric|bill/.test(s)) return Home;
  return CreditCard;
};
const seedData = () => {
  const now = new Date();
  const ago = (days, hour = 12) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days); d.setHours(hour, 15, 0, 0);
    return d.toISOString();
  };
  return [
    { id: crypto.randomUUID(), name: "Milk", amount: 40, createdAt: ago(0, 9) },
    { id: crypto.randomUUID(), name: "Chai", amount: 20, createdAt: ago(0, 10) },
    { id: crypto.randomUUID(), name: "Groceries", amount: 350, createdAt: ago(1, 18) },
    { id: crypto.randomUUID(), name: "Petrol", amount: 500, createdAt: ago(2, 17) },
    { id: crypto.randomUUID(), name: "Milk", amount: 40, createdAt: ago(3, 8) },
    { id: crypto.randomUUID(), name: "Lunch", amount: 180, createdAt: ago(4, 13) },
    { id: crypto.randomUUID(), name: "Uber", amount: 145, createdAt: ago(5, 20) },
    { id: crypto.randomUUID(), name: "Coffee", amount: 120, createdAt: ago(6, 11) },
  ];
};

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === null ? [] : JSON.parse(saved);
    } catch { return []; }
  });
  const [entry, setEntry] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(monthKey());
  const [activeNav, setActiveNav] = useState("Overview");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const currentMonthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(new Date(t.createdAt)) === selectedMonth),
    [transactions, selectedMonth]
  );
  const todayTransactions = useMemo(
    () => transactions.filter((t) => localDateKey(new Date(t.createdAt)) === localDateKey()),
    [transactions]
  );
  const totalThisMonth = currentMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalToday = todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const categoryData = useMemo(() => {
    const grouped = new Map();
    currentMonthTransactions.forEach((t) => {
      const key = t.name.trim().toLowerCase();
      const old = grouped.get(key) || { name: t.name, amount: 0, count: 0 };
      old.amount += Number(t.amount); old.count += 1;
      grouped.set(key, old);
    });
    return [...grouped.values()].sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions]);

  const chartData = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const byDay = new Map();
    currentMonthTransactions.forEach((t) => {
      const d = new Date(t.createdAt).getDate();
      byDay.set(d, (byDay.get(d) || 0) + Number(t.amount));
    });
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1, label: `${i + 1}`, amount: byDay.get(i + 1) || 0
    }));
  }, [currentMonthTransactions, selectedMonth]);

  const filteredHistory = useMemo(() => {
    const base = period === "today" ? todayTransactions : period === "month" ? currentMonthTransactions : transactions;
    const term = query.trim().toLowerCase();
    return [...base]
      .filter((t) => !term || t.name.toLowerCase().includes(term) || String(t.amount).includes(term))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions, currentMonthTransactions, todayTransactions, period, query]);
  const visibleHistory = showAll ? filteredHistory : filteredHistory.slice(0, 6);

  const addExpense = (event) => {
    event?.preventDefault();
    const parsed = parseEntry(entry);
    const normalizeCategoryKey = (name) =>
        name.trim().replace(/\s+/g, " ").toLowerCase();

    const formatCategoryName = (name) => {
      const clean = name.trim().replace(/\s+/g, " ");
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    };
    if (!parsed) {
      setNotice("Try this format: milk : 40");
      inputRef.current?.focus();
      return;
    }
    setTransactions((old) => {
      const existingCategory = old.find(
          (t) =>
              normalizeCategoryKey(t.name) ===
              normalizeCategoryKey(parsed.name)
      );

      const categoryName = existingCategory
          ? existingCategory.name
          : formatCategoryName(parsed.name);

      return [
        {
          id: crypto.randomUUID(),
          name: categoryName,
          amount: parsed.amount,
          createdAt: new Date().toISOString(),
        },
        ...old,
      ];
    });
    setEntry("");
    setNotice(`${parsed.name} · ${money(parsed.amount)} added`);
    inputRef.current?.focus();
    window.setTimeout(() => setNotice(""), 2600);
  };

  const removeExpense = (id) => {
    if (window.confirm("Delete this expense from your history?")) {
      setTransactions((old) => old.filter((t) => t.id !== id));
    }
  };
  const startEdit = (t) => {
    setEditing(t.id); setEditName(t.name); setEditAmount(String(t.amount));
  };
  const saveEdit = (event) => {
    event.preventDefault();
    const name = editName.trim();
    const amount = Number(editAmount);
    if (!name || !Number.isFinite(amount) || amount <= 0) return;
    setTransactions((old) => old.map((t) => t.id === editing ? { ...t, name: name.charAt(0).toUpperCase() + name.slice(1), amount } : t));
    setEditing(null);
  };
  const exportCsv = () => {
    const rows = [["Category", "Amount (INR)", "Date", "Time"], ...[...transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((t) => [t.name, t.amount, new Date(t.createdAt).toLocaleDateString("en-IN"), new Date(t.createdAt).toLocaleTimeString("en-IN")])];
    const csv = rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = `pocket-expenses-${localDateKey()}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const changeMonth = (offset) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    setSelectedMonth(monthKey(d));
  };
  const monthLabel = new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)) - 1, 1)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Wallet size={21} /></div><span>Pocket<span className="brand-dot">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className={`nav-item ${activeNav === "Overview" ? "active" : ""}`} onClick={() => setActiveNav("Overview")}><LayoutDashboard size={18}/><span>Overview</span></button>
          <button className={`nav-item ${activeNav === "Transactions" ? "active" : ""}`} onClick={() => {setActiveNav("Transactions"); document.getElementById("history")?.scrollIntoView({behavior:"smooth"});}}><ListFilter size={18}/><span>Transactions</span><span className="nav-count">{transactions.length}</span></button>
          <button className={`nav-item ${activeNav === "Categories" ? "active" : ""}`} onClick={() => {setActiveNav("Categories"); document.getElementById("categories")?.scrollIntoView({behavior:"smooth"});}}><ShoppingBag size={18}/><span>Categories</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card"><div className="tip-icon"><Sparkles size={16}/></div><strong>Quick tip</strong><p>Just type <code>milk : 40</code> and hit Enter. That’s it.</p></div>
          <div className="profile-row"><div className="avatar">Y</div><div className="profile-copy"><strong>Your wallet</strong><span>Personal account</span></div><MoreHorizontal size={18} className="muted"/></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-right"><div className="local-badge"><span className="live-dot"></span> Saved locally</div><button className="icon-button" title="Export all expenses as CSV" onClick={exportCsv}><Download size={17}/></button><div className="avatar small">Y</div></div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-line"></span> YOUR MONEY, IN ORDER</div><h1>Good evening<span className="title-period">.</span></h1><p className="subheading">A little clarity goes a long way. Here’s your spending at a glance.</p></div>
            <div className="date-pill"><CalendarDays size={16}/>{new Date().toLocaleDateString("en-IN", {weekday:"short", day:"numeric", month:"short", year:"numeric"})}</div>
          </section>

          <section className="quick-entry-card">
            <div className="quick-entry-top"><div className="entry-symbol"><Zap size={18}/></div><div><h2>Quick entry</h2><p>Type it like you’d tell a friend.</p></div><div className="enter-hint"><Command size={12}/> <span>ENTER</span></div></div>
            <form onSubmit={addExpense} className="entry-form">
              <div className="entry-prefix"><Plus size={19}/></div>
              <input ref={inputRef} value={entry} onChange={(e)=>setEntry(e.target.value)} placeholder="e.g. milk : 40, coffee : 120, uber : 180" aria-label="Expense quick entry" />
              <button className="add-button" type="submit">Add expense <ArrowUpRight size={16}/></button>
            </form>
            <div className="entry-bottom"><span><span className="mini-green-dot"></span> New categories are created automatically</span>{notice && <span className="notice"><Check size={13}/>{notice}</span>}<span className="format-note">Name : Amount</span></div>
          </section>

          <section className="stats-grid">
            <div className="stat-card primary-stat"><div className="stat-top"><span>Total this month</span><div className="stat-icon green"><IndianRupee size={17}/></div></div><div className="stat-number">{money(totalThisMonth)}</div><div className="stat-foot"><span className="stat-caption">{currentMonthTransactions.length} transactions</span><span className="stat-period"><CalendarDays size={12}/>{monthLabel}</span></div><div className="stat-decoration"></div></div>
            <div className="stat-card"><div className="stat-top"><span>Spent today</span><div className="stat-icon blue"><TrendingDown size={17}/></div></div><div className="stat-number">{money(totalToday)}</div><div className="stat-foot"><span className="stat-caption">{todayTransactions.length} entries today</span><span className="small-pill">Today</span></div></div>
            <div className="stat-card"><div className="stat-top"><span>Categories</span><div className="stat-icon orange"><ShoppingBag size={17}/></div></div><div className="stat-number">{categoryData.length}</div><div className="stat-foot"><span className="stat-caption">Used this month</span><span className="small-pill">Auto-sorted</span></div></div>
          </section>

          <section className="charts-grid">
            <div className="panel spending-panel">
              <div className="panel-heading"><div><h2>Spending overview</h2><p>Daily spend through the month</p></div><div className="month-switch"><button onClick={()=>changeMonth(-1)} aria-label="Previous month">‹</button><span>{monthLabel}</span><button onClick={()=>changeMonth(1)} aria-label="Next month">›</button></div></div>
              <div className="chart-summary"><strong>{money(totalThisMonth)}</strong><span><span className="chart-dot"></span> Total recorded</span></div>
              <div className="area-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:12,right:8,left:-18,bottom:0}}><defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9be870" stopOpacity={0.25}/><stop offset="95%" stopColor="#9be870" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#252932" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" tick={{fill:"#747b89",fontSize:11}} axisLine={false} tickLine={false} interval={Math.max(0,Math.floor(chartData.length/7)-1)} tickFormatter={(v)=>`${v}`}/><YAxis tick={{fill:"#747b89",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={(v)=>v>=1000?`${(v/1000).toFixed(1)}k`:v}/><Tooltip contentStyle={{background:"#171a22",border:"1px solid #303540",borderRadius:10,color:"#f4f5f7",fontSize:12}} formatter={(v)=>[money(v),"Spent"]} labelFormatter={(v)=>`${monthLabel.split(" ")[0]} ${v}`}/><Area type="monotone" dataKey="amount" stroke="#9be870" strokeWidth={2.5} fill="url(#spendFill)" activeDot={{r:4,fill:"#9be870",stroke:"#10130f",strokeWidth:2}}/></AreaChart></ResponsiveContainer></div>
              <div className="chart-foot"><span><span className="chart-dot"></span>Daily expenses</span><span>Amounts in INR</span></div>
            </div>

            <div className="panel categories-panel" id="categories">
              <div className="panel-heading"><div><h2>Categories</h2><p>Where your money goes</p></div><button className="more-button" onClick={()=>{setActiveNav("Categories");setPeriod("month");}}><MoreHorizontal size={19}/></button></div>
              {categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData.slice(0,8)} dataKey="amount" nameKey="name" innerRadius={64} outerRadius={88} paddingAngle={3} stroke="none">{categoryData.slice(0,8).map((item,index)=><Cell key={item.name} fill={palette[index%palette.length]}/>)}</Pie><Tooltip contentStyle={{background:"#171a22",border:"1px solid #303540",borderRadius:10,color:"#f4f5f7",fontSize:12}} formatter={(v)=>[money(v),"Spent"]}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(totalThisMonth)}</strong><span>THIS MONTH</span></div></div><div className="category-legend">{categoryData.slice(0,5).map((item,index)=><div className="legend-row" key={item.name}><span className="legend-name"><span className="legend-dot" style={{background:palette[index%palette.length]}}></span>{item.name}</span><strong>{money(item.amount)}</strong></div>)}</div></> : <div className="empty-chart"><div className="empty-icon"><ShoppingBag size={22}/></div><strong>Your categories will show up here</strong><span>Add your first expense above.</span></div>}
            </div>
          </section>

          <section className="panel history-panel" id="history">
            <div className="history-header"><div><div className="history-title-line"><h2>Recent transactions</h2><span className="count-badge">{filteredHistory.length}</span></div><p>Your expense history, one entry at a time.</p></div><div className="history-actions"><div className="search-box"><Search size={15}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search expenses..." /></div><select className="filter-select" value={period} onChange={(e)=>{setPeriod(e.target.value);setShowAll(false);}} aria-label="Filter history"><option value="today">Today</option><option value="month">This month</option><option value="all">All time</option></select><button className="export-button" onClick={exportCsv}><Download size={14}/><span>Export</span></button></div></div>
            <div className="transaction-table">
              <div className="table-head"><span>TRANSACTION</span><span>DATE & TIME</span><span>AMOUNT</span><span>ACTIONS</span></div>
              {visibleHistory.length ? visibleHistory.map((t,index)=>{const Icon=categoryIcon(t.name);const date=new Date(t.createdAt);return <div className="transaction-row" key={t.id}><div className="transaction-name"><div className={`transaction-icon icon-${index%5}`}><Icon size={17}/></div><div><strong>{t.name}</strong><span>Expense</span></div></div><div className="transaction-date"><strong>{localDateKey(date)===localDateKey()?"Today":date.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</strong><span>{date.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span></div><div className="transaction-amount">− {money(t.amount)}</div><div className="row-actions"><button title="Edit transaction" onClick={()=>startEdit(t)}><Edit2 size={14}/></button><button title="Delete transaction" onClick={()=>removeExpense(t.id)}><Trash2 size={14}/></button></div></div>}) : <div className="empty-history"><div className="empty-icon"><ArrowDownLeft size={21}/></div><strong>No expenses found</strong><span>Add an expense above or change your filter.</span></div>}
            </div>
            {filteredHistory.length>6 && <button className="view-all-button" onClick={()=>setShowAll((v)=>!v)}>{showAll?"Show less":"View all transactions"} <ChevronDown size={14} className={showAll?"rotate-up":""}/></button>}
            <div className="history-footer"><span><span className="mini-green-dot"></span> All changes are saved on this device</span><span>{transactions.length} total entries</span></div>
          </section>
          <footer className="app-footer"><span>Made for your everyday money.</span><span><span className="footer-dot"></span> Private by design · Stored in your browser</span></footer>
        </div>
      </main>

      {editing && <div className="modal-backdrop" onClick={()=>setEditing(null)}><form className="edit-modal" onSubmit={saveEdit} onClick={(e)=>e.stopPropagation()}><div className="modal-head"><div><h2>Edit transaction</h2><p>Update the category or amount.</p></div><button type="button" className="icon-button" onClick={()=>setEditing(null)}><X size={17}/></button></div><label>Category<input value={editName} onChange={(e)=>setEditName(e.target.value)} autoFocus required/></label><label>Amount (₹)<input type="number" min="0.01" step="0.01" value={editAmount} onChange={(e)=>setEditAmount(e.target.value)} required/></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={()=>setEditing(null)}>Cancel</button><button type="submit" className="add-button">Save changes <Check size={15}/></button></div></form></div>}
    </div>
  );
}