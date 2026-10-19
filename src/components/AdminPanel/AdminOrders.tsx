import React, { useState } from 'react';
import { Order, OrderStatus, Neighborhood, OrderItem } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../../services/firebaseService';
import { safeOpenUrl } from '../../utils/safeOpen';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  FileText,
  Phone,
  MessageCircle,
  Plus,
  MapPin,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  PackageCheck
} from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  neighborhoods?: Neighborhood[];
  onConfirmOrder: (orderId: string) => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onUpdateOrder?: (order: Order) => Promise<void>;
  onOpenNewManualOrder: () => void;
  onViewMemo: (order: Order) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  neighborhoods = [],
  onConfirmOrder,
  onCancelOrder,
  onUpdateOrder,
  onOpenNewManualOrder,
  onViewMemo,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'online' | 'pos'>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Expanded items for viewing multi-product breakdown
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Editing an existing order (in case mistake was made during entry)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerNickName, setEditCustomerNickName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMoholla, setEditMoholla] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editPaidAmount, setEditPaidAmount] = useState<number | ''>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Cancel Order Modal State (Reliable in-app confirmation)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  const statuses = [
    { id: 'all', label: 'সকল অর্ডার' },
    { id: 'pending', label: 'অপেক্ষমাণ (পেন্ডিং)' },
    { id: 'confirmed', label: 'কনফার্ম (সম্পন্ন)' },
    { id: 'cancelled', label: 'বাতিলকৃত অর্ডার' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchChannel = channelFilter === 'all' || o.source === channelFilter;
    const matchNeighborhood =
      neighborhoodFilter === 'all' ||
      (o.moholla && o.moholla.trim().toLowerCase() === neighborhoodFilter.trim().toLowerCase());

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.memoNo.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerNickName && o.customerNickName.toLowerCase().includes(q)) ||
      o.phone.includes(q) ||
      (o.moholla && o.moholla.toLowerCase().includes(q)) ||
      (o.villageAddress && o.villageAddress.toLowerCase().includes(q));

    return matchStatus && matchChannel && matchNeighborhood && matchSearch;
  });

  // Sort: Pending orders at the top, then sorted by newest date
  filteredOrders.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleConfirm = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await onConfirmOrder(orderId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenCancelModal = (order: Order) => {
    setOrderToCancel(order);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    setProcessingId(orderToCancel.id);
    try {
      await onCancelOrder(orderToCancel.id);
      setOrderToCancel(null);
    } finally {
      setIsCancelling(false);
      setProcessingId(null);
    }
  };

  const sendWhatsApp = (order: Order) => {
    const cleanPhone = order.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const itemsText = order.items.map((i) => `• ${i.productName}: ${i.quantityKg} কেজি (${formatTaka(i.totalPrice ?? i.total ?? 0)})`).join('\n');
    const text = `আসসালামু আলাইকুম ${order.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার মেমো নং ${order.memoNo} এর ক্রয় বিবরণী:\n\n${itemsText}\n\nমোট বিল: ${formatTaka(order.totalAmount)}\nনগদ জমা: ${formatTaka(order.paidAmount)}\nবকেয়া: ${formatTaka(order.dueAmount)}\n\nধন্যবাদ!`;
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
    safeOpenUrl(url);
  };

  // Start editing an order
  const handleStartEdit = (order: Order) => {
    setEditingOrder(order);
    setEditError(null);
    setEditCustomerName(order.customerName);
    setEditCustomerNickName(order.customerNickName || '');
    setEditPhone(order.phone || '');
    setEditMoholla(order.moholla || neighborhoods[0]?.name || '');
    setEditVillage(order.villageAddress || '');
    setEditItems([...order.items]);
    setEditPaidAmount(order.paidAmount);
  };

  // Modify item quantity or price inside edit modal
  const handleEditItemQty = (idx: number, qty: number | '') => {
    const updated = [...editItems];
    const item = { ...updated[idx] };
    (item as any).quantityKg = qty;
    const numQty = typeof qty === 'number' && !isNaN(qty) ? qty : 0;
    const unitPrice = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? item.unitPrice : 0;
    const calculatedTotal = Math.round(numQty * unitPrice);
    item.total = calculatedTotal;
    item.totalPrice = calculatedTotal;
    updated[idx] = item;
    setEditItems(updated);
  };

  const handleEditItemPrice = (idx: number, price: number | '') => {
    const updated = [...editItems];
    const item = { ...updated[idx] };
    (item as any).unitPrice = price;
    const numPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    const numQty = typeof item.quantityKg === 'number' && !isNaN(item.quantityKg) ? item.quantityKg : 0;
    const calculatedTotal = Math.round(numQty * numPrice);
    item.total = calculatedTotal;
    item.totalPrice = calculatedTotal;
    updated[idx] = item;
    setEditItems(updated);
  };

  const handleRemoveEditItem = (idx: number) => {
    if (editItems.length <= 1) {
      setEditError('অর্ডারে অন্তত একটি পণ্য থাকতে হবে।');
      setTimeout(() => setEditError(null), 3500);
      return;
    }
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !onUpdateOrder) return;

    const sanitizedItems = editItems.map((it) => {
      const qty = typeof it.quantityKg === 'number' && !isNaN(it.quantityKg) && it.quantityKg > 0 ? it.quantityKg : 1;
      const price = typeof it.unitPrice === 'number' && !isNaN(it.unitPrice) ? it.unitPrice : 0;
      const calculated = Math.round(qty * price);
      return {
        ...it,
        quantityKg: qty,
        unitPrice: price,
        total: calculated,
        totalPrice: calculated,
      };
    });

    const total = sanitizedItems.reduce((sum, it) => sum + (it.totalPrice ?? it.total ?? 0), 0);
    const numPaid = typeof editPaidAmount === 'number' && !isNaN(editPaidAmount) ? editPaidAmount : 0;
    const paid = Math.min(total, Math.max(0, numPaid));
    const due = Math.max(0, total - paid);

    const updated: Order = {
      ...editingOrder,
      customerName: editCustomerName.trim(),
      customerNickName: editCustomerNickName.trim() || undefined,
      phone: editPhone.trim(),
      moholla: editMoholla,
      villageAddress: editVillage.trim(),
      items: sanitizedItems,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentMethod: due > 0 ? (paid > 0 ? 'partial' : 'due') : 'cash',
      updatedAt: new Date().toISOString(),
    };

    setIsSavingEdit(true);
    try {
      await onUpdateOrder(updated);
      setEditingOrder(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header & New Manual Order Button */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              অর্ডার ও মেমো ব্যবস্থাপনা (Order Management)
            </h3>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{formatNumberBengali(pendingCount)} টি অপেক্ষমাণ (পেন্ডিং)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            কাউন্টার সেল বা অনলাইন থেকে আসা অর্ডারের আইটেম ও দর যাচাই করে ১-ক্লিকে নিশ্চিত করুন এবং মেমো প্রিন্ট করুন
          </p>
        </div>

        {/* PRIMARY ACTION: Create New Manual Order */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewManualOrder}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>+ নতুন কাউন্টার মেমো তৈরি করুন (POS)</span>
          </button>
        </div>
      </div>

      {/* Notice Banner for Pending Orders (Crucial protection against mistakes) */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {formatNumberBengali(pendingCount)} টি মেমো/অর্ডার যাচাই ও কনফার্মের অপেক্ষায় রয়েছে
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                অর্ডারের ৫টি বা ১০টি পণ্যের ফর্দ, কেজি ও দর ঠিক আছে কি না দেখে নিন। কোনো ভুল থাকলে "সংশোধন" করুন, তারপর "১-ক্লিক কনফার্ম" বাটনে চাপ দিয়ে চূড়ান্ত করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shrink-0 shadow-xs"
          >
            শুধু পেন্ডিং অর্ডারগুলো দেখুন
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="মেমো নং, গ্রাহকের নাম, ফোন, ডাকনাম বা পাড়া দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Filter */}
          <div className="sm:col-span-3">
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল পাড়া / মহল্লা</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Source Channels */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">অর্ডার চ্যানেল:</span>
          <button
            type="button"
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              channelFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব ({formatNumberBengali(orders.length)})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('pos')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              channelFilter === 'pos' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏪 কাউন্টার মেমো ({formatNumberBengali(orders.filter((o) => o.source === 'pos').length)})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('online')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
              channelFilter === 'online' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌐 অনলাইন অর্ডার ({formatNumberBengali(orders.filter((o) => o.source === 'online').length)})
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">কোনো অর্ডার পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করে চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isConfirmed = order.status === 'confirmed';
            const isUpdating = processingId === order.id;
            const isExpanded = expandedOrderIds[order.id] ?? (isPending && order.items.length <= 4);

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs transition-all space-y-4 ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/15 ring-2 ring-amber-400/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: Memo ID, Source, Badges & Customer Info */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {order.memoNo}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          order.source === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.source === 'online' ? '🌐 অনলাইন অর্ডার' : '🏪 কাউন্টার মেমো'}
                      </span>

                      {isPending ? (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>যাচাই ও কনফার্ম অপেক্ষমাণ</span>
                        </span>
                      ) : isConfirmed ? (
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>কনফার্ম সম্পন্ন</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                          বাতিলকৃত
                        </span>
                      )}

                      {order.moholla && (
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{order.moholla}</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-400 ml-auto sm:ml-0">
                        {getBengaliDate(order.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1">
                        <span>{order.customerName}</span>
                        {order.customerNickName && (
                          <span className="text-xs font-normal text-slate-500">
                            ({order.customerNickName})
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">
                        মোবাইল: <span className="font-mono text-slate-700 font-semibold">{order.phone || 'দেওয়া হয়নি'}</span>
                        {order.villageAddress && ` · ঠিকানা: ${order.villageAddress}`}
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown (Bill, Paid, Due) */}
                  <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-1 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200 md:w-52 text-right shrink-0">
                    <div>
                      <span className="text-[11px] text-slate-500 block md:inline md:mr-1">সর্বমোট বিল:</span>
                      <strong className="text-sm text-slate-900 font-bold">{formatTaka(order.totalAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block md:inline md:mr-1">নগদ পরিশোধ:</span>
                      <strong className="text-emerald-700 font-bold">{formatTaka(order.paidAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block md:inline md:mr-1">বকেয়া লেজার:</span>
                      <strong className={`font-bold ${order.dueAmount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                        {formatTaka(order.dueAmount)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Middle: Multi-Product Items Table (Addresses the 5 or 10 products breakdown requested by user) */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-2.5 sm:p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <PackageCheck className="w-4 h-4 text-emerald-700" />
                      <span>মেমোর অন্তর্ভুক্ত পণ্যের ফর্দ ({formatNumberBengali(order.items.length)} টি পণ্য)</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        · মোট পরিমাণ: {formatNumberBengali(order.items.reduce((s, i) => s + i.quantityKg, 0))} কেজি
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <span>{isExpanded ? 'লুকান' : 'বিস্তারিত দেখুন'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3">
                      {/* Mobile phone card list for order items */}
                      <div className="sm:hidden space-y-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 truncate">
                                {idx + 1}. {it.productName}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {formatNumberBengali(it.quantityKg)} কেজি × {formatTaka(it.unitPrice)}
                              </div>
                            </div>
                            <div className="text-right shrink-0 font-extrabold text-slate-900">
                              {formatTaka(it.totalPrice ?? it.total ?? 0)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-bold">
                              <th className="py-1.5 px-2">ক্রমিক</th>
                              <th className="py-1.5 px-2">পণ্যের নাম</th>
                              <th className="py-1.5 px-2 text-right">পরিমাণ</th>
                              <th className="py-1.5 px-2 text-right">কেজি দর</th>
                              <th className="py-1.5 px-2 text-right">মোট টাকা</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {order.items.map((it, idx) => (
                              <tr key={idx} className="hover:bg-white/80">
                                <td className="py-1.5 px-2 text-slate-400 font-mono">{idx + 1}</td>
                                <td className="py-1.5 px-2 font-semibold text-slate-800">{it.productName}</td>
                                <td className="py-1.5 px-2 text-right font-medium text-slate-700">
                                  {formatNumberBengali(it.quantityKg)} কেজি
                                </td>
                                <td className="py-1.5 px-2 text-right text-slate-600">
                                  {formatTaka(it.unitPrice)}
                                </td>
                                <td className="py-1.5 px-2 text-right font-bold text-slate-900">
                                  {formatTaka(it.totalPrice ?? it.total ?? 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Actions (Confirm, Edit, Print, WhatsApp, Cancel) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Confirmation Action for Pending Orders */}
                    {isPending && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleConfirm(order.id)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 min-h-[42px]"
                      >
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>{isUpdating ? 'কনফার্ম হচ্ছে...' : '১-ক্লিক কনফার্ম'}</span>
                      </button>
                    )}

                    {/* Re-confirm action for Cancelled Orders */}
                    {order.status === 'cancelled' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleConfirm(order.id)}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5 min-h-[42px]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>পুনরায় সক্রিয় / কনফার্ম করুন</span>
                      </button>
                    )}

                    {/* Edit Order button (Allows correcting mistakes before/after confirming) */}
                    {onUpdateOrder && isPending && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(order)}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>সংশোধন</span>
                      </button>
                    )}

                    {/* In-app reliable Cancel Button */}
                    {(isPending || isConfirmed) && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleOpenCancelModal(order)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors min-h-[42px] ${
                          isPending
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                        }`}
                        title={isConfirmed ? 'কনফার্মকৃত অর্ডার বাতিল ও হিসাব রোলব্যাক' : 'অর্ডার বাতিল করুন'}
                      >
                        {isConfirmed ? 'অর্ডার বাতিল' : 'বাতিল'}
                      </button>
                    )}
                  </div>

                  {/* Print & WhatsApp Actions */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <button
                      type="button"
                      onClick={() => onViewMemo(order)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 min-h-[42px] shadow-xs"
                    >
                      <FileText className="w-4 h-4 text-slate-300" />
                      <span>মেমো প্রিন্ট</span>
                    </button>

                    {order.phone && (
                      <button
                        type="button"
                        onClick={() => sendWhatsApp(order)}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                        title="WhatsApp-এ মেমোর কপি পাঠান"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Edit Modal (Allows modifying items, rates, customer details) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-600" />
                  <span>মেমো সংশোধন / এডিট (#{editingOrder.memoNo})</span>
                </h4>
                <p className="text-xs text-slate-500">
                  পণ্যের পরিমাণ, দর অথবা কাস্টমারের তথ্য সংশোধন করে সংরক্ষণ করুন
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="overflow-y-auto flex-1 py-4 space-y-4">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Customer Info Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ডাকনাম / পিতার নাম / খামার</label>
                  <input
                    type="text"
                    value={editCustomerNickName}
                    onChange={(e) => setEditCustomerNickName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পাড়া / মহল্লা</label>
                  <select
                    value={editMoholla}
                    onChange={(e) => setEditMoholla(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n.id} value={n.name}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List Modification */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  পণ্যের ফর্দ ও দর সংশোধন
                </h5>

                <div className="space-y-2">
                  {editItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {idx + 1}. {item.productName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="পণ্যটি বাদ দিন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">পরিমাণ (কেজি)</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantityKg}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleEditItemQty(idx, val === '' ? '' : parseFloat(val));
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-bold text-slate-900 min-h-[38px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">কেজি দর (৳)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleEditItemPrice(idx, val === '' ? '' : parseFloat(val));
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-semibold text-slate-800 min-h-[38px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paid & Due Calculation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>সর্বমোট বিল:</span>
                  <span>{formatTaka(editItems.reduce((s, it) => s + (it.totalPrice ?? it.total ?? 0), 0))}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700">নগদ গ্রহণকৃত টাকা:</span>
                  <input
                    type="number"
                    min={0}
                    max={editItems.reduce((s, it) => s + (it.totalPrice ?? it.total ?? 0), 0)}
                    value={editPaidAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditPaidAmount(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-32 px-3 py-1 bg-white border border-slate-300 rounded-lg text-right font-bold text-emerald-800"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
                  <span className="text-slate-700">বাকি লেজারে থাকবে:</span>
                  <span className="text-rose-700">
                    {formatTaka(
                      Math.max(
                        0,
                        editItems.reduce((s, it) => s + (it.totalPrice ?? it.total ?? 0), 0) -
                          (typeof editPaidAmount === 'number' ? editPaidAmount : 0)
                      )
                    )}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingEdit ? 'সংরক্ষণ হচ্ছে...' : 'সংশোধন সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal (Reliable in-app confirmation) */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">অর্ডার বাতিল নিশ্চিতকরণ</h4>
                  <p className="text-xs text-slate-500 font-mono">মেমো #{orderToCancel.memoNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহকের নাম:</span>
                <span className="font-bold text-slate-800">{orderToCancel.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোট বিলের পরিমাণ:</span>
                <span className="font-bold text-slate-900">{formatTaka(orderToCancel.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বর্তমান স্ট্যাটাস:</span>
                <span className="font-bold">
                  {orderToCancel.status === 'confirmed' ? (
                    <span className="text-emerald-700">কনফার্ম সম্পন্ন</span>
                  ) : (
                    <span className="text-amber-700">পেন্ডিং (অপেক্ষমাণ)</span>
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {orderToCancel.status === 'confirmed'
                ? '⚠️ সতর্কবাণী: এই অর্ডারটি ইতিমধ্যে কনফার্ম করা হয়েছিল। এটি বাতিল করলে পণ্য মজুত (স্টক) স্বয়ংক্রিয়ভাবে গুদামে ফিরে আসবে এবং কাস্টমারের বাকি খাতা থেকে এই মেমোর হিসাব প্রত্যাহার হয়ে যাবে।'
                : 'আপনি কি নিশ্চিত যে এই অপেক্ষমাণ অর্ডারটি বাতিল করতে চান? বাতিল করলে এটি ড্যাশবোর্ড বা হিসাবে কোনো প্রভাব ফেলবে না।'}
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                না, ফিরে যান
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isCancelling ? 'বাতিল হচ্ছে...' : 'হ্যাঁ, বাতিল করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
