import React, { useState } from 'react';
import { Neighborhood, CustomerDue, Order } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../../services/firebaseService';
import { safeOpenUrl } from '../../utils/safeOpen';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Users,
  Search,
  X,
  FileText,
  Phone,
  MessageCircle,
  Receipt,
  ArrowRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface AdminNeighborhoodsProps {
  neighborhoods: Neighborhood[];
  dues: CustomerDue[];
  orders: Order[];
  onAddNeighborhood: (name: string, description?: string) => Promise<void>;
  onUpdateNeighborhood: (neighborhood: Neighborhood) => Promise<void>;
  onDeleteNeighborhood: (id: string) => Promise<void>;
  onViewMemo?: (order: Order) => void;
  onRecordDuePayment?: (customerId: string, amount: number, note?: string) => Promise<void>;
}

export const AdminNeighborhoods: React.FC<AdminNeighborhoodsProps> = ({
  neighborhoods,
  dues,
  orders,
  onAddNeighborhood,
  onUpdateNeighborhood,
  onDeleteNeighborhood,
  onViewMemo,
  onRecordDuePayment,
}) => {
  const [newNeighName, setNewNeighName] = useState('');
  const [newNeighDesc, setNewNeighDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNeigh, setEditingNeigh] = useState<Neighborhood | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Selected neighborhood and sub-filter
  const [selectedNeighborhoodFilter, setSelectedNeighborhoodFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'cash' | 'due'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [neighSearchQuery, setNeighSearchQuery] = useState('');

  // Detail Modal for a specific customer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDue | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeighName.trim()) return;
    setIsAdding(true);
    try {
      await onAddNeighborhood(newNeighName.trim(), newNeighDesc.trim());
      setNewNeighName('');
      setNewNeighDesc('');
      showToast('✅ নতুন পাড়া সফলভাবে যুক্ত হয়েছে!');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (n: Neighborhood) => {
    setEditingNeigh(n);
    setEditName(n.name);
    setEditDesc(n.description || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNeigh || !editName.trim()) return;
    try {
      await onUpdateNeighborhood({
        ...editingNeigh,
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setEditingNeigh(null);
      showToast('✅ পাড়ার নাম আপডেট হয়েছে!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    let shouldDelete = true;
    try {
      shouldDelete = confirm(`আপনি কি নিশ্চিত যে "${name}" পাড়াটি তালিকা থেকে মুছে ফেলতে চান?`);
    } catch {
      shouldDelete = true;
    }
    if (shouldDelete) {
      await onDeleteNeighborhood(id);
      showToast(`পাড়া "${name}" মুছে ফেলা হয়েছে।`);
    }
  };

  // Neighborhood stats calculation: tracks BOTH cash and due customers
  const getNeighborhoodStats = (neighName: string) => {
    const custs = dues.filter((d) => (d.moholla || '').trim().toLowerCase() === neighName.trim().toLowerCase());
    const totalDue = custs.reduce((sum, c) => sum + (c.totalDue || 0), 0);
    const totalPurchases = custs.reduce((sum, c) => sum + (c.lifetimePurchases || 0), 0);
    const cashCustomersCount = custs.filter((c) => (c.totalDue || 0) === 0).length;
    const dueCustomersCount = custs.filter((c) => (c.totalDue || 0) > 0).length;
    const ords = orders.filter((o) => (o.moholla || '').trim().toLowerCase() === neighName.trim().toLowerCase());

    return {
      customerCount: custs.length,
      cashCustomersCount,
      dueCustomersCount,
      totalPurchases,
      totalDue,
      orderCount: ords.length,
    };
  };

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(neighSearchQuery.toLowerCase()) ||
    (n.description && n.description.toLowerCase().includes(neighSearchQuery.toLowerCase()))
  );

  // Filter customers for the selected neighborhood (or all)
  const baseCustomers = selectedNeighborhoodFilter === 'all'
    ? dues
    : dues.filter((d) => (d.moholla || '').trim().toLowerCase() === selectedNeighborhoodFilter.trim().toLowerCase());

  const activeCustomers = baseCustomers.filter((c) => {
    // Type Filter: all, cash only (totalDue === 0), due only (totalDue > 0)
    if (customerTypeFilter === 'cash' && (c.totalDue || 0) > 0) return false;
    if (customerTypeFilter === 'due' && (c.totalDue || 0) === 0) return false;

    // Search Query
    const q = customerSearchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      c.customerName.toLowerCase().includes(q) ||
      (c.fatherOrFarmName && c.fatherOrFarmName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.moholla && c.moholla.toLowerCase().includes(q)) ||
      (c.village && c.village.toLowerCase().includes(q))
    );
  });

  const totalAllCashCusts = dues.filter((c) => (c.totalDue || 0) === 0).length;
  const totalAllDueCusts = dues.filter((c) => (c.totalDue || 0) > 0).length;
  const totalAllSales = dues.reduce((sum, c) => sum + (c.lifetimePurchases || 0), 0);
  const totalAllDues = dues.reduce((sum, c) => sum + (c.totalDue || 0), 0);

  // Quick payment handler inside Customer Detail Modal
  const handlePaymentInsideModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPay = typeof paymentAmount === 'number' && !isNaN(paymentAmount) ? paymentAmount : 0;
    if (!selectedCustomer || numPay <= 0 || !onRecordDuePayment) return;

    setIsSubmittingPayment(true);
    try {
      await onRecordDuePayment(selectedCustomer.id, numPay, paymentNote || 'পাড়া ডিরেক্টরি থেকে জমা রসিদ');
      showToast(`✅ ${formatTaka(numPay)} জমা রসিদ সফলভাবে সম্পন্ন হয়েছে!`);

      // Update selected customer state locally
      setSelectedCustomer({
        ...selectedCustomer,
        totalDue: Math.max(0, (selectedCustomer.totalDue || 0) - numPay),
        history: [
          {
            id: `pay-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'payment_received',
            amount: numPay,
            note: paymentNote || 'পাড়া ডিরেক্টরি থেকে জমা রসিদ',
          },
          ...(selectedCustomer.history || []),
        ],
      });
      setPaymentAmount('');
      setPaymentNote('');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const sendCustomerWhatsApp = (c: CustomerDue) => {
    if (!c.phone) return;
    const cleanPhone = c.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = (c.totalDue || 0) > 0
      ? `আসসালামু আলাইকুম ${c.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার খতিয়ানের বর্তমান বকেয়া হিসাব: ${formatTaka(c.totalDue)}। মোট কেনাকাটা: ${formatTaka(c.lifetimePurchases)}। অনুগ্রহ করে সুবিধামতো পরিশোধের ব্যবস্থা করুন। ধন্যবাদ!`
      : `আসসালামু আলাইকুম ${c.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার খতিয়ানের বর্তমান অবস্থা: কোনো বকেয়া নেই (পরিশোধিত)। মোট কেনাকাটা: ${formatTaka(c.lifetimePurchases)}। আমাদের সাথে থাকার জন্য ধন্যবাদ!`;
    safeOpenUrl(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>পাড়া ও মহল্লাভিত্তিক গ্রাহক ডিরেক্টরি (Neighborhoods & Customer Ledger)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            গ্রামের সকল পাড়া ও মহল্লার নগদ ও বাকি উভয় ধরনের সকল গ্রাহকের বিস্তারিত তালিকা, কেনাকাটা ও মেমোর হিসাব
          </p>
        </div>

        <div className="text-xs text-slate-700 font-medium bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex flex-wrap items-center gap-3">
          <span>মোট পাড়া: <strong className="text-emerald-800 font-bold">{formatNumberBengali(neighborhoods.length)}</strong> টি</span>
          <span>·</span>
          <span>মোট গ্রাহক: <strong className="text-slate-900 font-bold">{formatNumberBengali(dues.length)}</strong> জন</span>
          <span>·</span>
          <span className="text-emerald-700 font-semibold">নগদ: <strong>{formatNumberBengali(totalAllCashCusts)}</strong> জন</span>
          <span>·</span>
          <span className="text-rose-700 font-semibold">বকেয়া: <strong>{formatNumberBengali(totalAllDueCusts)}</strong> জন</span>
        </div>
      </div>

      {/* Add New Neighborhood Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>নতুন পাড়া বা মহল্লা যুক্ত করুন</span>
        </h4>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">পাড়ার নাম *</label>
            <input
              type="text"
              required
              placeholder="যেমন: পূর্ব মোল্লাপাড়া"
              value={newNeighName}
              onChange={(e) => setNewNeighName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">এলাকার বর্ণনা / ল্যান্ডমার্ক (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="যেমন: স্কুল সংলগ্ন ও বটতলা"
              value={newNeighDesc}
              onChange={(e) => setNewNeighDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'যোগ হচ্ছে...' : 'যুক্ত করুন'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Neighborhood Grid & Quick Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>বিদ্যমান পাড়া ও মহল্লার সংক্ষিপ্ত পরিসংখ্যান</span>
            </h4>
            <p className="text-[11px] text-slate-500">প্রতিটি পাড়ায় নগদ ও বাকি কতজন গ্রাহক এবং মোট কত টাকার কেনাকাটা হয়েছে দেখুন</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="পাড়া খুঁজুন..."
              value={neighSearchQuery}
              onChange={(e) => setNeighSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNeighborhoods.map((n) => {
            const stats = getNeighborhoodStats(n.name);
            const isSelected = selectedNeighborhoodFilter === n.name;

            return (
              <div
                key={n.id}
                className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{n.name}</span>
                      </h5>
                      {n.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{n.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(n)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                        title="এডিট"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id, n.name)}
                        className="p-1 text-rose-400 hover:text-rose-600 rounded-md cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Neighborhood Metrics (Cash + Due customers) */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">মোট কাস্টমার</span>
                      <span className="font-bold text-slate-900 block">{formatNumberBengali(stats.customerCount)} জন</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        (নগদ: <span className="text-emerald-700 font-bold">{formatNumberBengali(stats.cashCustomersCount)}</span>, বাকি: <span className="text-rose-700 font-bold">{formatNumberBengali(stats.dueCustomersCount)}</span>)
                      </span>
                    </div>

                    <div className="bg-rose-50/60 p-2 rounded-lg">
                      <span className="text-[10px] text-rose-600 block">মোট বকেয়া</span>
                      <span className="font-bold text-rose-700 block">{formatTaka(stats.totalDue)}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        মোট বিক্রি: {formatTaka(stats.totalPurchases)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Trigger Button */}
                <div className="mt-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNeighborhoodFilter(isSelected ? 'all' : n.name)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ নির্বাচিত পাড়ার গ্রাহক দেখতেছেন' : 'এই পাড়ার সকল গ্রাহক ও খতিয়ান দেখুন →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Neighborhood / All Customers Details Table & Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {selectedNeighborhoodFilter === 'all'
                  ? 'সকল পাড়ার সকল গ্রাহক (নগদ ও বাকি)'
                  : `"${selectedNeighborhoodFilter}" পাড়ার সকল গ্রাহক ও লেনদেনের খতিয়ান`}
              </h4>
              <p className="text-[11px] text-slate-500">
                মোট {formatNumberBengali(activeCustomers.length)} জন গ্রাহক তালিকাভুক্ত
              </p>
            </div>
          </div>

          {selectedNeighborhoodFilter !== 'all' && (
            <button
              onClick={() => setSelectedNeighborhoodFilter('all')}
              className="text-xs text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>সকল পাড়ার গ্রাহক দেখুন</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Customer Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Sub Filters: All vs Cash vs Due */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setCustomerTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-colors ${
                customerTypeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সকল গ্রাহক ({formatNumberBengali(baseCustomers.length)})
            </button>
            <button
              type="button"
              onClick={() => setCustomerTypeFilter('cash')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-colors ${
                customerTypeFilter === 'cash'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              🟢 নগদ ক্রেতা ({formatNumberBengali(baseCustomers.filter((c) => (c.totalDue || 0) === 0).length)})
            </button>
            <button
              type="button"
              onClick={() => setCustomerTypeFilter('due')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-colors ${
                customerTypeFilter === 'due'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              🔴 বকেয়াদার ({formatNumberBengali(baseCustomers.filter((c) => (c.totalDue || 0) > 0).length)})
            </button>
          </div>

          {/* Search within customers */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="গ্রাহকের নাম, মোবাইল বা ডাকনাম খুঁজুন..."
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Customer List: Dedicated Mobile Cards + Desktop Table */}
        {activeCustomers.length === 0 ? (
          <div className="p-10 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
            এই ফিল্টারে কোনো গ্রাহক পাওয়া যায়নি।
          </div>
        ) : (
          <>
            {/* 1. Mobile Phone Cards View (block md:hidden) */}
            <div className="md:hidden space-y-3">
              {activeCustomers.map((cust) => {
                const isDue = (cust.totalDue || 0) > 0;
                return (
                  <div
                    key={cust.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{cust.customerName}</h5>
                        {cust.fatherOrFarmName && (
                          <p className="text-[11px] text-slate-500">{cust.fatherOrFarmName}</p>
                        )}
                      </div>

                      {/* Status Badge */}
                      {isDue ? (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          বকেয়া: {formatTaka(cust.totalDue)}
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          🟢 নগদ ক্রেতা
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">মোবাইল</span>
                        <span className="font-medium">{cust.phone || 'দেওয়া হয়নি'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">পাড়া / মহল্লা</span>
                        <span className="font-medium text-slate-800">{cust.moholla || 'অন্যান্য'}</span>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-[10px] text-slate-400 block">মোট কেনাকাটা</span>
                        <span className="font-bold text-slate-900">{formatTaka(cust.lifetimePurchases || 0)}</span>
                      </div>
                    </div>

                    {/* Action Buttons for Mobile */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(cust)}
                        className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-300" />
                        <span>হিসাব ও মেমোর খতিয়ান</span>
                      </button>

                      {cust.phone && (
                        <button
                          type="button"
                          onClick={() => sendCustomerWhatsApp(cust)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer border border-emerald-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="WhatsApp মেসেজ"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (hidden md:table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-3">গ্রাহকের নাম ও পরিচয়</th>
                    <th className="py-3 px-3">মোবাইল নম্বর</th>
                    <th className="py-3 px-3">পাড়া / মহল্লা</th>
                    <th className="py-3 px-3 text-right">স্ট্যাটাস</th>
                    <th className="py-3 px-3 text-right">মোট বকেয়া</th>
                    <th className="py-3 px-3 text-right">মোট কেনাকাটা</th>
                    <th className="py-3 px-3 text-center">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCustomers.map((c) => {
                    const isDue = (c.totalDue || 0) > 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.customerName}</div>
                          {c.fatherOrFarmName && (
                            <div className="text-[11px] text-slate-500 font-normal">{c.fatherOrFarmName}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-mono">{c.phone || '—'}</td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                            {c.moholla || 'অন্যান্য'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isDue ? (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              বকেয়াদার
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ১০০% নগদ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-700">
                          {formatTaka(c.totalDue)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-800 font-semibold">
                          {formatTaka(c.lifetimePurchases || 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer(c)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-slate-300" />
                              <span>খতিয়ান ও মেমো</span>
                            </button>

                            {c.phone && (
                              <button
                                type="button"
                                onClick={() => sendCustomerWhatsApp(c)}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Customer Detail & Memo History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedCustomer.customerName}</span>
                  {(selectedCustomer.totalDue || 0) === 0 ? (
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      🟢 নগদ ক্রেতা (পরিশোধিত)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      🔴 বকেয়া: {formatTaka(selectedCustomer.totalDue)}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCustomer.fatherOrFarmName && `${selectedCustomer.fatherOrFarmName} · `}
                  পাড়া: {selectedCustomer.moholla || 'অন্যান্য'}
                  {selectedCustomer.phone && ` · মোবাইল: ${selectedCustomer.phone}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="overflow-y-auto flex-1 py-4 space-y-4">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">মোট কেনাকাটা</span>
                  <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                    {formatTaka(selectedCustomer.lifetimePurchases || 0)}
                  </strong>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">পরিশোধিত টাকা</span>
                  <strong className="text-sm font-bold text-emerald-800 block mt-0.5">
                    {formatTaka((selectedCustomer.lifetimePurchases || 0) - (selectedCustomer.totalDue || 0))}
                  </strong>
                </div>

                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-700 block">বর্তমান বকেয়া</span>
                  <strong className="text-sm font-bold text-rose-800 block mt-0.5">
                    {formatTaka(selectedCustomer.totalDue || 0)}
                  </strong>
                </div>
              </div>

              {/* If customer has due: Quick Payment Taking Form */}
              {(selectedCustomer.totalDue || 0) > 0 && onRecordDuePayment && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-700" />
                      <span>বাকি জমা নিন (Payment Entry)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-rose-700">
                      বাকি আছে: {formatTaka(selectedCustomer.totalDue)}
                    </span>
                  </div>

                  <form onSubmit={handlePaymentInsideModal} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    <div className="sm:col-span-5">
                      <input
                        type="number"
                        min={1}
                        max={selectedCustomer.totalDue}
                        placeholder="জমার পরিমাণ (টাকা)"
                        value={paymentAmount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPaymentAmount(val === '' ? '' : parseFloat(val));
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="রসিদ নোট (যেমন: নগদ জমা)"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        disabled={isSubmittingPayment || typeof paymentAmount !== 'number' || paymentAmount <= 0}
                        className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer transition-colors disabled:opacity-50 min-h-[34px]"
                      >
                        {isSubmittingPayment ? 'জমা হচ্ছে...' : 'জমা রসিদ করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Transactions & Memo Timeline */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>লেনদেন ও মেমোর ইতিহাস</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    মোট {formatNumberBengali(selectedCustomer.history?.length || 0)} টি রেকর্ড
                  </span>
                </h5>

                {!selectedCustomer.history || selectedCustomer.history.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                    এখনো কোনো পূর্ববর্তী লেনদেনের রেকর্ড পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.history.map((rec) => {
                      const isCashSale = rec.type === 'cash_sale';
                      const isSaleDue = rec.type === 'sale_due';
                      const isPayment = rec.type === 'payment_received';

                      // Find matching order if memoNo exists
                      const matchingOrder = rec.memoNo
                        ? orders.find((o) => o.memoNo === rec.memoNo)
                        : null;

                      return (
                        <div
                          key={rec.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isCashSale && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  নগদ বিক্রয় (পরিশোধিত)
                                </span>
                              )}
                              {isSaleDue && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  বাকি বিক্রয় (বকেয়া)
                                </span>
                              )}
                              {isPayment && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  বাকি জমা রসিদ
                                </span>
                              )}

                              {rec.memoNo && (
                                <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                                  {rec.memoNo}
                                </span>
                              )}

                              <span className="text-slate-400 text-[11px]">
                                {getBengaliDate(rec.date)}
                              </span>
                            </div>

                            {rec.note && (
                              <p className="text-slate-600 font-medium">{rec.note}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                            <span
                              className={`text-sm font-bold ${
                                isPayment
                                  ? 'text-emerald-700'
                                  : isSaleDue
                                  ? 'text-rose-700'
                                  : 'text-slate-900'
                              }`}
                            >
                              {isPayment ? `-${formatTaka(rec.amount)}` : formatTaka(rec.amount)}
                            </span>

                            {matchingOrder && onViewMemo && (
                              <button
                                type="button"
                                onClick={() => onViewMemo(matchingOrder)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <Receipt className="w-3 h-3 text-slate-600" />
                                <span>মেমো প্রিন্ট</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
              {selectedCustomer.phone && (
                <button
                  type="button"
                  onClick={() => sendCustomerWhatsApp(selectedCustomer)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp-এ খতিয়ান পাঠান</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Neighborhood Modal */}
      {editingNeigh && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">পাড়ার নাম সংশোধন</h4>
              <button
                type="button"
                onClick={() => setEditingNeigh(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পাড়ার নাম *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">বর্ণনা</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNeigh(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
