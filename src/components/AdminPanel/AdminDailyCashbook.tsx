import React, { useState } from 'react';
import { Order, ShopExpense, CustomerDue, StockInRecord, DailyCashRecord } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate, getBDBusinessDate } from '../../services/firebaseService';
import {
  FileSpreadsheet,
  Calendar,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AdminDailyCashbookProps {
  orders: Order[];
  expenses: ShopExpense[];
  dues: CustomerDue[];
  stockIns: StockInRecord[];
  dailyCashRecords: DailyCashRecord[];
  onSaveOpeningCash: (date: string, amount: number, notes?: string) => Promise<void>;
}

export const AdminDailyCashbook: React.FC<AdminDailyCashbookProps> = ({
  orders,
  expenses,
  dues,
  stockIns,
  dailyCashRecords,
  onSaveOpeningCash,
}) => {
  const todayStr = getBDBusinessDate();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const currentRecord = dailyCashRecords.find((r) => r.date === selectedDate);
  const [openingCashInput, setOpeningCashInput] = useState<number | ''>(
    currentRecord ? currentRecord.openingCash : 5000
  );
  const [notesInput, setNotesInput] = useState<string>(currentRecord?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const rec = dailyCashRecords.find((r) => r.date === newDate);
    setOpeningCashInput(rec ? rec.openingCash : '');
    setNotesInput(rec?.notes || '');
    setIsSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeOpening = typeof openingCashInput === 'number' && !isNaN(openingCashInput) ? openingCashInput : 0;
    await onSaveOpeningCash(selectedDate, safeOpening, notesInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // 1. Cash Inflows on selectedDate:
  // - Direct Cash from Orders (confirmed orders on this business date with paid cash)
  const dateOrders = orders.filter(
    (o) =>
      o.status === 'confirmed' &&
      o.paidAmount > 0 &&
      (o.businessDate === selectedDate ||
        getBDBusinessDate(o.createdAt) === selectedDate ||
        (o.updatedAt && getBDBusinessDate(o.updatedAt) === selectedDate) ||
        o.createdAt.startsWith(selectedDate))
  );
  const cashFromSales = dateOrders.reduce((sum, o) => sum + o.paidAmount, 0);

  // - Due payments collected on selectedDate
  let cashFromDuePayments = 0;
  const duePaymentLogs: { id: string; customerName: string; amount: number; note?: string }[] = [];
  dues.forEach((c) => {
    (c.history || []).forEach((h) => {
      if (h.date === selectedDate && h.type === 'payment_received') {
        cashFromDuePayments += h.amount;
        duePaymentLogs.push({
          id: h.id,
          customerName: c.customerName,
          amount: h.amount,
          note: h.note,
        });
      }
    });
  });

  const totalCashIn = cashFromSales + cashFromDuePayments;

  // 2. Cash Outflows on selectedDate:
  // - Shop Expenses
  const dateExpenses = expenses.filter((e) => e.date === selectedDate);
  const totalShopExpenses = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

  // - Stock Purchase Cash Out
  const dateStockPurchases = stockIns.filter((s) => s.date === selectedDate);
  const totalStockPurchases = dateStockPurchases.reduce((sum, s) => sum + s.totalCost, 0);

  const totalCashOut = totalShopExpenses + totalStockPurchases;

  // 3. Opening & Closing Cash
  const openingCash = openingCashInput || 0;
  const closingCash = openingCash + totalCashIn - totalCashOut;

  return (
    <div className="space-y-6">
      {/* Date Header & Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <span>দৈনিক রোকার ও ক্যাশ খাতা (Daily Cashbook)</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">
              প্রতিদিনের প্রারম্ভিক নগদ, ক্যাশ ইন, ক্যাশ আউট এবং দিনশেষে ক্যাশ বাক্সের হিসাব
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-300">
              <Clock className="w-3 h-3 text-emerald-700" />
              <span>বাংলাদেশ দোকান শিফট: সকাল ৯টা - রাত ২টা</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">তারিখ:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold"
          />
        </div>
      </div>

      {/* Opening Cash Input Form */}
      <form
        onSubmit={handleSave}
        className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <label className="block text-xs font-bold text-emerald-900 mb-1">
            সকালের প্রারম্ভিক নগদ (Opening Cash in Hand)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">৳</span>
              <input
                type="number"
                min={0}
                value={openingCashInput}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  setOpeningCashInput(val === '' ? '' : parseFloat(val));
                }}
                placeholder="0"
                className="w-full sm:w-48 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold tabular-nums text-slate-900 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="নোট (ঐচ্ছিক)"
              className="w-full sm:flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>সংরক্ষিত হয়েছে</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>প্রারম্ভিক ক্যাশ সেভ করুন</span>
            </>
          )}
        </button>
      </form>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Opening Cash */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">১. প্রারম্ভিক ক্যাশ (+)</div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {formatTaka(openingCash)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">সকালে বাক্সে থাকা টাকা</div>
        </div>

        {/* Total Cash In */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold mb-1 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>২. মোট ক্যাশ ইন (+)</span>
          </div>
          <div className="text-xl font-bold text-emerald-800 tabular-nums">
            {formatTaka(totalCashIn)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            নগদ বিক্রি {formatTaka(cashFromSales)} + বাকি জমা {formatTaka(cashFromDuePayments)}
          </div>
        </div>

        {/* Total Cash Out */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-rose-600 font-semibold mb-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>৩. মোট ক্যাশ আউট (-)</span>
          </div>
          <div className="text-xl font-bold text-rose-700 tabular-nums">
            {formatTaka(totalCashOut)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            দোকান খরচ {formatTaka(totalShopExpenses)} + মাল ক্রয় {formatTaka(totalStockPurchases)}
          </div>
        </div>

        {/* Closing Cash */}
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs">
          <div className="text-xs text-emerald-300 font-semibold mb-1">
            ৪. সমাপনী ক্যাশ ব্যালেন্স (=)
          </div>
          <div className="text-2xl font-extrabold text-white tabular-nums">
            {formatTaka(closingCash)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            দিনশেষে ক্যাশ ড্রয়ারে থাকার কথা
          </div>
        </div>
      </div>

      {/* Two Column Detailed Transactions for Selected Date */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Inflow Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>নগদ জমা খতিয়ান (Cash Inflow)</span>
            </h4>
            <span className="text-xs font-bold text-emerald-800 tabular-nums">
              মোট: {formatTaka(totalCashIn)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Sales Cash */}
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <strong className="text-slate-800">আজকের সরাসরি নগদ বিক্রি</strong>
                <div className="text-[11px] text-slate-500">{dateOrders.length} টি অর্ডারে নগদ প্রাপ্তি</div>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">{formatTaka(cashFromSales)}</span>
            </div>

            {/* Old Due Collected */}
            {duePaymentLogs.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs">
                আজকে কোনো পুরাতন বাকি আদায় হয়নি।
              </div>
            ) : (
              duePaymentLogs.map((log) => (
                <div key={log.id} className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-center justify-between">
                  <div>
                    <strong className="text-emerald-900">{log.customerName}</strong>
                    <div className="text-[11px] text-emerald-700">{log.note || 'বাকি পরিশোধ বাবদ জমা'}</div>
                  </div>
                  <span className="font-bold text-emerald-800 tabular-nums">+{formatTaka(log.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cash Outflow Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>নগদ খরচ খতিয়ান (Cash Outflow)</span>
            </h4>
            <span className="text-xs font-bold text-rose-700 tabular-nums">
              মোট: {formatTaka(totalCashOut)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {dateExpenses.length === 0 && dateStockPurchases.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs">
                আজকে কোনো ক্যাশ খরচ হয়নি।
              </div>
            ) : (
              <>
                {dateExpenses.map((exp) => (
                  <div key={exp.id} className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-rose-900">{exp.title}</strong>
                      <div className="text-[11px] text-rose-700">{exp.note || 'দোকান পরিচালনা খরচ'}</div>
                    </div>
                    <span className="font-bold text-rose-700 tabular-nums">-{formatTaka(exp.amount)}</span>
                  </div>
                ))}

                {dateStockPurchases.map((stk) => (
                  <div key={stk.id} className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-blue-900">{stk.productName} (স্টক ইন)</strong>
                      <div className="text-[11px] text-blue-700">
                        {formatNumberBengali(stk.quantityKg)} কেজি ক্রয় · চালান নং {stk.invoiceNo || '-'}
                      </div>
                    </div>
                    <span className="font-bold text-blue-800 tabular-nums">-{formatTaka(stk.totalCost)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
