/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Product, Order, OrderItem, CustomerDue, ShopExpense, StockInRecord, DailyCashRecord, ShopSettings, Neighborhood, ResetOptions } from './types';
import { FirebaseService, formatTaka, formatNumberBengali } from './services/firebaseService';
import { INITIAL_SETTINGS, INITIAL_NEIGHBORHOODS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS_DUE, INITIAL_EXPENSES, INITIAL_STOCK_IN } from './services/initialData';
import { Navbar } from './components/Navbar';
import { CustomerStore } from './components/CustomerStore';
import { PrintableMemo } from './components/PrintableMemo';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLayout } from './components/AdminPanel/AdminLayout';

export default function App() {
  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Core Data Stores: Initialized immediately with cache or clean empty arrays
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const c = localStorage.getItem('bb_products_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const c = localStorage.getItem('bb_orders_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [dues, setDues] = useState<CustomerDue[]>(() => {
    try {
      const c = localStorage.getItem('bb_customers_due_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(() => {
    try {
      const c = localStorage.getItem('bb_neighborhoods_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [expenses, setExpenses] = useState<ShopExpense[]>(() => {
    try {
      const c = localStorage.getItem('bb_expenses_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [stockIns, setStockIns] = useState<StockInRecord[]>(() => {
    try {
      const c = localStorage.getItem('bb_stock_in_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [dailyCashRecords, setDailyCashRecords] = useState<DailyCashRecord[]>(() => {
    try {
      const c = localStorage.getItem('bb_daily_cash_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return [];
  });
  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const c = localStorage.getItem('bb_settings_v1');
      if (c) return JSON.parse(c);
    } catch {}
    return INITIAL_SETTINGS;
  });

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);

  // Toast / Live Alert State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Data Fetch
  const loadAllData = useCallback(async () => {
    try {
      const [prods, ords, dList, expList, stkList, cashList, sett, neighList] = await Promise.all([
        FirebaseService.getProducts(),
        FirebaseService.getOrders(),
        FirebaseService.getCustomersDue(),
        FirebaseService.getExpenses(),
        FirebaseService.getStockIns(),
        FirebaseService.getDailyCashRecords(),
        FirebaseService.getSettings(),
        FirebaseService.getNeighborhoods(),
      ]);

      setProducts(prods);
      setOrders(ords);
      setDues(dList);
      setExpenses(expList);
      setStockIns(stkList);
      setDailyCashRecords(cashList);
      setSettings(sett);
      setNeighborhoods(neighList);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    setIsAdminLoggedIn(FirebaseService.isAdminLoggedIn());

    // Realtime Background Polling every 5 seconds
    const interval = setInterval(async () => {
      try {
        const latestOrders = await FirebaseService.getOrders();
        setOrders((prev) => {
          if (latestOrders.length > prev.length && prev.length > 0) {
            const newest = latestOrders[0];
            showToast(`🔔 নতুন অর্ডার এসেছে! মেমো নং: ${newest.memoNo} (${formatTaka(newest.totalAmount)})`);
          }
          return latestOrders;
        });

        const latestProducts = await FirebaseService.getProducts();
        setProducts((prev) => {
          if (prev.length !== latestProducts.length || JSON.stringify(prev) !== JSON.stringify(latestProducts)) {
            return latestProducts;
          }
          return prev;
        });
      } catch (e) {
        // silent fail on intermittent drop
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAllData]);

  // Direct Order Submission (Online from Storefront)
  const handleSubmitOnlineOrder = async (order: Order) => {
    await FirebaseService.createOrder(order);
    const updatedOrders = await FirebaseService.getOrders();
    setOrders(updatedOrders);
  };

  const handleOrderSuccess = (order: Order) => {
    setActivePrintOrder(order);
    showToast(`🎉 আপনার অর্ডারটি সফল হয়েছে! মেমো নং: ${order.memoNo}`);
  };

  // 1-Click Order Confirmation by Admin
  const handleConfirmOrder = async (orderId: string) => {
    await FirebaseService.confirmOrder(orderId);
    const updatedOrders = await FirebaseService.getOrders();
    const updatedProducts = await FirebaseService.getProducts();
    const updatedDues = await FirebaseService.getCustomersDue();
    setOrders(updatedOrders);
    setProducts(updatedProducts);
    setDues(updatedDues);
    showToast(`✅ অর্ডার সফলভাবে কনফার্ম করা হয়েছে এবং হিসাব হালনাগাদ হয়েছে!`);
  };

  const handleCancelOrder = async (orderId: string) => {
    await FirebaseService.updateOrderStatus(orderId, 'cancelled');
    const updatedOrders = await FirebaseService.getOrders();
    setOrders(updatedOrders);
    showToast(`অর্ডারটি বাতিল করা হয়েছে।`);
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    const oldOrder = orders.find((o) => o.id === updatedOrder.id);
    await FirebaseService.updateOrder(updatedOrder, oldOrder);
    const updatedOrders = await FirebaseService.getOrders();
    const updatedProducts = await FirebaseService.getProducts();
    const updatedDues = await FirebaseService.getCustomersDue();
    setOrders(updatedOrders);
    setProducts(updatedProducts);
    setDues(updatedDues);
    showToast(`✅ মেমো নং ${updatedOrder.memoNo} সফলভাবে আপডেট ও রিক্যালকুলেট হয়েছে!`);
  };

  // Admin POS Counter Sale (Multi-item)
  const handleCreatePOSOrder = async (order: Order) => {
    await FirebaseService.createOrder(order);
    const updatedOrders = await FirebaseService.getOrders();
    setOrders(updatedOrders);
    showToast(`📝 কাউন্টার মেমো ${order.memoNo} তৈরি হয়েছে! অনুগ্রহ করে যাচাই করে কনফার্ম করুন।`);
  };

  // Admin Neighborhood Operations
  const handleAddNeighborhood = async (name: string, description?: string) => {
    await FirebaseService.addNeighborhood(name, description);
    const updated = await FirebaseService.getNeighborhoods();
    setNeighborhoods(updated);
  };

  const handleUpdateNeighborhood = async (neighborhood: Neighborhood) => {
    await FirebaseService.updateNeighborhood(neighborhood);
    const updated = await FirebaseService.getNeighborhoods();
    setNeighborhoods(updated);
  };

  const handleDeleteNeighborhood = async (id: string) => {
    await FirebaseService.deleteNeighborhood(id);
    const updated = await FirebaseService.getNeighborhoods();
    setNeighborhoods(updated);
  };

  // Admin Customer Merge Operation (হিসাব একত্রীকরণ)
  const handleMergeCustomers = async (sourceCustomerId: string, targetCustomerId: string) => {
    await FirebaseService.mergeCustomers(sourceCustomerId, targetCustomerId);
    const updatedDues = await FirebaseService.getCustomersDue();
    const updatedOrders = await FirebaseService.getOrders();
    setDues(updatedDues);
    setOrders(updatedOrders);
    showToast(`✅ গ্রাহকের উভয় খাতার হিসাব সফলভাবে একত্র (Merge) করা হয়েছে!`);
  };

  // Admin Granular Reset (নির্বাচিত বিষয় রিসেট)
  const handleResetSelectedData = async (options: ResetOptions, adminIdInput: string, passwordInput: string) => {
    const res = await FirebaseService.resetSelectedData(options, adminIdInput, passwordInput);
    if (res.success) {
      await loadAllData();
      showToast(`✅ ডেটা সফলভাবে রিসেট সম্পন্ন হয়েছে!`);
    }
    return res;
  };

  // Admin Master Reset (সকল ডেটা মুছে ফ্রেশ শুরু)
  const handleResetAllData = async (adminIdInput: string, passwordInput: string) => {
    const res = await FirebaseService.resetAllData(adminIdInput, passwordInput);
    if (res.success) {
      await loadAllData();
      showToast(`✅ ${res.message}`);
    }
    return res;
  };

  // Admin Inventory Operations
  const handleAddStockIn = async (record: StockInRecord) => {
    await FirebaseService.addStockIn(record);
    const updatedStockIns = await FirebaseService.getStockIns();
    const updatedProducts = await FirebaseService.getProducts();
    setStockIns(updatedStockIns);
    setProducts(updatedProducts);
    showToast(`✅ মোকাম চালান স্টক এন্ট্রি সম্পন্ন!`);
  };

  const handleUpdateProduct = async (product: Product) => {
    await FirebaseService.updateProduct(product);
    const updated = await FirebaseService.getProducts();
    setProducts(updated);
    showToast(`পণ্য তথ্য আপডেট হয়েছে!`);
  };

  const handleDeleteProduct = async (id: string) => {
    await FirebaseService.deleteProduct(id);
    const updated = await FirebaseService.getProducts();
    setProducts(updated);
    showToast(`পণ্যটি সফলভাবে মুছে ফেলা হয়েছে!`);
  };

  // Admin Due Ledger Operations
  const handleRecordDuePayment = async (customerId: string, amount: number, note?: string) => {
    await FirebaseService.recordDuePayment(customerId, amount, note);
    const updated = await FirebaseService.getCustomersDue();
    setDues(updated);
    showToast(`✅ বাকি জমা রসিদ এন্ট্রি সম্পন্ন: ${formatTaka(amount)}`);
  };

  const handleAddNewDueCustomer = async (customer: CustomerDue) => {
    const current = await FirebaseService.getCustomersDue();
    await FirebaseService.saveCustomersDue([customer, ...current]);
    const updated = await FirebaseService.getCustomersDue();
    setDues(updated);
    showToast(`নতুন বাকির খাতা তৈরি হয়েছে!`);
  };

  const handleImportDues = async (importedDues: CustomerDue[]) => {
    const current = await FirebaseService.getCustomersDue();
    const merged = [...importedDues, ...current];
    await FirebaseService.saveCustomersDue(merged);
    setDues(merged);
    showToast(`✅ ${formatNumberBengali(importedDues.length)} টি খতিয়ান সফলভাবে ইম্পোর্ট হয়েছে!`);
  };

  // Admin Expense Operations
  const handleAddExpense = async (expense: ShopExpense) => {
    await FirebaseService.addExpense(expense);
    const updated = await FirebaseService.getExpenses();
    setExpenses(updated);
    showToast(`দোকান খরচ এন্ট্রি সম্পন্ন: ${formatTaka(expense.amount)}`);
  };

  // Admin Daily Cash Operations
  const handleSaveOpeningCash = async (date: string, amount: number, notes?: string) => {
    await FirebaseService.setDailyOpeningCash(date, amount, notes);
    const updated = await FirebaseService.getDailyCashRecords();
    setDailyCashRecords(updated);
    showToast(`প্রারম্ভিক ক্যাশ ব্যালেন্স সংরক্ষিত: ${formatTaka(amount)}`);
  };

  // Admin Settings Operations
  const handleSaveSettings = async (newSettings: ShopSettings) => {
    await FirebaseService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast(`দোকানের সেটিংস সংরক্ষিত হয়েছে!`);
  };

  // Admin Auth
  const handleAdminSuccessLogin = () => {
    FirebaseService.setAdminLoggedIn(true);
    setIsAdminLoggedIn(true);
    setActiveView('admin');
    showToast('অ্যাডমিন প্যানেলে স্বাগতম!');
  };

  const handleAdminLogout = () => {
    FirebaseService.setAdminLoggedIn(false);
    setIsAdminLoggedIn(false);
    setActiveView('store');
    showToast('লগআউট সম্পন্ন হয়েছে।');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation (Shown in Store View) */}
      {activeView === 'store' && (
        <Navbar
          cartCount={0}
          onOpenCart={() => {}}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onGoToAdmin={() => setActiveView('admin')}
          onGoToStore={() => setActiveView('store')}
          activeView={activeView}
        />
      )}

      {/* Primary Views Switcher */}
      {activeView === 'store' ? (
        <CustomerStore
          products={products}
          neighborhoods={neighborhoods}
          onDirectOrder={handleSubmitOnlineOrder}
          onOrderSuccess={handleOrderSuccess}
          shopPhone={settings.phone}
          shopAddress={settings.address}
          settings={settings}
        />
      ) : (
        <AdminLayout
          products={products}
          orders={orders}
          dues={dues}
          neighborhoods={neighborhoods}
          expenses={expenses}
          stockIns={stockIns}
          dailyCashRecords={dailyCashRecords}
          settings={settings}
          onConfirmOrder={handleConfirmOrder}
          onCancelOrder={handleCancelOrder}
          onUpdateOrder={handleUpdateOrder}
          onViewMemo={(ord) => setActivePrintOrder(ord)}
          onCreatePOSOrder={handleCreatePOSOrder}
          onAddStockIn={handleAddStockIn}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onRecordDuePayment={handleRecordDuePayment}
          onAddNewDueCustomer={handleAddNewDueCustomer}
          onMergeCustomers={handleMergeCustomers}
          onImportDues={handleImportDues}
          onAddExpense={handleAddExpense}
          onSaveOpeningCash={handleSaveOpeningCash}
          onSaveSettings={handleSaveSettings}
          onAddNeighborhood={handleAddNeighborhood}
          onUpdateNeighborhood={handleUpdateNeighborhood}
          onDeleteNeighborhood={handleDeleteNeighborhood}
          onResetSelectedData={handleResetSelectedData}
          onResetAllData={handleResetAllData}
          onLogout={handleAdminLogout}
          onGoToStore={() => setActiveView('store')}
        />
      )}

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        settings={settings}
        onSuccessLogin={handleAdminSuccessLogin}
      />

      <PrintableMemo
        order={activePrintOrder}
        settings={settings}
        dues={dues}
        onClose={() => setActivePrintOrder(null)}
      />
    </div>
  );
}
