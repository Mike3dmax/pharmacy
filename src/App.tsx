import React from 'react';
import { 
  BarChart3, 
  Package, 
  FileText, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  AlertCircle,
  TrendingUp,
  User,
  ShoppingBag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';

import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { ViewType } from './types';
import { auth, signIn, logOut, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import Auth from './components/Auth';
import { Medicine, ViewType } from './types';

const SALES_DATA = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

// --- Components ---

const Sidebar = ({ activeView, onViewChange, user }: { activeView: ViewType, onViewChange: (v: ViewType) => void, user: FirebaseUser | null }) => {
  const items = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'prescriptions', icon: FileText, label: 'Prescriptions' },
    { id: 'sales', icon: ShoppingBag, label: 'Sales' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-natural-sidebar h-screen flex flex-col fixed left-0 top-0 border-r border-natural-border">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-natural-accent rounded-xl flex items-center justify-center shadow-lg shadow-natural-accent/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-serif italic text-xl font-bold tracking-tight text-natural-text-heading">PharmaLink</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm",
              activeView === item.id 
                ? "bg-natural-accent/10 text-natural-accent" 
                : "text-natural-text-muted hover:bg-natural-accent/5 hover:text-natural-text-heading"
            )}
          >
            {activeView === item.id && <div className="w-1.5 h-1.5 rounded-full bg-natural-accent" />}
            <item.icon size={18} className={activeView === item.id ? "hidden" : ""} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-white/50 p-4 rounded-3xl border border-natural-border mb-6">
          <div className="text-[10px] uppercase tracking-wider text-natural-text-label mb-1 font-bold">System Status</div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-natural-accent">Sync Active</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-natural-accent/10 flex items-center justify-center text-natural-accent border border-natural-accent/20">
              <User size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-natural-text-heading truncate">{user.displayName || user.email}</p>
              <button 
                onClick={logOut}
                className="text-[10px] text-natural-text-muted hover:text-red-600 flex items-center gap-1 uppercase tracking-wider font-bold transition-colors"
              >
                <LogOut size={10} /> Logout
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={signIn}
            className="w-full bg-natural-accent hover:opacity-90 text-white rounded-2xl py-3 text-sm font-bold transition-all shadow-md shadow-natural-accent/10"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, trend, icon: Icon, color, highlight }: any) => (
  <div className={cn(
    "p-6 rounded-[32px] flex flex-col justify-between h-36 transition-all border",
    highlight 
      ? "bg-natural-accent text-white border-transparent shadow-xl shadow-natural-accent/20" 
      : "bg-natural-card border-natural-border text-natural-text-main hover:shadow-lg hover:shadow-natural-accent/5"
  )}>
    <div className="flex justify-between items-start">
      <span className={cn(
        "text-[10px] uppercase tracking-widest font-bold",
        highlight ? "text-white/70" : "text-natural-text-label"
      )}>
        {title}
      </span>
      <div className={cn(
        "p-2 rounded-xl",
        highlight ? "bg-white/10" : "bg-white border border-natural-border"
      )}>
        <Icon size={16} className={highlight ? "text-white" : "text-natural-accent"} />
      </div>
    </div>
    
    <div className="flex items-baseline gap-2 mt-auto">
      <h3 className={cn("text-3xl font-serif italic", highlight ? "text-white" : "text-natural-text-heading")}>{value}</h3>
      {trend !== undefined && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full",
          highlight 
            ? "bg-white/20 text-white" 
            : (trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")
        )}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = React.useState<ViewType>('dashboard');
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Real Data State
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Computed Stats
  const stats = React.useMemo(() => {
    const totalItems = medicines.reduce((acc, curr) => acc + curr.stock, 0);
    const lowStockCount = medicines.filter(m => m.stock <= m.minThreshold).length;
    const inventoryValue = medicines.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);

    const categoryData = medicines.reduce((acc: any[], curr) => {
      const existing = acc.find(a => a.name === curr.category);
      if (existing) existing.value += curr.stock;
      else acc.push({ name: curr.category, value: curr.stock, color: '#5a5a40' });
      return acc;
    }, []);

    return { totalItems, lowStockCount, inventoryValue, categoryData };
  }, [medicines]);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Fetch Medicines
  React.useEffect(() => {
    if (!user) return;
    
    const path = 'medicines';
    const q = query(collection(db, path), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(meds);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, path)
    );

    return () => unsubscribe();
  }, [user]);

  const handleAddMedicine = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const path = 'medicines';
    
    try {
      const newMed = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        stock: Number(formData.get('stock')),
        price: Number(formData.get('price')),
        minThreshold: Number(formData.get('minThreshold')),
        manufacturer: formData.get('manufacturer') as string,
        expiryDate: formData.get('expiryDate') as string,
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, path), newMed);
      setShowAddModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-natural-bg">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-natural-accent/20 rounded-full"></div>
            <div className="w-16 h-16 border-t-2 border-natural-accent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h1 className="font-serif italic text-2xl text-natural-text-heading animate-pulse">PharmaLink</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-natural-text-label mt-2">Harmonizing Healthcare</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text-main flex font-sans selection:bg-natural-accent/10 selection:text-natural-accent">
      <Sidebar activeView={activeView} onViewChange={setActiveView} user={user} />
      
      <main className="flex-1 ml-64 p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif italic text-natural-text-heading capitalize mb-2">
              {activeView} Overview
            </h2>
            <p className="text-sm text-natural-text-muted">
              Good morning, {user?.displayName?.split(' ')[0] || 'Doctor'}. Here is your pharmacy status.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text-label group-focus-within:text-natural-accent transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-natural-sidebar border-none rounded-full pl-12 pr-6 py-3 text-sm w-72 focus:ring-1 focus:ring-natural-accent transition-all placeholder:text-natural-text-label/50"
              />
            </div>
            <button 
              onClick={() => {
                if (activeView === 'inventory') setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-natural-accent text-white px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-natural-accent/20"
            >
              <Plus size={16} /> {activeView === 'inventory' ? 'Add Medicine' : 'New Transaction'}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeView === 'dashboard' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard title="Inventory Value" value={`$${stats.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} trend={12.5} icon={TrendingUp} color="#5a5a40" />
                  <MetricCard title="Active Prescriptions" value="156" trend={-2.4} icon={FileText} color="#5a5a40" />
                  <MetricCard title="Low Stock Alerts" value={stats.lowStockCount.toString().padStart(2, '0')} highlight icon={AlertCircle} color="#5a5a40" />
                  <MetricCard title="Total Inventory" value={stats.totalItems.toLocaleString()} trend={18.0} icon={Package} color="#5a5a40" />
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] border border-natural-border shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-xl font-serif italic text-natural-text-heading">Revenue Growth</h4>
                      <div className="flex gap-2">
                        <button className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-natural-sidebar rounded-full text-natural-text-muted">7D</button>
                        <button className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-natural-accent text-white rounded-full">30D</button>
                      </div>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={SALES_DATA}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#5a5a40" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#5a5a40" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f1eb" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#9a9a8c' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#9a9a8c' }}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: '1px solid #e5e4dc', 
                              boxShadow: '0 10px 40px -10px rgba(90,90,64,0.1)', 
                              fontSize: '12px',
                              backgroundColor: '#fdfcf9'
                            }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#5a5a40" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-natural-sidebar p-10 rounded-[40px] border border-natural-border flex flex-col h-full">
                      <h4 className="text-xl font-serif italic text-natural-text-heading mb-8">Stock Categories</h4>
                      <div className="h-[220px] w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.categoryData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Tooltip 
                              cursor={{ fill: 'rgba(90,90,64,0.05)' }}
                              contentStyle={{ 
                                backgroundColor: '#fdfcf9', 
                                border: '1px solid #e5e4dc', 
                                borderRadius: '12px',
                                fontSize: '10px' 
                              }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={24}>
                              {stats.categoryData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#5a5a40' : '#e5e4dc'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4 flex-1">
                        {stats.categoryData.map((item, idx) => (
                          <div key={item.name} className="flex justify-between items-center group cursor-default">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-2 h-2 rounded-full", idx === 0 ? "bg-natural-accent scale-125" : "bg-natural-border group-hover:bg-natural-text-label transition-colors")} />
                              <span className="text-xs text-natural-text-muted font-bold uppercase tracking-widest">{item.name}</span>
                            </div>
                            <span className="text-xs font-serif italic text-natural-text-heading">{item.value} units</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-8 border-t border-natural-border">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-natural-text-label font-bold">Peak Hours</span>
                          <span className="text-xs font-bold text-natural-accent">11:00 AM - 2:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'inventory' && (
              <div className="bg-white rounded-[40px] border border-natural-border shadow-sm overflow-hidden p-8">
                <div className="mb-8 flex justify-between items-center px-2">
                  <h3 className="text-2xl font-serif italic text-natural-text-heading">Stock Management</h3>
                  <div className="flex gap-3">
                    <button className="px-5 py-2 text-xs font-bold uppercase tracking-widest border border-natural-border rounded-full hover:bg-natural-sidebar transition-colors">Export CSV</button>
                    <button className="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-natural-sidebar rounded-full text-natural-accent">Filter View</button>
                  </div>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest font-bold text-natural-text-label border-b border-natural-sidebar">
                      <th className="px-6 py-6">Product Details</th>
                      <th className="px-6 py-6">Classification</th>
                      <th className="px-6 py-6">Availability</th>
                      <th className="px-6 py-6">Unit Price</th>
                      <th className="px-6 py-6">Status</th>
                      <th className="px-6 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-sidebar">
                    {medicines.length > 0 ? medicines.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-natural-sidebar/30 transition-colors group">
                        <td className="px-6 py-8">
                          <p className="text-base font-bold text-natural-text-heading mb-0.5">{item.name}</p>
                          <p className="text-[10px] text-natural-text-label font-mono uppercase tracking-tighter">ID: {item.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-8">
                          <span className="text-[10px] font-bold px-3 py-1 bg-natural-sidebar rounded-full text-natural-accent uppercase tracking-widest">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-8">
                          <p className="text-sm font-serif italic text-natural-text-heading">{item.stock} units</p>
                        </td>
                        <td className="px-6 py-8 text-sm font-bold text-natural-text-main">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-8">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            item.stock > item.minThreshold ? 'bg-[#f2f1eb] text-[#5a5a40]' : 'bg-red-50 text-red-600 animate-pulse'
                          )}>
                            {item.stock > item.minThreshold ? 'Optimal' : 'Low Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-8 text-right">
                          <button className="text-natural-accent font-bold text-[10px] uppercase tracking-widest underline underline-offset-4 decoration-2">Manage</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-natural-text-label">
                            <Package size={40} className="opacity-10" />
                            <p className="text-sm font-serif italic">Your inventory is currently empty.</p>
                            <button 
                              onClick={() => setShowAddModal(true)}
                              className="text-xs font-bold text-natural-accent underline underline-offset-4"
                            >
                              Add your first medicine
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <div className="bg-natural-sidebar p-10 rounded-[40px] border border-natural-border sticky top-12">
                    <div className="w-24 h-24 bg-white rounded-3xl border border-natural-border flex items-center justify-center mb-6 shadow-sm overflow-hidden">
                      <User size={48} className="text-natural-accent/20" />
                    </div>
                    <h3 className="text-2xl font-serif italic text-natural-text-heading mb-2">Pharmacy Profile</h3>
                    <p className="text-xs text-natural-text-muted leading-relaxed mb-8">
                      Manage your establishment's public information and regulatory compliance details.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-natural-border rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-natural-sidebar rounded-xl flex items-center justify-center border border-natural-border">
                          <FileText size={18} className="text-natural-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-natural-text-label">Compliance</p>
                          <p className="text-xs font-bold text-natural-text-heading">Status: Certified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white p-12 rounded-[40px] border border-natural-border shadow-sm">
                    <h3 className="text-xl font-serif italic text-natural-text-heading mb-10">Administrative Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label block pl-1">Pharmacy Name</label>
                        <input type="text" defaultValue="Main Street Pharmacy" className="w-full px-5 py-3 border border-natural-border rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none bg-natural-bg/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label block pl-1">License No.</label>
                        <input type="text" defaultValue="PH-102938475" className="w-full px-5 py-3 border border-natural-border rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none bg-natural-bg/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label block pl-1">Physical Address</label>
                      <textarea className="w-full px-5 py-3 border border-natural-border rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none bg-natural-bg/50" rows={3}>123 Healthcare Blvd, Medical District, NY 10001</textarea>
                    </div>
                    <div className="mt-10 flex justify-end">
                      <button className="bg-natural-accent text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-natural-accent/20">Save Changes</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {(activeView === 'prescriptions' || activeView === 'sales') && (
              <div className="h-[400px] flex flex-col items-center justify-center text-natural-text-label gap-6 bg-white rounded-[40px] border border-natural-border border-dashed p-12">
                <div className="w-20 h-20 bg-natural-sidebar rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-natural-accent opacity-30" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-serif italic text-natural-text-heading mb-2">Module Under Optimization</h3>
                  <p className="text-sm max-w-xs mx-auto leading-relaxed opacity-70">
                    We are currently refining the data structures for this section to improve performance. Please check back shortly.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#3d3d3a]/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-natural-border p-10 overflow-hidden"
            >
              <h3 className="text-2xl font-serif italic text-natural-text-heading mb-8">Add New Inventory Item</h3>
              
              <form onSubmit={handleAddMedicine} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label pl-1">Product Name</label>
                    <input name="name" required placeholder="e.g., Amoxicillin 500mg" className="w-full px-5 py-3 bg-natural-sidebar rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label pl-1">Category</label>
                    <select name="category" required className="w-full px-5 py-3 bg-natural-sidebar rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none border-none appearance-none">
                      <option>Antibiotics</option>
                      <option>Cardiology</option>
                      <option>Painkillers</option>
                      <option>Respiratory</option>
                      <option>Vaccines</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label pl-1">Quantity</label>
                    <input name="stock" type="number" required placeholder="0" className="w-full px-5 py-3 bg-natural-sidebar rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label pl-1">Unit Price ($)</label>
                    <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full px-5 py-3 bg-natural-sidebar rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label pl-1">Min. Threshold</label>
                    <input name="minThreshold" type="number" required placeholder="10" className="w-full px-5 py-3 bg-natural-sidebar rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none border-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-natural-text-label pl-1">Manufacturer</label>
                  <input name="manufacturer" required placeholder="Pfizer, GSK, etc." className="w-full px-5 py-3 bg-natural-sidebar rounded-2xl text-sm focus:ring-1 focus:ring-natural-accent outline-none border-none" />
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest border border-natural-border text-natural-text-muted hover:bg-natural-sidebar transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest bg-natural-accent text-white shadow-lg shadow-natural-accent/20 hover:opacity-90 transition-all"
                  >
                    Save to Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
