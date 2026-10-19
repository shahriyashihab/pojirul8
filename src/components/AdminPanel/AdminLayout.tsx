import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  FileSpreadsheet,
  Boxes,
  BookOpen,
  Wallet,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  MapPin,
  Server
} from 'lucide-react';
import { Product, Order, CustomerDue, ShopExpense, StockInRecord, DailyCashRecord, ShopSettings, Neighborhood, ResetOptions } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { AdminFinancials } from './AdminFinancials';
import { AdminDailyCashbook } from './AdminDailyCashbook';
import { AdminOrders } from './AdminOrders';
import { AdminPOS } from './AdminPOS';
import { AdminInventory } from './AdminInventory';
import { AdminDueLedger } from './AdminDueLedger';
import { AdminExpenses } from './AdminExpenses';
import { AdminSettings } from './AdminSettings';
import { AdminNeighborhoods } from './AdminNeighborhoods';
import { formatNumberBengali } from '../../services/firebaseService';

interface AdminLayoutProps {
  products: Product[];
  orders: Order[];
  dues: CustomerDue[];
  expenses: ShopExpense[];
  stockIns: StockInRecord[];
  dailyCashRecords: DailyCashRecord[];
  settings: ShopSettings;
  neighborhoods: Neighborhood[];
  onConfirmOrder: (orderId: string) => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onUpdateOrder?: (order: Order) => Promise<void>;
  onViewMemo: (order: Order) => void;
  onCreatePOSOrder: (order: Order) => Promise<void>;
  onAddStockIn: (record: StockInRecord) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  onRecordDuePayment: (customerId: string, amount: number, note?: string) => Promise<void>;
  onAddNewDueCustomer: (customer: CustomerDue) => Promise<void>;
  onMergeCustomers: (sourceCustomerId: string, targetCustomerId: string) => Promise<void>;
  onImportDues?: (importedDues: CustomerDue[]) => Promise<void>;
  onAddExpense: (expense: ShopExpense) => Promise<void>;
  onSaveOpeningCash: (date: string, amount: number, notes?: string) => Promise<void>;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
  onAddNeighborhood: (name: string, description?: string) => Promise<void>;
  onUpdateNeighborhood: (neighborhood: Neighborhood) => Promise<void>;
  onDeleteNeighborhood: (id: string) => Promise<void>;
  onResetSelectedData?: (options: ResetOptions, adminIdInput: string, passwordInput: string) => Promise<{ success: boolean; message: string }>;
  onResetAllData: (adminIdInput: string, passwordInput: string) => Promise<{ success: boolean; message: string }>;
  onLogout: () => void;
  onGoToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  products,
  orders,
  dues,
  expenses,
  stockIns,
  dailyCashRecords,
  settings,
  neighborhoods,
  onConfirmOrder,
  onCancelOrder,
  onUpdateOrder,
  onViewMemo,
  onCreatePOSOrder,
  onAddStockIn,
  onUpdateProduct,
  onDeleteProduct,
  onRecordDuePayment,
  onAddNewDueCustomer,
  onMergeCustomers,
  onImportDues,
  onAddExpense,
  onSaveOpeningCash,
  onSaveSettings,
  onAddNeighborhood,
  onUpdateNeighborhood,
  onDeleteNeighborhood,
  onResetSelectedData,
  onResetAllData,
  onLogout,
  onGoToStore,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stockKg <= p.minStockAlertKg).length;

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'orders', label: 'লাইভ অর্ডার', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'pos', label: 'কাউন্টার মেমো (POS)', icon: ShoppingCart },
    { id: 'dues', label: 'বাকির খাতা (লেজার)', icon: BookOpen },
    { id: 'neighborhoods', label: 'পাড়া ও মহল্লা', icon: MapPin },
    { id: 'cashbook', label: 'দৈনিক রোকার খাতা', icon: FileSpreadsheet },
    { id: 'inventory', label: 'পণ্য ও স্টক হিসাব', icon: Boxes, badge: lowStockCount, badgeColor: 'bg-amber-500' },
    { id: 'financials', label: 'বাৎসরিক লাভ-ক্ষতি অডিট', icon: TrendingUp },
    { id: 'expenses', label: 'দোকান খরচের খাতা', icon: Wallet },
    { id: 'settings', label: 'দোকানের সেটিংস', icon: Settings },
  ];

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      settings,
      neighborhoods,
      products,
      orders,
      dues,
      expenses,
      stockIns,
      dailyCashRecords,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhai-bhai-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-35 md:hidden transition-opacity"
          aria-label="মেনু বন্ধ করুন"
        />
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-20 bg-slate-900 text-white px-3 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="মেনু টগল"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-xs truncate text-white leading-tight">
              {settings.shopName}
            </h1>
            <span className="text-[10px] text-emerald-400 block font-medium truncate">
              {navItems.find((n) => n.id === activeTab)?.label || 'ড্যাশবোর্ড'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onGoToStore}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          >
            <Store className="w-3.5 h-3.5 text-emerald-200" />
            <span>ক্রেতার স্টোর</span>
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Drawer on Mobile, Fixed on Desktop) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 h-full w-72 sm:w-80 md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out md:sticky md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Shop Brand Header with Mobile Close button */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                {settings.shopName}
              </h2>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>অ্যাডমিন কন্ট্রোল প্যানেল</span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg active:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 overscroll-contain">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm font-bold ring-1 ring-emerald-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-emerald-600 text-white'
                      }`}
                    >
                      {formatNumberBengali(item.badge)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer: Storefront Link & Logout */}
          <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/60">
            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                onGoToStore();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
            >
              <Store className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>ক্রেতার স্টোরে যান</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors cursor-pointer min-h-[44px]"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area: Smooth native window scrolling on mobile, isolated on desktop */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-visible md:overflow-y-auto pb-28 md:pb-8">
        {/* Top Desktop Header Strip */}
        <div className="hidden md:flex bg-white border-b border-slate-200 px-6 py-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">বর্তমান ভিউ:</span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
              {navItems.find((n) => n.id === activeTab)?.label || 'ড্যাশবোর্ড'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToStore}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>ক্রেতার ভিউ দেখুন</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-2 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              orders={orders}
              dues={dues}
              expenses={expenses}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewMemo={onViewMemo}
              onUpdateOrderStatus={onConfirmOrder}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              neighborhoods={neighborhoods}
              onConfirmOrder={onConfirmOrder}
              onCancelOrder={onCancelOrder}
              onUpdateOrder={onUpdateOrder}
              onOpenNewManualOrder={() => setActiveTab('pos')}
              onViewMemo={onViewMemo}
            />
          )}

          {activeTab === 'pos' && (
            <AdminPOS
              products={products}
              dues={dues}
              neighborhoods={neighborhoods}
              onCreatePOSOrder={onCreatePOSOrder}
              onViewMemo={onViewMemo}
              onNavigateToOrders={() => setActiveTab('orders')}
            />
          )}

          {activeTab === 'dues' && (
            <AdminDueLedger
              dues={dues}
              orders={orders}
              neighborhoods={neighborhoods}
              onRecordDuePayment={onRecordDuePayment}
              onAddNewDueCustomer={onAddNewDueCustomer}
              onMergeCustomers={onMergeCustomers}
              onImportDues={onImportDues}
              onViewMemo={onViewMemo}
            />
          )}

          {activeTab === 'neighborhoods' && (
            <AdminNeighborhoods
              neighborhoods={neighborhoods}
              dues={dues}
              orders={orders}
              onAddNeighborhood={onAddNeighborhood}
              onUpdateNeighborhood={onUpdateNeighborhood}
              onDeleteNeighborhood={onDeleteNeighborhood}
              onViewMemo={onViewMemo}
              onRecordDuePayment={onRecordDuePayment}
            />
          )}

          {activeTab === 'cashbook' && (
            <AdminDailyCashbook
              orders={orders}
              expenses={expenses}
              dues={dues}
              stockIns={stockIns}
              dailyCashRecords={dailyCashRecords}
              onSaveOpeningCash={onSaveOpeningCash}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventory
              products={products}
              stockIns={stockIns}
              onAddStockIn={onAddStockIn}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}

          {activeTab === 'financials' && (
            <AdminFinancials
              products={products}
              orders={orders}
              expenses={expenses}
              stockIns={stockIns}
              dues={dues}
            />
          )}

          {activeTab === 'expenses' && (
            <AdminExpenses
              expenses={expenses}
              onAddExpense={onAddExpense}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              settings={settings}
              onSaveSettings={onSaveSettings}
              onExportBackup={handleExportBackup}
              onResetSelectedData={onResetSelectedData}
              onResetAllData={onResetAllData}
            />
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[54px] min-h-[44px] ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 mb-0.5 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>ড্যাশবোর্ড</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[54px] min-h-[44px] ${
            activeTab === 'orders' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 mb-0.5 ${activeTab === 'orders' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>অর্ডার</span>
          {pendingOrdersCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
              {formatNumberBengali(pendingOrdersCount)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[54px] min-h-[44px] ${
            activeTab === 'pos' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className={`w-4 h-4 mb-0.5 ${activeTab === 'pos' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>কাউন্টার</span>
        </button>

        <button
          onClick={() => setActiveTab('dues')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[54px] min-h-[44px] ${
            activeTab === 'dues' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-4 h-4 mb-0.5 ${activeTab === 'dues' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>বাকি খাতা</span>
        </button>

        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer min-w-[54px] min-h-[44px]"
        >
          <Menu className="w-4 h-4 mb-0.5 text-slate-400" />
          <span>সব মেনু</span>
        </button>
      </nav>
    </div>
  );
};
