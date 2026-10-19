import React, { useState } from 'react';
import { CustomerDue, Order, Neighborhood, DuePaymentRecord } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../../services/firebaseService';
import { safeOpenUrl } from '../../utils/safeOpen';
import {
  BookOpen,
  Search,
  PlusCircle,
  Phone,
  MessageCircle,
  CheckCircle2,
  Calendar,
  X,
  History,
  ArrowUpDown,
  Download,
  Upload,
  MapPin,
  Building,
  User,
  Filter,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Printer
} from 'lucide-react';

interface AdminDueLedgerProps {
  dues: CustomerDue[];
  orders?: Order[];
  neighborhoods?: Neighborhood[];
  onRecordDuePayment: (customerId: string, amount: number, note?: string) => Promise<void>;
  onAddNewDueCustomer: (customer: CustomerDue) => Promise<void>;
  onMergeCustomers?: (sourceCustomerId: string, targetCustomerId: string) => Promise<void>;
  onImportDues?: (importedDues: CustomerDue[]) => Promise<void>;
  onViewMemo?: (order: Order) => void;
}

type SortOption = 'highest_due' | 'lowest_due' | 'name_asc' | 'date_recent' | 'lifetime_purchase';

export const AdminDueLedger: React.FC<AdminDueLedgerProps> = ({
  dues,
  orders = [],
  neighborhoods = [],
  onRecordDuePayment,
  onAddNewDueCustomer,
  onMergeCustomers,
  onImportDues,
  onViewMemo,
}) => {
  const [selectedMoholla, setSelectedMoholla] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('highest_due');

  // Payment Modal
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<CustomerDue | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>(1000);
  const [paymentNote, setPaymentNote] = useState<string>('নগদ বাকি জমা রসিদ');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Full Statement / History Modal
  const [statementCustomer, setStatementCustomer] = useState<CustomerDue | null>(null);
  const [statementTab, setStatementTab] = useState<'memos' | 'ledger'>('memos');
  const [orderFilterInModal, setOrderFilterInModal] = useState<'all' | 'cash' | 'due'>('all');

  // Merge Customer Modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState<string>('');
  const [mergeTargetId, setMergeTargetId] = useState<string>('');
  const [isMerging, setIsMerging] = useState(false);

  // New Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustFatherFarm, setNewCustFatherFarm] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustMoholla, setNewCustMoholla] = useState<string>(neighborhoods[0]?.name || '');
  const [newCustVillage, setNewCustVillage] = useState('');
  const [newCustOpeningDue, setNewCustOpeningDue] = useState<number | ''>(0);
  const [newCustLifetime, setNewCustLifetime] = useState<number | ''>(0);

  // Toast inside due ledger
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [ledgerViewMode, setLedgerViewMode] = useState<'all' | 'active_due' | 'cash_only'>('all');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const totalMarketDue = dues.reduce((sum, d) => sum + (d.totalDue || 0), 0);
  const dueCustomersCount = dues.filter((d) => (d.totalDue || 0) > 0).length;

  // Filter by Active Due, Moholla & Search
  let processedList = dues.filter((d) => {
    let matchDue = true;
    if (ledgerViewMode === 'active_due') matchDue = (d.totalDue || 0) > 0;
    else if (ledgerViewMode === 'cash_only') matchDue = (d.totalDue || 0) === 0;

    const matchMoholla = selectedMoholla === 'all' || (d.moholla || 'অন্যান্য') === selectedMoholla;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchDue && matchMoholla;

    const matchSearch =
      d.customerName.toLowerCase().includes(q) ||
      (d.fatherOrFarmName && d.fatherOrFarmName.toLowerCase().includes(q)) ||
      (d.phone && d.phone.includes(q)) ||
      (d.village && d.village.toLowerCase().includes(q)) ||
      (d.moholla && d.moholla.toLowerCase().includes(q));

    return matchDue && matchMoholla && matchSearch;
  });

  // Sort
  processedList.sort((a, b) => {
    if (sortOption === 'highest_due') return (b.totalDue || 0) - (a.totalDue || 0);
    if (sortOption === 'lowest_due') return (a.totalDue || 0) - (b.totalDue || 0);
    if (sortOption === 'name_asc') return a.customerName.localeCompare(b.customerName, 'bn');
    if (sortOption === 'lifetime_purchase') return (b.lifetimePurchases || 0) - (a.lifetimePurchases || 0);
    if (sortOption === 'date_recent') {
      const dateA = a.lastPaymentDate ? new Date(a.lastPaymentDate).getTime() : 0;
      const dateB = b.lastPaymentDate ? new Date(b.lastPaymentDate).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  // Record Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer) return;
    const numPay = typeof paymentAmount === 'number' && !isNaN(paymentAmount) ? paymentAmount : 0;
    if (numPay <= 0) return;

    setIsSubmittingPay(true);
    try {
      await onRecordDuePayment(paymentModalCustomer.id, numPay, paymentNote);
      triggerToast(`✅ ${paymentModalCustomer.customerName}-এর অনুকূলে ${formatTaka(numPay)} জমা রসিদ সম্পন্ন!`);
      setPaymentModalCustomer(null);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Merge Submit
  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) {
      triggerToast('⚠️ অনুগ্রহ করে দুটি আলাদা খাতা নির্বাচন করুন।');
      return;
    }
    if (!onMergeCustomers) return;

    const sourceCust = dues.find((c) => c.id === mergeSourceId);
    const targetCust = dues.find((c) => c.id === mergeTargetId);
    if (!sourceCust || !targetCust) return;

    let shouldProceed = true;
    try {
      shouldProceed = confirm(
        `আপনি কি নিশ্চিত যে "${sourceCust.customerName} (${sourceCust.moholla})" এর হিসাব "${targetCust.customerName} (${targetCust.moholla})" এর প্রধান খাতায় একত্র (Merge) করতে চান?`
      );
    } catch {
      shouldProceed = true;
    }

    if (shouldProceed) {
      setIsMerging(true);
      try {
        await onMergeCustomers(mergeSourceId, mergeTargetId);
        triggerToast(`✅ হিসাব একত্রীকরণ সফল হয়েছে!`);
        setShowMergeModal(false);
        setMergeSourceId('');
        setMergeTargetId('');
      } finally {
        setIsMerging(false);
      }
    }
  };

  // Add New Customer Submit
  const handleNewCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const openingDue = typeof newCustOpeningDue === 'number' && !isNaN(newCustOpeningDue) ? newCustOpeningDue : 0;
    const lifetime = typeof newCustLifetime === 'number' && !isNaN(newCustLifetime) ? newCustLifetime : 0;

    const today = new Date().toISOString().split('T')[0];
    const initialHistory: DuePaymentRecord[] = [];

    if (openingDue > 0) {
      initialHistory.push({
        id: `open-due-${Date.now()}`,
        date: today,
        type: 'sale_due',
        amount: openingDue,
        note: 'পূর্ববর্তী পূর্ব জের বকেয়া হিসাব',
      });
    }

    const newCust: CustomerDue = {
      id: `cust-${Date.now()}`,
      customerName: newCustName.trim(),
      fatherOrFarmName: newCustFatherFarm.trim() || undefined,
      phone: newCustPhone.trim() || '',
      moholla: newCustMoholla,
      village: newCustVillage.trim() || newCustMoholla,
      totalDue: openingDue,
      lifetimePurchases: lifetime || openingDue,
      lastPaymentDate: '',
      history: initialHistory,
    };

    await onAddNewDueCustomer(newCust);
    triggerToast(`✅ নতুন গ্রাহক "${newCust.customerName}" বাকির খাতায় যুক্ত হয়েছেন!`);
    setShowNewCustomerModal(false);

    // Reset
    setNewCustName('');
    setNewCustFatherFarm('');
    setNewCustPhone('');
    setNewCustVillage('');
    setNewCustOpeningDue(0);
    setNewCustLifetime(0);
  };

  // WhatsApp Alert
  const sendWhatsAppReminder = (cust: CustomerDue) => {
    if (!cust.phone) return;
    const cleanPhone = cust.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = `আসসালামু আলাইকুম ${cust.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার বর্তমান মোট বাকি রয়েছে ${formatTaka(cust.totalDue)}। সুবিধাজনক সময়ে দোকান বা বিকাশে পরিশোধ করার অনুরোধ রইল। ধন্যবাদ!`;
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
    safeOpenUrl(url);
  };

  // Helper to get orders associated with a customer for full statement (Only confirmed successful orders)
  const getCustomerOrders = (cust: CustomerDue) => {
    return orders.filter(
      (o) =>
        ((cust.phone && o.phone && cust.phone.length > 5 && o.phone.trim() === cust.phone.trim()) ||
          o.customerName.trim().toLowerCase() === cust.customerName.trim().toLowerCase()) &&
        o.status === 'confirmed'
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header & Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              গ্রাহক বকেয়া ও বাকির খাতা (Due Ledger)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            পাড়াভিত্তিক বকেয়া হিসাব, দৈনন্দিন কেনাকাটার পূর্ণাঙ্গ খতিয়ান, বাকি জমা এবং ডুপ্লিকেট গ্রাহক একত্রীকরণ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Merge Accounts Button */}
          <button
            type="button"
            onClick={() => setShowMergeModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>🔄 হিসাব একত্র করুন (Merge)</span>
          </button>

          {/* Add New Customer Button */}
          <button
            type="button"
            onClick={() => setShowNewCustomerModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>+ নতুন গ্রাহক যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">বাজারে মোট বকেয়া</span>
          <div className="text-xl sm:text-2xl font-bold text-rose-700 mt-1">
            {formatTaka(totalMarketDue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            সর্বমোট {formatNumberBengali(dueCustomersCount)} জন গ্রাহকের কাছে পাওনা
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">মোট রেজিস্টার্ড গ্রাহক</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {formatNumberBengali(dues.length)} জন
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block font-medium">
            {formatNumberBengali(dues.length - dueCustomersCount)} জনের বকেয়া শূন্য (পরিশোধিত)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">পাড়া / এলাকা কাভারেজ</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
            {formatNumberBengali(neighborhoods.length)} টি পাড়া
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            প্রতিটি পাড়ার পৃথক খতিয়ান ও ব্যালেন্স
          </span>
        </div>
      </div>

      {/* Search, Filter & Sort Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        {/* Toggle between All Customers, Active Dues Only and Cash/Settled Customers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 text-xs">
          <span className="text-slate-500 font-medium">প্রদর্শন:</span>
          <button
            type="button"
            onClick={() => setLedgerViewMode('all')}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              ledgerViewMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📋 সকল গ্রাহক ({formatNumberBengali(dues.length)} জন)
          </button>
          <button
            type="button"
            onClick={() => setLedgerViewMode('active_due')}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              ledgerViewMode === 'active_due'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🔴 বকেয়া খাতা ({formatNumberBengali(dueCustomersCount)} জন)
          </button>
          <button
            type="button"
            onClick={() => setLedgerViewMode('cash_only')}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              ledgerViewMode === 'cash_only'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🟢 নগদ ও পরিশোধিত ({formatNumberBengali(Math.max(0, dues.length - dueCustomersCount))} জন)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Search Box (6 cols) */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম, ডাকনাম, পিতার নাম, ফোন বা পাড়া দিয়ে সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Moholla Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={selectedMoholla}
              onChange={(e) => setSelectedMoholla(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">সকল পাড়া / মহল্লা</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="highest_due">সর্বোচ্চ বকেয়া আগে</option>
              <option value="lowest_due">সর্বনিম্ন বকেয়া আগে</option>
              <option value="name_asc">নাম অনুযায়ী (ক - হ)</option>
              <option value="lifetime_purchase">সর্বোচ্চ কেনাকাটা</option>
              <option value="date_recent">সাম্প্রতিক লেনদেন</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Due Ledger View: Mobile Cards for phone screens + Desktop Table for md+ */}
      {processedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
          কোনো গ্রাহক পাওয়া যায়নি। অনুসন্ধান শব্দ পরিবর্তন করে চেষ্টা করুন।
        </div>
      ) : (
        <>
          {/* 1. Mobile Phone Cards View (block md:hidden) */}
          <div className="md:hidden space-y-3">
            {processedList.map((cust) => {
              const hasDue = cust.totalDue > 0;
              return (
                <div
                  key={cust.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs transition-all space-y-3 ${
                    hasDue ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
                  }`}
                >
                  {/* Top: Customer Name & Moholla Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setStatementCustomer(cust)}
                      className="text-left cursor-pointer flex-1"
                    >
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{cust.customerName}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                          হিসাব ↗
                        </span>
                      </h4>
                      {cust.fatherOrFarmName && (
                        <p className="text-xs text-slate-500 mt-0.5">{cust.fatherOrFarmName}</p>
                      )}
                    </button>

                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{cust.moholla || 'অন্যান্য'}</span>
                    </span>
                  </div>

                  {/* Middle: Phone & Financials Row */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">মোবাইল:</span>
                      {cust.phone ? (
                        <a href={`tel:${cust.phone}`} className="font-medium text-emerald-800 hover:underline">
                          {cust.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">দেওয়া হয়নি</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">বর্তমান বকেয়া:</span>
                      <strong
                        className={`text-sm sm:text-base font-extrabold ${
                          hasDue ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatTaka(cust.totalDue || 0)}
                      </strong>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons (Touch Friendly min-h-[44px]) */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    {hasDue && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentModalCustomer(cust);
                          setPaymentAmount(Math.min(cust.totalDue, 1000));
                        }}
                        className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5 min-h-[42px]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>জমা নিন</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setStatementCustomer(cust)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                    >
                      <History className="w-4 h-4 text-slate-600" />
                      <span>খতিয়ান দেখুন</span>
                    </button>

                    {cust.phone && hasDue && (
                      <button
                        type="button"
                        onClick={() => sendWhatsAppReminder(cust)}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                        title="WhatsApp তাগাদা পাঠান"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop Table View (hidden md:block) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">গ্রাহকের নাম ও পরিচয়</th>
                    <th className="py-3 px-3">পাড়া / মহল্লা</th>
                    <th className="py-3 px-3">মোবাইল নম্বর</th>
                    <th className="py-3 px-3 text-right">মোট বকেয়া (টাকা)</th>
                    <th className="py-3 px-3 text-right">মোট কেনাকাটা</th>
                    <th className="py-3 px-3 text-center">সর্বশেষ লেনদেন</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedList.map((cust) => {
                    const hasDue = cust.totalDue > 0;

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Identifier - Clickable to open Statement */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer(cust)}
                            className="text-left group cursor-pointer"
                          >
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                              <span>{cust.customerName}</span>
                              <span className="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                (হিসাব দেখুন ↗)
                              </span>
                            </div>
                            {cust.fatherOrFarmName && (
                              <div className="text-[11px] text-slate-500 font-normal">
                                {cust.fatherOrFarmName}
                              </div>
                            )}
                          </button>
                        </td>

                        {/* Moholla */}
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                            {cust.moholla || 'অন্যান্য'}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {cust.phone || '—'}
                        </td>

                        {/* Total Due */}
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`text-sm font-bold font-mono ${
                              hasDue ? 'text-rose-700 font-extrabold' : 'text-emerald-700'
                            }`}
                          >
                            {formatTaka(cust.totalDue || 0)}
                          </span>
                        </td>

                        {/* Lifetime Purchases */}
                        <td className="py-3 px-3 text-right font-semibold text-slate-700">
                          {formatTaka(cust.lifetimePurchases || 0)}
                        </td>

                        {/* Last Payment */}
                        <td className="py-3 px-3 text-center text-slate-500">
                          {cust.lastPaymentDate ? getBengaliDate(cust.lastPaymentDate) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Collect Due Payment */}
                            {hasDue && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentModalCustomer(cust);
                                  setPaymentAmount(Math.min(cust.totalDue, 1000));
                                }}
                                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                                title="বাকি জমা রসিদ"
                              >
                                জমা নিন
                              </button>
                            )}

                            {/* Full Statement View */}
                            <button
                              type="button"
                              onClick={() => setStatementCustomer(cust)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                              title="পূর্ণাঙ্গ খতিয়ান ও বাজারের ইতিহাস"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Reminder */}
                            {cust.phone && hasDue && (
                              <button
                                type="button"
                                onClick={() => sendWhatsAppReminder(cust)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer"
                                title="WhatsApp তাগাদা পাঠান"
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
          </div>
        </>
      )}

      {/* 1. Full Statement / Customer Profile Modal */}
      {statementCustomer && (() => {
        const custOrders = getCustomerOrders(statementCustomer);
        const cashOrders = custOrders.filter((o) => (o.dueAmount || 0) === 0);
        const dueOrders = custOrders.filter((o) => (o.dueAmount || 0) > 0);
        const filteredModalOrders =
          orderFilterInModal === 'cash'
            ? cashOrders
            : orderFilterInModal === 'due'
            ? dueOrders
            : custOrders;

        const totalCashPaid = Math.max(0, (statementCustomer.lifetimePurchases || 0) - (statementCustomer.totalDue || 0));

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <User className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>{statementCustomer.customerName}</span>
                        {statementCustomer.totalDue > 0 ? (
                          <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                            বাকি খাতা
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            পরিশোধিত / নগদ গ্রাহক
                          </span>
                        )}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        {statementCustomer.fatherOrFarmName && <span>({statementCustomer.fatherOrFarmName})</span>}
                        <span>· পাড়া: {statementCustomer.moholla}</span>
                        {statementCustomer.phone && <span>· মোবাইল: <strong className="text-slate-700">{statementCustomer.phone}</strong></span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                    title="স্টেটমেন্ট প্রিন্ট"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatementCustomer(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 font-medium block">মোট কেনাকাটা</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block tabular-nums">
                    {formatTaka(statementCustomer.lifetimePurchases || 0)}
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-emerald-700 font-medium block">নগদ পরিশোধ</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-800 mt-0.5 block tabular-nums">
                    {formatTaka(totalCashPaid)}
                  </span>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <span className="text-rose-700 font-medium block">বর্তমান বকেয়া</span>
                  <span className="text-base sm:text-lg font-bold text-rose-800 mt-0.5 block tabular-nums">
                    {formatTaka(statementCustomer.totalDue || 0)}
                  </span>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl">
                  <span className="text-indigo-700 font-medium block">সফল মেমো সংখ্যা</span>
                  <span className="text-base sm:text-lg font-bold text-indigo-900 mt-0.5 block tabular-nums">
                    {formatNumberBengali(custOrders.length)} টি
                  </span>
                </div>
              </div>

              {/* Modal Tabs: Memos History vs Financial Ledger */}
              <div className="flex border-b border-slate-200 text-xs font-bold gap-4">
                <button
                  type="button"
                  onClick={() => setStatementTab('memos')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                    statementTab === 'memos'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>সফল মেমো ও অর্ডারের ইতিহাস ({formatNumberBengali(custOrders.length)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatementTab('ledger')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                    statementTab === 'ledger'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>জমা ও লেনদেন খতিয়ান ({formatNumberBengali(statementCustomer.history?.length || 0)})</span>
                </button>
              </div>

              {/* TAB 1: Memos and Orders History */}
              {statementTab === 'memos' && (
                <div className="space-y-3">
                  {/* Sub-filter for Memos */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOrderFilterInModal('all')}
                        className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                          orderFilterInModal === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        সব মেমো ({formatNumberBengali(custOrders.length)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilterInModal('cash')}
                        className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                          orderFilterInModal === 'cash'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        নগদ ক্রয় ({formatNumberBengali(cashOrders.length)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilterInModal('due')}
                        className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                          orderFilterInModal === 'due'
                            ? 'bg-rose-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        বাকি মেমো ({formatNumberBengali(dueOrders.length)})
                      </button>
                    </div>

                    <span className="text-slate-400 text-[11px]">
                      শুধুমাত্র নিশ্চিত ও সফল অর্ডার প্রদর্শিত হচ্ছে
                    </span>
                  </div>

                  {filteredModalOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      এই বিভাগে কোনো নিশ্চিত মেমো পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredModalOrders.map((ord) => {
                        const isCashOnly = (ord.dueAmount || 0) === 0;
                        return (
                          <div
                            key={ord.id}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-xs space-y-2 hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                                  #{ord.memoNo}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isCashOnly
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.paidAmount > 0
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isCashOnly
                                    ? 'সম্পূর্ণ নগদ পরিশোধ'
                                    : ord.paidAmount > 0
                                    ? 'আংশিক জমা'
                                    : 'সম্পূর্ণ বাকি'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {getBengaliDate(ord.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 sm:ml-auto">
                                <div className="text-right">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {formatTaka(ord.totalAmount)}
                                  </span>
                                  {ord.dueAmount > 0 && (
                                    <span className="text-[11px] text-rose-700 block font-semibold">
                                      বাকি: {formatTaka(ord.dueAmount)}
                                    </span>
                                  )}
                                </div>
                                {onViewMemo && (
                                  <button
                                    type="button"
                                    onClick={() => onViewMemo(ord)}
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>মেমো</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Products summary list */}
                            <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                              <div className="font-semibold text-slate-700 mb-1">ক্রয়কৃত পণ্যসমূহ:</div>
                              <div className="divide-y divide-slate-100">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="py-1 flex justify-between items-center text-[11px]">
                                    <span>
                                      • {it.productName} ({formatNumberBengali(it.quantityKg)} কেজি × {formatTaka(it.unitPrice)})
                                    </span>
                                    <span className="font-bold text-slate-800 tabular-nums">
                                      {formatTaka(it.totalPrice ?? it.total ?? 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Financial Ledger Transactions History */}
              {statementTab === 'ledger' && (
                <div className="space-y-2">
                  {(!statementCustomer.history || statementCustomer.history.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      কোনো লেনদেনের বিস্তারিত ইতিহাস নেই।
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[50vh] overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-3">তারিখ</th>
                            <th className="py-2.5 px-3">লেনদেনের বিবরণ / মেমো</th>
                            <th className="py-2.5 px-3">ধরন</th>
                            <th className="py-2.5 px-3 text-right">টাকা</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {statementCustomer.history.map((rec) => {
                            const isDue = rec.type === 'sale_due';
                            const isCash = rec.type === 'cash_sale';

                            return (
                              <tr key={rec.id} className="hover:bg-slate-50/60">
                                <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                  {getBengaliDate(rec.date)}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-slate-900">
                                    {rec.memoNo ? `মেমো নং ${rec.memoNo}` : 'বাকি জমা রসিদ'}
                                  </div>
                                  {rec.note && <div className="text-[11px] text-slate-500">{rec.note}</div>}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isDue
                                        ? 'bg-rose-100 text-rose-800'
                                        : isCash
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {isDue
                                      ? 'পণ্য বাকি ক্রয়'
                                      : isCash
                                      ? 'নগদ বিক্রয়'
                                      : 'নগদ জমা পরিশোধ'}
                                  </span>
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                  isDue ? 'text-rose-700' : isCash ? 'text-blue-700' : 'text-emerald-700'
                                }`}>
                                  {isDue
                                    ? `+${formatTaka(rec.amount)}`
                                    : isCash
                                    ? `${formatTaka(rec.amount)}`
                                    : `-${formatTaka(rec.amount)}`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  সর্বশেষ আপডেট: {getBengaliDate(new Date().toISOString())}
                </span>
                <button
                  type="button"
                  onClick={() => setStatementCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. Customer Merge Tool Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>গ্রাহক অ্যাকাউন্ট একত্রীকরণ (Customer Merge Tool)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              একই মানুষের নাম ভুলবশত আলাদাভাবে এন্ট্রি হলে (যেমন: রবিউল ও রবিউল ভাই), সেই দুটি খাতার সকল কেনাকাটা ও বকেয়া এক ক্লিকেই একটি প্রধান অ্যাকাউন্টে একত্র করুন।
            </p>

            <form onSubmit={handleMergeSubmit} className="space-y-3 text-xs">
              {/* Source Account (Will be merged and removed) */}
              <div>
                <label className="block font-semibold text-rose-700 mb-1">
                  ১. যে খাতাটি বাদ দিয়ে একত্র করতে চান (ভুল / ডুপ্লিকেট খাতা) *
                </label>
                <select
                  required
                  value={mergeSourceId}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg font-medium focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">-- ডুপ্লিকেট খাতা নির্বাচন করুন --</option>
                  {dues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} {c.fatherOrFarmName ? `(${c.fatherOrFarmName})` : ''} — [{c.moholla}] — বাকি: {formatTaka(c.totalDue)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Account (Will keep all records) */}
              <div>
                <label className="block font-semibold text-emerald-800 mb-1">
                  ২. যে প্রধান খাতায় সব হিসাব যুক্ত হবে (মূল / আসল খাতা) *
                </label>
                <select
                  required
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- আসল খাতা নির্বাচন করুন --</option>
                  {dues
                    .filter((c) => c.id !== mergeSourceId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} {c.fatherOrFarmName ? `(${c.fatherOrFarmName})` : ''} — [{c.moholla}] — বর্তমান বাকি: {formatTaka(c.totalDue)}
                      </option>
                    ))}
                </select>
              </div>

              {mergeSourceId && mergeTargetId && (
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl space-y-1 text-indigo-950">
                  <span className="font-bold block">একত্রীকরণের ফলাফল:</span>
                  <div>
                    উভয় খাতার মোট বকেয়া ও সকল অতীত কেনাকাটার মেমো প্রধান খাতায় যোগ হবে এবং ডুপ্লিকেট এন্ট্রিটি বন্ধ হবে।
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isMerging || !mergeSourceId || !mergeTargetId}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                >
                  {isMerging ? 'একত্র হচ্ছে...' : 'হিসাব একত্র করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Collect Due Payment Modal */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">বাকি জমা রসিদ এন্ট্রি</h4>
              <button
                type="button"
                onClick={() => setPaymentModalCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{paymentModalCustomer.customerName}</div>
              <div className="text-slate-500">পাড়া: {paymentModalCustomer.moholla}</div>
              <div className="text-rose-700 font-bold">
                বর্তমান বকেয়া: {formatTaka(paymentModalCustomer.totalDue)}
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">জমা টাকার পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalCustomer.totalDue}
                  value={paymentAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentAmount(val === '' ? '' : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                />

                {/* Quick Amount Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    amt <= paymentModalCustomer.totalDue && (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPaymentAmount(amt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        +{formatNumberBengali(amt)}৳
                      </button>
                    )
                  ))}
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(paymentModalCustomer.totalDue)}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ml-auto"
                  >
                    সম্পূর্ণ ({formatTaka(paymentModalCustomer.totalDue)})
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মন্তব্য / বিবরণ</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmittingPay ? 'জমা হচ্ছে...' : 'জমা সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add New Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900">নতুন গ্রাহক ও বাকির খাতা নিবন্ধন</h4>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNewCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ রবিউল ইসলাম"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ডাকনাম / পিতার নাম / খামারের নাম (চেনার উপায়)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: হাশেমের ছেলে / মেম্বার রবিউল"
                  value={newCustFatherFarm}
                  onChange={(e) => setNewCustFatherFarm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  placeholder="০১৭১২-৩৪৫৬৭৮"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পাড়া / মহল্লা নির্বাচন করুন *</label>
                <select
                  value={newCustMoholla}
                  onChange={(e) => setNewCustMoholla(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">প্রারম্ভিক বকেয়া (পূর্বের জের বাকি থাকলে)</label>
                <input
                  type="number"
                  min={0}
                  value={newCustOpeningDue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCustOpeningDue(val === '' ? '' : parseFloat(val));
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-rose-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
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
