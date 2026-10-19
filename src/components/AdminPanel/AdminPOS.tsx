import React, { useState, useEffect, useRef } from 'react';
import { Product, OrderItem, Order, CustomerDue, Neighborhood } from '../../types';
import { formatTaka, formatNumberBengali, getBDBusinessDate } from '../../services/firebaseService';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Search,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface AdminPOSProps {
  products: Product[];
  dues?: CustomerDue[];
  neighborhoods?: Neighborhood[];
  onCreatePOSOrder: (order: Order) => Promise<void>;
  onViewMemo: (order: Order) => void;
  onNavigateToOrders?: () => void;
}

export const AdminPOS: React.FC<AdminPOSProps> = ({
  products,
  dues = [],
  neighborhoods = [],
  onCreatePOSOrder,
  onViewMemo,
  onNavigateToOrders,
}) => {
  // Product Selector State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantityKg, setQuantityKg] = useState<number | ''>(50);
  const [customPricePerKg, setCustomPricePerKg] = useState<number | ''>(products[0]?.sellPricePerKg || 40);

  // Cart / Multi-Item Order List
  const [items, setItems] = useState<OrderItem[]>([]);

  // Customer Information & Smart Suggestion
  const [customerName, setCustomerName] = useState<string>('');
  const [customerNickName, setCustomerNickName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [moholla, setMoholla] = useState<string>(neighborhoods[0]?.name || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [previousDue, setPreviousDue] = useState<number>(0);

  // Suggestion Dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Payment State
  const [paymentMode, setPaymentMode] = useState<'cash' | 'due' | 'partial'>('cash');
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('pickup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentProduct = products.find((p) => p.id === selectedProductId);

  // Handle explicit product selection by user (updates default weight and price only on product switch)
  const handleSelectProduct = (newId: string) => {
    setSelectedProductId(newId);
    const prod = products.find((p) => p.id === newId);
    if (prod) {
      setCustomPricePerKg(prod.sellPricePerKg);
      setQuantityKg(prod.bagWeightKg || 50);
    }
  };

  // Initialize default product selection ONCE only if not yet set (NEVER reset while user is typing)
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      const first = products[0];
      setSelectedProductId(first.id);
      setCustomPricePerKg(first.sellPricePerKg);
      setQuantityKg(first.bagWeightKg || 50);
    }
  }, [products, selectedProductId]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter customers for auto-suggest
  const customerSuggestions = dues.filter((c) => {
    const q = customerName.trim().toLowerCase();
    if (!q || q.length < 1) return false;
    return (
      c.customerName.toLowerCase().includes(q) ||
      (c.fatherOrFarmName && c.fatherOrFarmName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.moholla && c.moholla.toLowerCase().includes(q))
    );
  });

  const handleSelectSuggestion = (cust: CustomerDue) => {
    setCustomerName(cust.customerName);
    setCustomerNickName(cust.fatherOrFarmName || '');
    setPhone(cust.phone || '');
    if (cust.moholla) {
      setMoholla(cust.moholla);
    }
    setSelectedCustomerId(cust.id);
    setPreviousDue(cust.totalDue || 0);
    setShowSuggestions(false);
  };

  const handleResetCustomer = () => {
    setCustomerName('');
    setCustomerNickName('');
    setPhone('');
    setSelectedCustomerId(null);
    setPreviousDue(0);
  };

  const numQty = typeof quantityKg === 'number' && !isNaN(quantityKg) ? quantityKg : 0;
  const numPrice = typeof customPricePerKg === 'number' && !isNaN(customPricePerKg) ? customPricePerKg : 0;
  const numPaid = typeof paidAmount === 'number' && !isNaN(paidAmount) ? paidAmount : 0;

  // Add Item to Bill
  const handleAddItem = () => {
    if (!currentProduct) return;
    if (numQty <= 0) {
      setErrorMsg('কেজির পরিমাণ ০ এর চেয়ে বেশি হতে হবে।');
      return;
    }

    if (numQty > currentProduct.stockKg) {
      setErrorMsg(`সতর্কতা: গুদামে বর্তমানে মাত্র ${formatNumberBengali(currentProduct.stockKg)} কেজি আছে!`);
    }

    const total = Math.round(numQty * numPrice);
    const newItem: OrderItem = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantityKg: numQty,
      packageType: numQty === currentProduct.bagWeightKg ? 'bag' : 'kg',
      unitPrice: numPrice,
      buyPricePerKg: currentProduct.buyPricePerKg,
      total,
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    const newSubtotal = newItems.reduce((sum, it) => sum + it.total, 0);

    // Update paid amount based on mode
    if (paymentMode === 'cash') {
      setPaidAmount(newSubtotal);
    } else if (paymentMode === 'due') {
      setPaidAmount(0);
    }
    setErrorMsg('');
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    const newSubtotal = updated.reduce((sum, it) => sum + it.total, 0);
    if (paymentMode === 'cash') {
      setPaidAmount(newSubtotal);
    } else if (paymentMode === 'due') {
      setPaidAmount(0);
    } else if (numPaid > newSubtotal) {
      setPaidAmount(newSubtotal);
    }
  };

  const subtotal = items.reduce((sum, it) => sum + it.total, 0);
  const dueAmount = Math.max(0, subtotal - numPaid);

  // Payment Mode Toggles
  const handlePaymentModeChange = (mode: 'cash' | 'due' | 'partial') => {
    setPaymentMode(mode);
    if (mode === 'cash') {
      setPaidAmount(subtotal);
    } else if (mode === 'due') {
      setPaidAmount(0);
    } else if (mode === 'partial') {
      setPaidAmount(Math.round(subtotal / 2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('কমপক্ষে একটি পণ্য তালিকায় যোগ করুন।');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে গ্রাহকের নাম লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const now = new Date().toISOString();
      const randomMemo = `MEMO-${Math.floor(1000 + Math.random() * 9000)}`;

      const finalCustomerId =
        selectedCustomerId ||
        dues.find((c) => {
          const nameMatch = c.customerName.trim().toLowerCase() === customerName.trim().toLowerCase();
          const mohollaMatch = !moholla || !c.moholla || c.moholla.trim().toLowerCase() === moholla.trim().toLowerCase();
          const nickMatch =
            !customerNickName.trim() ||
            !c.fatherOrFarmName ||
            c.fatherOrFarmName.trim().toLowerCase() === customerNickName.trim().toLowerCase();
          const phoneMatch = !phone.trim() || !c.phone || c.phone.trim() === phone.trim();
          return nameMatch && mohollaMatch && nickMatch && phoneMatch;
        })?.id ||
        `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newOrder: Order = {
        id: `pos-${Date.now()}`,
        memoNo: randomMemo,
        customerId: finalCustomerId,
        previousDue: previousDue,
        businessDate: getBDBusinessDate(now),
        customerName: customerName.trim(),
        customerNickName: customerNickName.trim() || undefined,
        phone: phone.trim() || '',
        moholla,
        villageAddress: `${moholla} (দোকান কাউন্টার বিক্রয়)`,
        deliveryType,
        paymentMethod: dueAmount > 0 ? (numPaid > 0 ? 'partial' : 'due') : 'cash',
        totalAmount: subtotal,
        paidAmount: numPaid,
        dueAmount,
        items,
        status: 'pending', // Saved as pending so shopkeeper can review on Orders page before confirming
        source: 'pos',
        createdAt: now,
        updatedAt: now,
      };

      await onCreatePOSOrder(newOrder);

      // Reset form
      setItems([]);
      handleResetCustomer();

      // Automatically navigate to orders page so user can review and confirm
      if (onNavigateToOrders) {
        onNavigateToOrders();
      }
    } catch (err) {
      setErrorMsg('মেমো সংরক্ষণ করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-700" />
            <span>কাউন্টার সেল ও ম্যানুয়াল মেমো তৈরি (Direct POS Counter Sale)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            দোকানে আসা গ্রাহকের জন্য একসাথে একাধিক পণ্য (চাল, ডাল, ভুসি ইত্যাদি) যোগ করে নগদ বা বাকি মেমো তৈরি করুন
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-3">
          <span>মোট পণ্য: <strong className="font-bold text-slate-900">{formatNumberBengali(products.length)}</strong> টি</span>
          <span>·</span>
          <span>নিবন্ধিত গ্রাহক: <strong className="font-bold text-slate-900">{formatNumberBengali(dues.length)}</strong> জন</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection & Bill Items (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Product Picker */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>১. মেমোতে পণ্য যোগ করুন (মাল্টি-পণ্য সাপোর্ট)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Product Select */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">পণ্য নির্বাচন করুন *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — [মজুত: {formatNumberBengali(p.stockKg)} কেজি] — দর: {formatTaka(p.sellPricePerKg)}/কেজি
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight KG */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পরিমাণ (কেজি) *</label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="number"
                    min={1}
                    value={quantityKg}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuantityKg(val === '' ? '' : parseFloat(val));
                    }}
                    className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                  {currentProduct?.bagWeightKg && (
                    <button
                      type="button"
                      onClick={() => setQuantityKg(currentProduct.bagWeightKg)}
                      className="shrink-0 px-2 sm:px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      ১ বস্তা ({formatNumberBengali(currentProduct.bagWeightKg)}কেজি)
                    </button>
                  )}
                </div>
              </div>

              {/* Price Per Kg */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিক্রয় দর (টাকা/কেজি)</label>
                <input
                  type="number"
                  min={1}
                  value={customPricePerKg}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomPricePerKg(val === '' ? '' : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Subtotal Preview & Add Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs">
                <span className="text-slate-500">আইটেম মূল্য: </span>
                <strong className="text-sm font-bold text-slate-900">
                  {formatTaka(Math.round(numQty * numPrice))}
                </strong>
                {currentProduct && (
                  <span className="text-[11px] text-slate-500 block">
                    বর্তমান গুদাম মজুত: {formatNumberBengali(currentProduct.stockKg)} কেজি
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>মেমোতে যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Current Bill Items Table */}
          {/* Current Bill Items: Mobile Cards View + Desktop Table View */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>মেমোভুক্ত পণ্যের তালিকা ({formatNumberBengali(items.length)} টি)</span>
              </h4>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-bold px-2 py-1"
                >
                  সব মুছুন
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                এখনো কোনো পণ্য যোগ করা হয়নি। উপরের ড্রপডাউন থেকে পণ্য নির্বাচন করে &quot;মেমোতে যোগ করুন&quot; চাপুন।
              </div>
            ) : (
              <>
                {/* 1. Mobile Phone Cards List (block sm:hidden) */}
                <div className="sm:hidden space-y-2.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {idx + 1}. {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-slate-700">
                            {formatNumberBengali(item.quantityKg)} কেজি
                          </span>
                          <span>×</span>
                          <span>{formatTaka(item.unitPrice)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {formatTaka(item.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 text-rose-500 hover:text-rose-700 active:bg-rose-100 rounded-lg cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          aria-label="পণ্য মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>সর্বমোট {formatNumberBengali(items.length)} টি পণ্য:</span>
                    <span className="text-sm font-extrabold text-emerald-800">{formatTaka(subtotal)}</span>
                  </div>
                </div>

                {/* 2. Desktop Table View (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                        <th className="py-2.5 px-3">পণ্য</th>
                        <th className="py-2.5 px-3">পরিমাণ</th>
                        <th className="py-2.5 px-3">দর (কেজি)</th>
                        <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                        <th className="py-2.5 px-3 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                          <td className="py-2.5 px-3 font-medium">{formatNumberBengali(item.quantityKg)} কেজি</td>
                          <td className="py-2.5 px-3">{formatTaka(item.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatTaka(item.total)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                              title="পণ্যটি মেমো থেকে মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info, Smart Typeahead & Payment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer Profile & Smart Autocomplete */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 relative" ref={suggestionRef}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>২. গ্রাহকের তথ্য ও পরিচিতি</span>
              </h4>
              {selectedCustomerId && (
                <button
                  type="button"
                  onClick={handleResetCustomer}
                  className="text-[11px] text-emerald-700 hover:underline cursor-pointer font-medium"
                >
                  নতুন গ্রাহক
                </button>
              )}
            </div>

            {/* Customer Name with Live Autocomplete Dropdown */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                গ্রাহকের নাম লিখুন * (টাইপ করলেই ড্রপডাউন সাজেস্ট করবে)
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: রবিউল ইসলাম"
                value={customerName}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setShowSuggestions(true);
                  if (selectedCustomerId) {
                    setSelectedCustomerId(null);
                    setPreviousDue(0);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              />

              {/* Floating Suggestions Dropdown */}
              {showSuggestions && customerSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    মিল পাওয়া সংরক্ষিত গ্রাহক ({formatNumberBengali(customerSuggestions.length)} জন)
                  </div>
                  {customerSuggestions.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(cust)}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          👤 {cust.customerName}
                          {cust.fatherOrFarmName && (
                            <span className="text-[11px] text-slate-500 font-normal ml-1">
                              ({cust.fatherOrFarmName})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>[{cust.moholla || 'অন্যান্য'}]</span>
                          {cust.phone && <span>· {cust.phone}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">পূর্বের বাকি</span>
                        <span className={`font-bold ${cust.totalDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {formatTaka(cust.totalDue)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Due Alert Banner if Selected Customer has Due */}
            {previousDue > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                <span>⚠️ এই গ্রাহকের পূর্বের বকেয়া রয়েছে:</span>
                <strong className="text-rose-700 font-bold">{formatTaka(previousDue)}</strong>
              </div>
            )}

            {/* Optional Nickname / Father's Name Identifier */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ডাকনাম / পিতার নাম / চেনার উপায় (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: হাশেমের ছেলে / মেম্বার রবিউল / ডেইরি ফার্ম"
                value={customerNickName}
                onChange={(e) => setCustomerNickName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                placeholder="০১৭১২-৩৪৫৬৭৮"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Dynamic Neighborhood Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                পাড়া / মহল্লা নির্বাচন করুন *
              </label>
              <select
                value={moholla}
                onChange={(e) => setMoholla(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Final Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span>৩. পরিশোধের ধরন ও মেমো কনফার্ম</span>
            </h4>

            {/* Payment Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handlePaymentModeChange('cash')}
                className={`py-2 px-2 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সম্পূর্ণ নগদ
              </button>
              <button
                type="button"
                onClick={() => handlePaymentModeChange('due')}
                className={`py-2 px-2 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  paymentMode === 'due'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সম্পূর্ণ বাকি
              </button>
              <button
                type="button"
                onClick={() => handlePaymentModeChange('partial')}
                className={`py-2 px-2 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  paymentMode === 'partial'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                আংশিক বাকি
              </button>
            </div>

            {/* Paid Amount Input */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">নগদ গ্রহণকৃত টাকা:</span>
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={paidAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaidAmount(val === '' ? '' : parseFloat(val));
                  }}
                  className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600">বর্তমান মেমোতে বাকি:</span>
                <strong className={`font-bold ${dueAmount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {formatTaka(dueAmount)}
                </strong>
              </div>
            </div>

            {/* Bill Summary Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">মেমোর সর্বমোট মূল্য:</span>
                <span className="font-bold text-slate-900">{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">নগদ ক্যাশে জমা হবে:</span>
                <span className="font-bold text-emerald-700">{formatTaka(numPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">বকেয়া লেজারে যুক্ত হবে:</span>
                <span className="font-bold text-rose-700">{formatTaka(dueAmount)}</span>
              </div>
              {previousDue > 0 && (
                <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs font-bold text-slate-900">
                  <span>সর্বমোট বকেয়া দাঁড়াবে:</span>
                  <span className="text-rose-800">{formatTaka(previousDue + dueAmount)}</span>
                </div>
              )}
            </div>

            {/* Submit / Proceed to Orders Button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 min-h-[46px]"
            >
              {isSubmitting ? (
                <span>মেমো তৈরি হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                  <span className="hidden sm:inline">মেমো তৈরি করুন ও অর্ডার তালিকায় যান (Review & Confirm)</span>
                  <span className="sm:hidden">মেমো সেভ করুন ও কনফার্মে যান</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 font-medium leading-relaxed">
              💡 মেমো তৈরি হয়ে সরাসরি লাইভ অর্ডার পেজে চলে যাবে। সেখানে পণ্য ও টাকার হিসাব যাচাই করে ১-ক্লিকে কনফার্ম করতে পারবেন।
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
