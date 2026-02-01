import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  LogOut, LayoutDashboard, UserPlus, Trash2, Users, DollarSign, 
  TrendingUp, Sun, Moon, Search, Settings, HelpCircle, ShoppingBag, 
  BarChart2, Activity, Palette, Shield, Building, MessageSquare, ExternalLink, Mail,
  Download, CreditCard, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// SADECE jsPDF IMPORT EDİYORUZ, AUTOTABLE'I FONKSİYON İÇİNDE ÇAĞIRACAĞIZ
import jsPDF from 'jspdf';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('Ana Sayfa');
  const [companyName, setCompanyName] = useState('NovaFlow');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [saleProduct, setSaleProduct] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleCustomer, setSaleCustomer] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');

  const navItems = [
    { icon: LayoutDashboard, label: 'Ana Sayfa' },
    { icon: Users, label: 'Müşteriler' },
    { icon: ShoppingBag, label: 'Satışlar' },
    { icon: CreditCard, label: 'Harcamalar' },
    { icon: BarChart2, label: 'Analiz' },
    { icon: Settings, label: 'Ayarlar' },
    { icon: HelpCircle, label: 'Destek' },
  ];

  useEffect(() => {
    const qCust = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsubCust = onSnapshot(qCust, (snap) => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qSales = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsubSales = onSnapshot(qSales, (snap) => setSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qExp = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsubExp = onSnapshot(qExp, (snap) => setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubCust(); unsubSales(); unsubExp(); };
  }, []);

  // PDF İndirme Fonksiyonu (Düzeltildi - Beyaz Ekran Vermez)
  const exportPDF = async () => {
    try {
      const { default: autoTable } = await import('jspdf-autotable');
      const docPdf = new jsPDF();
      
      docPdf.setFontSize(18);
      docPdf.text(`${companyName} - Finansal Rapor`, 14, 20);
      
      const tableData = sales.map(s => [
        String(s.product || "-"), 
        String(s.customer || "-"), 
        `${s.amount || 0}$`
      ]);

      autoTable(docPdf, {
        startY: 30,
        head: [['Ürün/Hizmet', 'Müşteri', 'Tutar']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
      });
      
      docPdf.save(`${companyName}_Finans_Raporu.pdf`);
    } catch (err) {
      console.error("PDF Hatası Detayı:", err);
      alert("PDF modülü yüklenirken hata oluştu.");
    }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    if (!name || !balance) return;
    await addDoc(collection(db, "customers"), { name, balance: parseFloat(balance), notes: '', createdAt: new Date() });
    setName(''); setBalance('');
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    await addDoc(collection(db, "expenses"), { title: expTitle, amount: parseFloat(expAmount), createdAt: new Date() });
    setExpTitle(''); setExpAmount('');
  };

  const addSale = async (e) => {
    e.preventDefault();
    if (!saleProduct || !saleAmount || !saleCustomer) return;
    try {
      await addDoc(collection(db, "sales"), { product: saleProduct, amount: parseFloat(saleAmount), customer: saleCustomer, createdAt: new Date() });
      const target = customers.find(c => c.name === saleCustomer);
      if (target) await updateDoc(doc(db, "customers", target.id), { balance: target.balance + parseFloat(saleAmount) });
      setSaleProduct(''); setSaleAmount(''); setSaleCustomer('');
    } catch (err) { console.error(err); }
  };

  // YENİ: Silme Güvenliği Fonksiyonu
  const handleDeleteCustomer = async (customerId, customerName) => {
    if (window.confirm(`${customerName} isimli müşteriyi silmek istediğinize emin misiniz?`)) {
      await deleteDoc(doc(db, "customers", customerId));
    }
  };

  const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSales = sales.filter(s => s.product?.toLowerCase().includes(searchTerm.toLowerCase()) || s.customer?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExpenses = expenses.filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExp = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netProfit = totalRevenue - totalExp;

  const faqData = [
    { q: "Müşteri bakiyesi nasıl güncellenir?", a: "Satışlar sekmesinden bir işlem yaptığınızda bakiye otomatik artar." }
  ].filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`flex min-h-screen transition-all ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`w-64 flex flex-col p-6 border-r ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex items-center gap-3 mb-12"><LayoutDashboard className="text-indigo-600" /><span className="text-xl font-black italic uppercase">{companyName}</span></div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item, i) => (
            <button key={i} onClick={() => setActiveTab(item.label)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm ${activeTab === item.label ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-indigo-500/10'}`}><item.icon size={18} /> {item.label}</button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto custom-scrollbar text-left">
        <div className="flex justify-between items-center mb-10 text-left">
          <div className="relative w-64 text-left"><Search className="absolute left-4 top-3 text-slate-500" size={18} /><input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full py-2 pl-12 pr-4 rounded-xl border outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black'}`} /></div>
          <div className="flex gap-4"><button onClick={() => setIsDark(!isDark)} className="p-3 bg-slate-800 rounded-xl"><Sun size={20}/></button><button onClick={logout} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><LogOut size={20}/></button></div>
        </div>

        {activeTab === 'Ana Sayfa' && (
          <div className="space-y-10 text-left">
            <div className="grid grid-cols-4 gap-6 text-left">
              <StatCard icon={Users} label="Müşteriler" value={filteredCustomers.length} color="indigo" />
              <StatCard icon={TrendingUp} label="Ciro" value={`$${totalRevenue.toLocaleString()}`} color="emerald" />
              <StatCard icon={CreditCard} label="Giderler" value={`$${totalExp.toLocaleString()}`} color="rose" />
              <StatCard icon={DollarSign} label="Net Kar" value={`$${netProfit.toLocaleString()}`} color="indigo" primary />
            </div>
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} h-[400px] relative`}>
               <h2 className="text-xl font-black italic uppercase mb-8 text-indigo-500 text-left">Performans Analizi</h2>
               {/* YENİ: Boş Veri Kontrolü */}
               {filteredCustomers.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredCustomers}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="balance" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-500 font-bold italic uppercase tracking-widest">Henüz veri girişi yapılmadı</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'Müşteriler' && (
          <div className="grid grid-cols-3 gap-8 text-left">
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
               <h2 className="text-xl font-black italic mb-8 uppercase text-left">Yeni Kayıt</h2>
               <form onSubmit={addCustomer} className="space-y-4">
                  <Input placeholder="Müşteri Adı" value={name} onChange={setName} isDark={isDark} />
                  <Input placeholder="Bakiye" type="number" value={balance} onChange={setBalance} isDark={isDark} />
                  <button className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase shadow-xl">Kaydet</button>
               </form>
            </div>
            <div className="col-span-2 space-y-4 text-left">
               {filteredCustomers.map(c => (
                 <div key={c.id} className={`flex justify-between items-center p-6 rounded-3xl border ${isDark ? 'bg-slate-800/20 border-slate-800/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div onClick={() => { setSelectedCustomer(c); setCustomerNote(c.notes || ''); }} className="cursor-pointer flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 font-black italic">{c.name[0]}</div>
                      <div className="text-left"><p className="font-black uppercase text-sm">{c.name}</p><p className="text-xs font-bold text-slate-500 italic text-[10px]">Notlar için tıkla • ${c.balance}</p></div>
                    </div>
                    {/* GÜNCELLENDİ: Silme onayı eklendi */}
                    <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'Satışlar' && (
          <div className="grid grid-cols-4 gap-8 text-left">
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
               <h2 className="text-xl font-black italic mb-8 uppercase text-left">Satış Yap</h2>
               <form onSubmit={addSale} className="space-y-4">
                  <select value={saleCustomer} onChange={(e) => setSaleCustomer(e.target.value)} className={`w-full p-4 rounded-2xl border font-bold outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                    <option value="">Müşteri Seçin</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <Input placeholder="Hizmet" value={saleProduct} onChange={setSaleProduct} isDark={isDark} />
                  <Input placeholder="Tutar" type="number" value={saleAmount} onChange={setSaleAmount} isDark={isDark} />
                  <button className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase text-white shadow-xl">Onayla</button>
               </form>
            </div>
            <div className="col-span-3 p-8 rounded-[2.5rem] border bg-slate-900/10 border-slate-800 text-left">
               <h2 className="text-xl font-black italic mb-8 uppercase text-left">İşlem Geçmişi</h2>
               <table className="w-full text-left">
                  <thead><tr className="text-slate-500 text-[10px] uppercase font-black border-b border-slate-800/50 text-left"><th className="pb-4">Ürün</th><th className="pb-4 text-left">Müşteri</th><th className="pb-4 text-right">Tutar</th></tr></thead>
                  <tbody className="text-left">{filteredSales.map(s => (<tr key={s.id} className="border-b border-slate-800/10 text-left"><td className="py-4 font-bold italic">{s.product}</td><td className="py-4 uppercase text-xs text-indigo-400 font-black">{s.customer}</td><td className="py-4 text-right font-black text-emerald-500">+{s.amount}$</td></tr>))}</tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'Harcamalar' && (
          <div className="grid grid-cols-3 gap-8 text-left">
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
               <h2 className="text-xl font-black italic mb-8 uppercase text-left">Gider Ekle</h2>
               <form onSubmit={addExpense} className="space-y-4">
                  <Input placeholder="Gider Adı" value={expTitle} onChange={setExpTitle} isDark={isDark} />
                  <Input placeholder="Tutar" type="number" value={expAmount} onChange={setExpAmount} isDark={isDark} />
                  <button className="w-full bg-rose-500 py-4 rounded-2xl font-black uppercase text-white shadow-xl">Kaydet</button>
               </form>
            </div>
            <div className="col-span-2 space-y-4 text-left">{filteredExpenses.map(e => (<div key={e.id} className="flex justify-between p-6 bg-slate-800/20 rounded-3xl border border-slate-800/30 text-left"><span className="font-bold italic uppercase">{e.title}</span><span className="font-black text-rose-500">-${e.amount}</span></div>))}</div>
          </div>
        )}

        {activeTab === 'Analiz' && (
          <div className="space-y-10 text-center">
            <button onClick={exportPDF} className="flex items-center gap-3 px-10 py-5 bg-indigo-600 mx-auto rounded-3xl font-black italic uppercase shadow-2xl hover:scale-105 transition-all text-white"><Download size={24}/> Finansal PDF Raporu İndir</button>
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} relative`}>
                <h3 className="text-xl font-black italic uppercase mb-10 flex items-center justify-center gap-2"><Activity className="text-indigo-500"/> Gelir/Gider Oranı</h3>
                {/* YENİ: Boş Veri Kontrolü (PieChart) */}
                {totalRevenue > 0 || totalExp > 0 ? (
                  <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: 'Gelir', value: totalRevenue || 1 }, { name: 'Gider', value: totalExp || 0 }]} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={5}><Cell fill="#4f46e5" /><Cell fill="#f43f5e" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-slate-500 font-bold italic uppercase tracking-widest">Henüz veri girişi yapılmadı</p>
                  </div>
                )}
              </div>
              <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} text-left`}>
                <h3 className="text-xl font-black italic uppercase mb-10 text-center uppercase">Net Karlılık</h3>
                <div className="space-y-6">
                   <div className="p-5 bg-indigo-600/10 rounded-2xl flex justify-between font-bold text-left"><span>Ciro:</span><span>${totalRevenue}</span></div>
                   <div className="p-5 bg-rose-500/10 rounded-2xl flex justify-between font-bold text-left"><span>Gider:</span><span>${totalExp}</span></div>
                   <div className="p-6 bg-emerald-500/10 rounded-2xl flex justify-between font-black text-2xl text-emerald-500 italic text-left"><span>NET KAR:</span><span>${netProfit}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Ayarlar' && (
          <div className="max-w-2xl mx-auto space-y-8 text-left">
            <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <h2 className="text-xl font-black italic uppercase mb-10 flex items-center gap-3 text-left"><Building className="text-indigo-500" /> Şirket Profilini Düzenle</h2>
              <div className="space-y-8 text-left">
                <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">Uygulama Adı</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={`w-full p-5 mt-2 rounded-2xl border outline-none font-bold ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'}`} /></div>
                <div className="grid grid-cols-2 gap-5 text-left">
                   <button onClick={() => setIsDark(!isDark)} className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase shadow-xl active:scale-95 transition-all"><Palette size={18}/> Temayı Değiştir</button>
                   <button onClick={() => alert("Güvenlik protokolleri aktif.")} className="flex items-center justify-center gap-3 p-5 rounded-2xl border border-slate-700 text-slate-500 font-black text-xs uppercase shadow-xl transition-all"><Shield size={18}/> Güvenlik</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Destek' && (
          <div className="space-y-10 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <SupportCard icon={MessageSquare} title="WhatsApp" desc="Canlı destek alın." link="https://wa.me/905000000000" color="emerald" />
              <SupportCard icon={Mail} title="E-Posta" desc="Destek talebi iletin." link="mailto:support@novaflow.com" color="indigo" />
              <SupportCard icon={ExternalLink} title="Rehber" desc="Kullanım kılavuzu." link="#" color="purple" />
            </div>
            <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <h3 className="text-xl font-black italic uppercase mb-8 text-left uppercase">Sıkça Sorulan Sorular</h3>
              <div className="space-y-5 text-left">{faqData.length > 0 ? faqData.map((f, i) => (<div key={i} className="p-5 bg-slate-800/20 rounded-3xl border border-slate-800/30 text-left"><p className="font-black italic text-sm text-indigo-400">Q: {f.q}</p><p className="text-xs text-slate-500 font-bold mt-2">A: {f.a}</p></div>)) : <p>Sonuç bulunamadı.</p>}</div>
            </div>
          </div>
        )}

        {/* Modal: Notlar */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className={`w-full max-w-lg rounded-[3rem] p-10 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-8 text-left"><h2 className="text-2xl font-black italic uppercase">{selectedCustomer.name}</h2><button onClick={() => setSelectedCustomer(null)}><X size={28}/></button></div>
              <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} className={`w-full h-48 p-5 rounded-3xl border outline-none font-bold resize-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'}`} placeholder="Not yazın..." />
              <button onClick={async () => { await updateDoc(doc(db, "customers", selectedCustomer.id), { notes: customerNote }); setSelectedCustomer(null); }} className="w-full bg-indigo-600 py-5 mt-8 rounded-3xl font-black uppercase italic text-white shadow-2xl active:scale-95 transition-all">Notu Kaydet</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// YARDIMCI BİLEŞENLER
const SupportCard = ({ icon: Icon, title, desc, link, color }) => (
  <a href={link} target="_blank" rel="noreferrer" className={`p-10 rounded-[3rem] bg-slate-900/40 border border-slate-800 hover:border-indigo-500 transition-all group text-left`}>
    <Icon className={`text-${color}-500 mb-6 group-hover:scale-110 transition-transform`} size={40} />
    <h4 className="font-black italic uppercase text-lg mb-2">{title}</h4>
    <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
  </a>
);

const StatCard = ({ icon: Icon, label, value, color, primary }) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden text-left ${primary ? 'bg-indigo-600 border-indigo-500 shadow-2xl text-white' : 'bg-slate-900/40 border-slate-800 shadow-lg'}`}>
    <Icon className={`mb-4 text-${color}-500`} size={32} />
    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-left">{label}</p>
    <h3 className="text-3xl font-black italic tracking-tighter mt-1 text-left">{value}</h3>
  </div>
);

const Input = ({ placeholder, type = "text", value, onChange, isDark }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`w-full p-5 rounded-2xl border outline-none font-bold ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'}`} />
);

export default Dashboard;