import React from 'react';
import { Product, Order, CustomerDue, ShopExpense } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../../services/firebaseService';
import {
  TrendingUp,
  Banknote,
  AlertTriangle,
  ShoppingBag,
  Clock,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  dues: CustomerDue[];
  expenses: ShopExpense[];
  onNavigateTab: (tab: string) => void;
  onViewMemo: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  dues,
  expenses,
  onNavigateTab,
  onViewMemo,
  onUpdateOrderStatus,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Today's confirmed orders (Only confirmed orders count towards actual sales, cash & profit)
  const todayConfirmedOrders = orders.filter(
    (o) =>
      (o.createdAt.startsWith(today) || (o.updatedAt && o.updatedAt.startsWith(today))) &&
      o.status === 'confirmed'
  );
  const todaySales = todayConfirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayCashFromOrders = todayConfirmedOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const todayDueGiven = todayConfirmedOrders.reduce((sum, o) => sum + o.dueAmount, 0);

  // Today's collected due payments from customers
  const todayDueCollected = dues.reduce((sum, d) => {
    const todayPays = (d.history || []).filter((h) => h.type === 'payment_received' && h.date === today);
    return sum + todayPays.reduce((pSum, p) => pSum + (p.amount || 0), 0);
  }, 0);

  const totalCashCollectedToday = todayCashFromOrders + todayDueCollected;

  // Today's expenses
  const todayExpenses = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  // Today's Gross Profit from confirmed sold items only
  let todayGrossProfit = 0;
  todayConfirmedOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      const marginPerKg = item.unitPrice - (item.buyPricePerKg || 0);
      todayGrossProfit += marginPerKg * item.quantityKg;
    });
  });
  const todayNetProfit = todayGrossProfit - todayExpenses;

  // Total Market Due
  const totalMarketDue = dues.reduce((sum, d) => sum + (d.totalDue || 0), 0);

  // Low Stock Items
  const lowStockProducts = products.filter((p) => p.stockKg <= p.minStockAlertKg);

  // Pending orders waiting for Admin confirmation
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const pendingTotalAmount = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alert Header for Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-700 animate-pulse shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                {formatNumberBengali(pendingOrders.length)} টি নতুন অনলাইন অর্ডার অপেক্ষমাণ আছে!
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-700 mt-0.5">
                গ্রাহকরা অর্ডার কনফার্মেশনের অপেক্ষা করছেন। দ্রুত স্ট্যাটাস আপডেট করুন।
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="w-full sm:w-auto px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center min-h-[38px]"
          >
            অর্ডারগুলো দেখুন
          </button>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Total Sales */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>আজকের মোট বিক্রি</span>
            <span className="text-slate-400">নগদ + বাকি</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatTaka(todaySales)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>নিশ্চিত বিক্রি: {formatNumberBengali(todayConfirmedOrders.length)} টি মেমো</span>
            {pendingOrders.length > 0 ? (
              <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                {formatNumberBengali(pendingOrders.length)} টি পেন্ডিং
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">আজকের দিন</span>
            )}
          </div>
        </div>

        {/* Today's Cash Collection */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>আজকের নগদ আদায়</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {formatTaka(totalCashCollectedToday)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex justify-between">
            <span>নগদ বিক্রি: {formatTaka(todayCashFromOrders)}</span>
            <span>বাকি জমা: {formatTaka(todayDueCollected)}</span>
          </div>
        </div>

        {/* Today's Due Added */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>আজকের নতুন বাকি</span>
            <span className="text-rose-600 font-medium">বকেয়া</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums">
            {formatTaka(todayDueGiven)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            বাজারে সর্বমোট বাকি: <strong className="text-slate-700">{formatTaka(totalMarketDue)}</strong>
          </div>
        </div>

        {/* Today's Net Profit */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>আজকের খাঁটি লাভ (নিট)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            className={`text-2xl font-bold tabular-nums ${
              todayNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatTaka(todayNetProfit)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex justify-between">
            <span>আজকের মোট খরচ:</span>
            <span className="font-semibold text-slate-700">{formatTaka(todayExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-bold text-slate-200">
          দোকানের দ্রুত কার্যক্রম পরিচালনা:
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('pos')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[42px] shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>কাউন্টার POS</span>
          </button>
          <button
            onClick={() => onNavigateTab('dues')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer min-h-[42px]"
          >
            <span>বাকির খাতা</span>
          </button>
          <button
            onClick={() => onNavigateTab('cashbook')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer min-h-[42px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>দৈনিক রোকার</span>
          </button>
          <button
            onClick={() => onNavigateTab('financials')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer min-h-[42px]"
          >
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span>লাভ-ক্ষতি অডিট</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">গুদামে মালের মজুত সতর্কতা</h3>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                সব স্টক দেখুন
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                সব পণ্যের পর্যাপ্ত মজুত আছে। কোনো সংকট নেই।
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-slate-500">
                        সতর্কতা মাত্রা: {formatNumberBengali(p.minStockAlertKg)} কেজি
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-rose-600 tabular-nums">
                        অবশিষ্ট: {formatNumberBengali(p.stockKg)} কেজি
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ({(p.stockKg / p.bagWeightKg).toFixed(1)} বস্তা)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              + নতুন চালান ও স্টক ইন এন্ট্রি করুন
            </button>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h3>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                সকল অর্ডার
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                এখনো কোনো অর্ডার আসেনি।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{ord.memoNo}</span>
                        <span className="text-slate-500">· {ord.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.items.map((i) => i.productName).join(', ')}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-bold text-slate-900 tabular-nums">
                          {formatTaka(ord.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {ord.status === 'pending'
                            ? 'অপেক্ষমাণ'
                            : ord.status === 'confirmed'
                            ? 'কনফার্ম সম্পন্ন'
                            : 'বাতিল'}
                        </div>
                      </div>

                      <button
                        onClick={() => onViewMemo(ord)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded"
                        title="মেমো প্রিন্ট করুন"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateTab('orders')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              সকল লাইভ অর্ডার ব্যবস্থাপনা করুন →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
