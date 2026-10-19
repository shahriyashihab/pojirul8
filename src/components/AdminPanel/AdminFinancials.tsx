import React, { useState } from 'react';
import { Product, Order, ShopExpense, StockInRecord, CustomerDue } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate, getBDBusinessDate } from '../../services/firebaseService';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  FileText,
  Printer,
  Boxes,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Store,
  Globe,
} from 'lucide-react';

interface AdminFinancialsProps {
  products: Product[];
  orders: Order[];
  expenses: ShopExpense[];
  stockIns: StockInRecord[];
  dues: CustomerDue[];
}

type TimeframePreset = 'today' | 'this_month' | '2_months' | '6_months' | '1_year' | 'custom';

export const AdminFinancials: React.FC<AdminFinancialsProps> = ({
  products,
  orders,
  expenses,
  stockIns,
  dues,
}) => {
  const [preset, setPreset] = useState<TimeframePreset>('1_year');

  const now = new Date();
  const todayStr = getBDBusinessDate();

  // Calculate default dates
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(oneYearAgo);
  const [toDate, setToDate] = useState<string>(todayStr);

  const handlePresetChange = (newPreset: TimeframePreset) => {
    setPreset(newPreset);
    const today = new Date();

    if (newPreset === 'today') {
      const d = today.toISOString().split('T')[0];
      setFromDate(d);
      setToDate(d);
    } else if (newPreset === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setFromDate(startOfMonth);
      setToDate(today.toISOString().split('T')[0]);
    } else if (newPreset === '2_months') {
      const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFromDate(twoMonthsAgo);
      setToDate(today.toISOString().split('T')[0]);
    } else if (newPreset === '6_months') {
      const sixMonthsAgo = new Date(today.getTime() - 182 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFromDate(sixMonthsAgo);
      setToDate(today.toISOString().split('T')[0]);
    } else if (newPreset === '1_year') {
      const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFromDate(oneYearAgo);
      setToDate(today.toISOString().split('T')[0]);
    }
  };

  // Filter orders, expenses, stockIns in the date range
  const filteredOrders = orders.filter((o) => {
    const d = o.businessDate || getBDBusinessDate(o.createdAt);
    return d >= fromDate && d <= toDate && o.status === 'confirmed';
  });

  const filteredExpenses = expenses.filter((e) => {
    return e.date >= fromDate && e.date <= toDate;
  });

  const filteredStockIns = stockIns.filter((s) => {
    return s.date >= fromDate && s.date <= toDate;
  });

  // 1. Total Revenue & Channel Breakdown
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCashReceived = filteredOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalDueGiven = filteredOrders.reduce((sum, o) => sum + o.dueAmount, 0);

  // In-store POS (Hand cash & counter credit) vs Online Store
  const posOrders = filteredOrders.filter((o) => o.source === 'pos');
  const posTotal = posOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const posCashPaid = posOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const posDue = posOrders.reduce((sum, o) => sum + o.dueAmount, 0);

  const onlineOrders = filteredOrders.filter((o) => o.source === 'online');
  const onlineTotal = onlineOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const onlineCashPaid = onlineOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const onlineDue = onlineOrders.reduce((sum, o) => sum + o.dueAmount, 0);

  // 2. Cost of Goods Sold (COGS)
  let totalCOGS = 0;
  const itemProfitMap: Record<
    string,
    {
      productId: string;
      productName: string;
      totalSoldKg: number;
      revenue: number;
      cost: number;
      grossProfit: number;
    }
  > = {};

  filteredOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      const buyPrice = item.buyPricePerKg || 0;
      const cost = buyPrice * item.quantityKg;
      totalCOGS += cost;

      if (!itemProfitMap[item.productId]) {
        itemProfitMap[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          totalSoldKg: 0,
          revenue: 0,
          cost: 0,
          grossProfit: 0,
        };
      }

      itemProfitMap[item.productId].totalSoldKg += item.quantityKg;
      itemProfitMap[item.productId].revenue += item.total;
      itemProfitMap[item.productId].cost += cost;
      itemProfitMap[item.productId].grossProfit += item.total - cost;
    });
  });

  // 3. Gross Profit
  const grossProfit = totalRevenue - totalCOGS;

  // 4. Operating Expenses
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 5. Net Profit / Total Loss
  const netProfit = grossProfit - totalOperatingExpenses;
  const isLoss = netProfit < 0;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // 6. Current Inventory Asset Value (Current Stock × Buy Price)
  const currentStockAssetValue = products.reduce((sum, p) => sum + p.stockKg * p.buyPricePerKg, 0);

  // 7. Total Market Due Currently
  const totalOutstandingDue = dues.reduce((sum, d) => sum + d.totalDue, 0);

  // 8. Total Purchases / Inbound Investment in this period
  const totalPurchasesCost = filteredStockIns.reduce((sum, s) => sum + s.totalCost, 0);

  // Monthly breakdown for bar chart simulation (last 12 months)
  const monthlyData: { monthName: string; revenue: number; expense: number; profit: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('bn-BD', { month: 'short', year: '2-digit' });

    const monthOrders = orders.filter(
      (o) => o.createdAt.startsWith(monthKey) && o.status !== 'cancelled'
    );
    const rev = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    let cogs = 0;
    monthOrders.forEach((o) => {
      o.items.forEach((it) => {
        cogs += (it.buyPricePerKg || 0) * it.quantityKg;
      });
    });

    const exp = expenses
      .filter((e) => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + e.amount, 0);

    const prof = rev - cogs - exp;

    monthlyData.push({
      monthName,
      revenue: rev,
      expense: exp + cogs,
      profit: prof,
    });
  }

  const maxChartVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.revenue, m.expense, Math.abs(m.profit))),
    10000
  );

  return (
    <div className="space-y-6">
      {/* Timeframe Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-700" />
            <span>বাৎসরিক ও পূর্ণাঙ্গ লাভ-ক্ষতি অডিট (Financial Statement)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ব্যবসায়ের মোট বিনিয়োগ, বিক্রয় আয়, দোকান খরচ ও চূড়ান্ত লাভ/ক্ষতির পুঙ্খানুপুঙ্খ রিপোর্ট
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handlePresetChange('1_year')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              preset === '1_year'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            পুরো ১ বছর
          </button>
          <button
            onClick={() => handlePresetChange('6_months')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              preset === '6_months'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            বিগত ৬ মাস
          </button>
          <button
            onClick={() => handlePresetChange('2_months')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              preset === '2_months'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            বিগত ২ মাস
          </button>
          <button
            onClick={() => handlePresetChange('this_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              preset === 'this_month'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            চলতি মাস
          </button>
          <button
            onClick={() => handlePresetChange('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              preset === 'today'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            আজকের দিন
          </button>
        </div>
      </div>

      {/* Date Range Custom Inputs */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700">হিসাবের সময়কাল:</span>
          <span className="text-slate-600 font-medium">
            {getBengaliDate(fromDate)} থেকে {getBengaliDate(toDate)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-slate-500 whitespace-nowrap">শুরু:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPreset('custom');
              }}
              className="w-full sm:w-auto px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-slate-500 whitespace-nowrap">শেষ:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPreset('custom');
              }}
              className="w-full sm:w-auto px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Channel Breakdown: In-Store Hand Cash vs Online Store */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In-store Hand Cash Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900">দোকানের সরাসরি বিক্রি (হ্যান্ড ক্যাশ ও কাউন্টার)</h4>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {formatNumberBengali(posOrders.length)} টি মেমো
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">মোট বেচাবিক্রি:</span>
              <div className="font-bold text-slate-900 tabular-nums">{formatTaka(posTotal)}</div>
            </div>
            <div>
              <span className="text-emerald-700 text-[11px]">হ্যান্ড ক্যাশ নগদ আদায়:</span>
              <div className="font-extrabold text-emerald-800 tabular-nums">{formatTaka(posCashPaid)}</div>
            </div>
            <div>
              <span className="text-rose-600 text-[11px]">দোকানের বাকি:</span>
              <div className="font-bold text-rose-700 tabular-nums">{formatTaka(posDue)}</div>
            </div>
          </div>
        </div>

        {/* Online Orders Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-slate-900">অনলাইন ওয়েবসাইটের অর্ডার (Online Orders)</h4>
            </div>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {formatNumberBengali(onlineOrders.length)} টি অর্ডার
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">মোট অনলাইন বিক্রি:</span>
              <div className="font-bold text-slate-900 tabular-nums">{formatTaka(onlineTotal)}</div>
            </div>
            <div>
              <span className="text-emerald-700 text-[11px]">অনলাইন পেমেন্ট/ক্যাশ:</span>
              <div className="font-extrabold text-emerald-800 tabular-nums">{formatTaka(onlineCashPaid)}</div>
            </div>
            <div>
              <span className="text-rose-600 text-[11px]">অনলাইন বাকি:</span>
              <div className="font-bold text-rose-700 tabular-nums">{formatTaka(onlineDue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Financial Audit Statement Box */}
      <div
        className={`p-6 rounded-2xl border ${
          isLoss
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-emerald-50/70 border-emerald-200'
        } shadow-sm`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-600 mb-1">
              চূড়ান্ত আর্থিক ফলাফল ({preset === '1_year' ? '১ বছর' : preset === '2_months' ? '২ মাস' : 'নির্বাচিত সময়কাল'})
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${
                isLoss ? 'text-rose-700' : 'text-emerald-800'
              }`}
            >
              {isLoss ? 'মোট ক্ষতি: ' : 'খাঁটি নিট লাভ: '}
              {formatTaka(Math.abs(netProfit))}
            </h2>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">নিট মার্জিন শতাংশ</div>
            <div
              className={`text-xl font-bold tabular-nums ${
                isLoss ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {profitMarginPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Step-by-step Audit Ledger Formula Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-medium">১. মোট বিক্রয় রেভিনিউ (+)</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-1">
              {formatTaka(totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              নগদ: {formatTaka(totalCashReceived)} · বাকি: {formatTaka(totalDueGiven)}
            </div>
          </div>

          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-medium">২. বিক্রীত মালের আসল ক্রয়মূল্য (-)</span>
            <div className="text-lg font-bold text-amber-800 tabular-nums mt-1">
              {formatTaka(totalCOGS)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              পাইকারি মোকামের কেনা দর
            </div>
          </div>

          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-medium">৩. মোট গ্রস লাভ (=)</span>
            <div className="text-lg font-bold text-blue-800 tabular-nums mt-1">
              {formatTaka(grossProfit)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              বিক্রয় আয় - পণ্যের ক্রয়মূল্য
            </div>
          </div>

          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-medium">৪. মোট দোকান পরিচালনা খরচ (-)</span>
            <div className="text-lg font-bold text-rose-700 tabular-nums mt-1">
              {formatTaka(totalOperatingExpenses)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              ভাড়া, লেবার, বিদ্যুৎ ও বেতন
            </div>
          </div>
        </div>
      </div>

      {/* Assets & Capital Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Stock Valuation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>বর্তমানে দোকানে মজুত মালের সম্পদ মূল্য</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatTaka(currentStockAssetValue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            দোকানের গুদামে থাকা মোট মাল ক্রয়মূল্য অনুযায়ী আপনার জমা রাখা অবিক্রীত মূলধন সম্পদ।
          </p>
        </div>

        {/* Market Due */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>বাজারে মোট অপরিশোধিত বাকি</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums">
            {formatTaka(totalOutstandingDue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            খামারি ও গ্রাহকদের নিকট দোকানের পাওনা অর্থ। আদায় হলে সরাসরি ক্যাশে যুক্ত হবে।
          </p>
        </div>

        {/* Inbound Purchases */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>নির্বাচিত সময়ে মোকাম থেকে মোট মাল ক্রয়</span>
            <ArrowDownRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatTaka(totalPurchasesCost)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            মোকাম বা মিল থেকে মোট কেনা চালানের সমষ্টি (বিনিয়োগ ব্যয়)।
          </p>
        </div>
      </div>

      {/* 12-Month Financial Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">গত ১২ মাসের বিক্রয় ও লাভ-ক্ষতির চিত্র</h4>
            <p className="text-xs text-slate-500">প্রতি মাসের মোট বেচাকেনা বনাম নিট লাভের ধারাবাহিক তুলনা</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-600 rounded-xs"></span>
              <span>বিক্রয় রেভিনিউ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-xs"></span>
              <span>ব্যয় (পণ্য + খরচ)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
              <span>নিট লাভ/ক্ষতি</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Columns with Mobile Horizontal Scroll */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="grid grid-cols-12 gap-2 pt-4 items-end h-48 border-b border-slate-200 pb-2 min-w-[520px]">
            {monthlyData.map((m, idx) => {
              const revHeight = Math.min(100, Math.max(10, (m.revenue / maxChartVal) * 100));
              const expHeight = Math.min(100, Math.max(8, (m.expense / maxChartVal) * 100));
              const isProf = m.profit >= 0;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 bg-slate-900 text-white text-[10px] p-1.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div>বিক্রি: {formatTaka(m.revenue)}</div>
                    <div>লাভ: {formatTaka(m.profit)}</div>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-36">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-2 sm:w-2.5 bg-emerald-600 rounded-t-xs transition-all"
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-2 sm:w-2.5 bg-amber-500 rounded-t-xs transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{m.monthName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item-wise Profitability Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              প্রতিটি পণ্যের আলাদা লাভ-ক্ষতি বিশ্লেষণ (Item-wise Profitability)
            </h4>
            <p className="text-xs text-slate-500">
              কোন মালের বেচাকেনায় সবচেয়ে বেশি মুনাফা হচ্ছে এবং কার মার্জিন কেমন
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="py-2.5 px-3">পণ্যের নাম</th>
                <th className="py-2.5 px-3 text-right">বিক্রিত পরিমাণ</th>
                <th className="py-2.5 px-3 text-right">মোট বিক্রয়মূল্য</th>
                <th className="py-2.5 px-3 text-right">মোট ক্রয়মূল্য</th>
                <th className="py-2.5 px-3 text-right">অর্জিত গ্রস লাভ</th>
                <th className="py-2.5 px-3 text-right">মুনাফার মার্জিন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.values(itemProfitMap).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    নির্বাচিত সময়কালের মধ্যে কোনো বিক্রয়ের তথ্য নেই।
                  </td>
                </tr>
              ) : (
                Object.values(itemProfitMap).map((item) => {
                  const marginPct = item.revenue > 0 ? (item.grossProfit / item.revenue) * 100 : 0;
                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                        {formatNumberBengali(item.totalSoldKg)} কেজি
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-medium text-slate-800">
                        {formatTaka(item.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                        {formatTaka(item.cost)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-emerald-800">
                        {formatTaka(item.grossProfit)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-emerald-700">
                        {marginPct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
