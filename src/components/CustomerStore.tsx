import React, { useState } from 'react';
import { Product, Order, OrderItem, Neighborhood, PaymentMethod, ShopSettings } from '../types';
import { formatTaka, formatNumberBengali, getBDBusinessDate } from '../services/firebaseService';
import { Search, Phone, MapPin, Truck, Award, Shield, CheckCircle2, X, ShoppingBag, ArrowRight, CreditCard, Banknote } from 'lucide-react';
import { DEFAULT_PRODUCT_IMAGE, FALLBACK_SVG_DATA } from '../utils/imageUtils';
import { StoreBrandShowcase } from './StoreBrandShowcase';
import { AgencyFooter } from './AgencyFooter';
import { INITIAL_SETTINGS } from '../services/initialData';

interface CustomerStoreProps {
  products: Product[];
  neighborhoods: Neighborhood[];
  onDirectOrder: (order: Order) => Promise<void>;
  onOrderSuccess: (order: Order) => void;
  shopPhone: string;
  shopAddress: string;
  settings?: ShopSettings;
}

export const CustomerStore: React.FC<CustomerStoreProps> = ({
  products,
  neighborhoods,
  onDirectOrder,
  onOrderSuccess,
  shopPhone,
  shopAddress,
  settings,
}) => {
  const effectiveSettings = settings || {
    ...INITIAL_SETTINGS,
    phone: shopPhone || INITIAL_SETTINGS.phone,
    address: shopAddress || INITIAL_SETTINGS.address,
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Direct Order Modal State
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [orderQuantityKg, setOrderQuantityKg] = useState<number | ''>(50);
  const [packageType, setPackageType] = useState<'kg' | 'bag'>('bag');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerNickName, setCustomerNickName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedMoholla, setSelectedMoholla] = useState<string>('');
  const [addressDetail, setAddressDetail] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'pickup'>('home_delivery');

  // Payment Selection in Storefront
  const [paymentChoice, setPaymentChoice] = useState<'cash' | 'bkash_nagad' | 'due' | 'partial'>('cash');
  const [customPaidAmount, setCustomPaidAmount] = useState<number | ''>('');
  const [trxId, setTrxId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const categories = [
    { id: 'all', label: 'সকল পণ্য' },
    { id: 'গমের ভুসি', label: 'গমের ভুসি' },
    { id: 'খইল', label: 'সরিষার খইল' },
    { id: 'ফিড', label: 'দানাদার ফিড' },
    { id: 'ছোলা ও ডাল', label: 'ছোলা ও ডাল' },
    { id: 'খুদি ও কুঁড়া', label: 'খুদি ও কুঁড়া' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const handleOpenOrder = (product: Product) => {
    setOrderingProduct(product);
    const defaultKg = product.bagWeightKg || 50;
    setOrderQuantityKg(defaultKg);
    setPackageType('bag');
    setPaymentChoice('cash');
    setCustomPaidAmount('');
    setTrxId('');
    setFormError('');
  };

  const currentKg = typeof orderQuantityKg === 'number' ? orderQuantityKg : 0;

  const calculateTotalPrice = (product: Product, kg: number, isBag: boolean) => {
    if (isBag && kg === product.bagWeightKg && product.bagSellPrice > 0) {
      return product.bagSellPrice;
    }
    return Math.round(kg * product.sellPricePerKg);
  };

  const productTotal = orderingProduct
    ? calculateTotalPrice(orderingProduct, currentKg, packageType === 'bag')
    : 0;

  const deliveryCharge = deliveryType === 'home_delivery' ? (productTotal >= 3000 ? 0 : 60) : 0;
  const grandTotal = productTotal + deliveryCharge;

  // Calculate paid & due according to customer payment choice
  let calculatedPaidAmount = 0;
  let calculatedDueAmount = grandTotal;

  if (paymentChoice === 'cash' || paymentChoice === 'bkash_nagad') {
    calculatedPaidAmount = grandTotal;
    calculatedDueAmount = 0;
  } else if (paymentChoice === 'due') {
    calculatedPaidAmount = 0;
    calculatedDueAmount = grandTotal;
  } else if (paymentChoice === 'partial') {
    const entered = typeof customPaidAmount === 'number' ? customPaidAmount : 0;
    calculatedPaidAmount = Math.min(grandTotal, Math.max(0, entered));
    calculatedDueAmount = Math.max(0, grandTotal - calculatedPaidAmount);
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct) return;

    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setFormError('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।');
      return;
    }
    if (!selectedMoholla) {
      setFormError('অনুগ্রহ করে তালিকা থেকে আপনার পাড়া নির্বাচন করুন।');
      return;
    }
    if (currentKg <= 0) {
      setFormError('কেজির পরিমাণ অবশ্যই ০ এর বেশি হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const now = new Date().toISOString();
      const randomMemo = `MEMO-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderItem: OrderItem = {
        productId: orderingProduct.id,
        productName: orderingProduct.name,
        quantityKg: currentKg,
        packageType,
        unitPrice: orderingProduct.sellPricePerKg,
        buyPricePerKg: orderingProduct.buyPricePerKg,
        total: productTotal,
      };

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        memoNo: randomMemo,
        customerId: `cust-online-${Date.now()}`,
        businessDate: getBDBusinessDate(now),
        customerName: customerName.trim(),
        customerNickName: customerNickName.trim() || undefined,
        phone: customerPhone.trim(),
        moholla: selectedMoholla,
        villageAddress: addressDetail.trim() ? `${selectedMoholla}, ${addressDetail.trim()}` : selectedMoholla,
        deliveryType,
        paymentMethod: paymentChoice,
        totalAmount: grandTotal,
        paidAmount: calculatedPaidAmount,
        dueAmount: calculatedDueAmount,
        items: [orderItem],
        status: 'pending',
        source: 'online',
        createdAt: now,
        updatedAt: now,
        note: trxId ? `বিকাশ/নগদ TrxID: ${trxId}` : undefined,
      };

      await onDirectOrder(newOrder);
      setOrderingProduct(null);
      // Reset form
      setCustomerName('');
      setCustomerNickName('');
      setCustomerPhone('');
      setSelectedMoholla('');
      setAddressDetail('');
      onOrderSuccess(newOrder);
    } catch (err) {
      setFormError('অর্ডারটি জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img
            src="./images/hero_cattle_feed_store_1792082237019.jpg"
            alt="মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-800/80 border border-emerald-600/40 rounded-lg text-emerald-200 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
              <span>🌾 ১০০% খাঁটি ও পুষ্টিকর গো-খাদ্য সরাসরি মোকাম থেকে</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
              মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার
            </h1>
            <p className="text-[11px] sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
              গাভীর দুধ উৎপাদন বৃদ্ধি ও মোটাতাজাকরণের সেরা মানের লাল গমের ভুসি, ঘানির সরিষার খইল, ভাঙা ছোলা ও ডেইরি ফিড।
            </p>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-300">
              <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>দ্রুত ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>ভেজালমুক্ত গুণমান</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>হটলাইন: {shopPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Search & Category Filter */}
        <div className="space-y-3 mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="পণ্য বা ভুসির নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  মুছুন
                </button>
              )}
            </div>

            <div className="text-xs text-slate-600 font-medium">
              উপলব্ধ পণ্য: <strong className="font-bold text-emerald-800">{formatNumberBengali(filteredProducts.length)}</strong> টি
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer min-h-[36px] ${
                  selectedCategory === c.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid: 2 columns on mobile, 3-4 columns on tablet/desktop */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">অন্য কোনো নাম দিয়ে চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => {
              const defaultBagWeight = product.bagWeightKg || 50;
              const hasStock = product.stockKg > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <img
                        src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_SVG_DATA;
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[11px] font-medium px-2 py-0.5 rounded">
                        {product.category}
                      </div>

                      {product.stockKg <= product.minStockAlertKg && product.stockKg > 0 && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded">
                          সীমিত স্টক
                        </div>
                      )}
                      {!hasStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                          স্টক শেষ
                        </div>
                      )}
                    </div>

                    {/* Details Body */}
                    <div className="p-2.5 sm:p-4">
                      <h3 className="text-xs sm:text-base font-bold text-slate-900 line-clamp-1 sm:line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {product.nutritionNote && (
                        <div className="hidden sm:block mt-2 p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 leading-snug">
                          🌱 {product.nutritionNote}
                        </div>
                      )}

                      {/* Pricing Info Box */}
                      <div className="mt-2.5 sm:mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-2 text-xs">
                        <div className="bg-emerald-50/70 p-1.5 sm:p-2 rounded-lg border border-emerald-100 flex justify-between items-center sm:block">
                          <span className="text-[9px] sm:text-[10px] text-slate-600 block">কেজি দর:</span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                            {formatTaka(product.sellPricePerKg)}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-1.5 sm:p-2 rounded-lg border border-slate-100 flex justify-between items-center sm:block">
                          <span className="text-[9px] sm:text-[10px] text-slate-500 block">
                            ১ বস্তা ({formatNumberBengali(defaultBagWeight)}কেজি):
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {formatTaka(product.bagSellPrice || product.sellPricePerKg * defaultBagWeight)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Order Button Footer */}
                  <div className="p-2.5 sm:p-4 pt-0">
                    <button
                      onClick={() => handleOpenOrder(product)}
                      disabled={!hasStock}
                      className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px] sm:min-h-[42px] shadow-xs ${
                        hasStock
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:bg-emerald-900'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{hasStock ? 'অর্ডার করুন' : 'স্টক শেষ'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Enterprise Brand Showcase (Editorial 2-Column Split, 3 Pillars, Contact Hub, Advisory) */}
      <StoreBrandShowcase settings={effectiveSettings} />

      {/* Premium Dark Minimalist Agency Footer (Dedicated to SHAHRIYAR LLC) */}
      <AgencyFooter />

      {/* Single-Step Direct Order Modal */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  <span>পণ্য অর্ডার ফর্ম</span>
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5 line-clamp-1">{orderingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setOrderingProduct(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitOrder} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                  ⚠️ {formError}
                </div>
              )}

              {/* 1. Quantity Selector */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ১. কত কেজি বা কয় বস্তা নিতে চান?
                </label>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[5, 10, 20, 25, 40, orderingProduct.bagWeightKg || 50].map((wt) => (
                    <button
                      type="button"
                      key={wt}
                      onClick={() => {
                        setOrderQuantityKg(wt);
                        setPackageType(wt === orderingProduct.bagWeightKg ? 'bag' : 'kg');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer min-h-[34px] ${
                        orderQuantityKg === wt
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {formatNumberBengali(wt)} কেজি {wt === orderingProduct.bagWeightKg ? '(১ বস্তা)' : ''}
                    </button>
                  ))}
                </div>

                {/* Custom Weight Input with Zero Fix */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600">কাস্টম কেজি লিখুন:</span>
                  <div className="relative w-36">
                    <input
                      type="number"
                      min={1}
                      max={orderingProduct.stockKg || 10000}
                      value={orderQuantityKg === '' ? '' : orderQuantityKg}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setOrderQuantityKg('');
                        } else {
                          const num = parseInt(val);
                          setOrderQuantityKg(isNaN(num) ? '' : num);
                          setPackageType(num === orderingProduct.bagWeightKg ? 'bag' : 'kg');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                      কেজি
                    </span>
                  </div>
                </div>

                {/* Realtime Price Calculation Card */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">পণ্যের মোট মূল্য:</span>
                  <span className="text-base font-bold text-emerald-800">
                    {formatTaka(productTotal)}
                  </span>
                </div>
              </div>

              {/* 2. Customer Information with Identifier */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ২. আপনার যোগাযোগের তথ্য
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ রবিউল ইসলাম"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>

                {/* Identifier / Nickname / Father's Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ডাকনাম / পিতার নাম / চেনার উপায় (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: হাশেমের ছেলে / মেম্বার রবিউল / রবিউল ডেইরি"
                    value={customerNickName}
                    onChange={(e) => setCustomerNickName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    (একই নামের একাধিক ব্যক্তি থাকলে দোকানদার আপনাকে সহজে চিনতে পারবেন)
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    মোবাইল নম্বর * (১১ ডিজিট)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 017XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>

                {/* Neighborhood Input or Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    আপনার পাড়া / মহল্লা {neighborhoods.length > 0 ? 'নির্বাচন করুন' : 'লিখুন'} *
                  </label>
                  {neighborhoods.length > 0 ? (
                    <select
                      required
                      value={selectedMoholla}
                      onChange={(e) => setSelectedMoholla(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-medium min-h-[40px]"
                    >
                      <option value="">-- তালিকা থেকে পাড়া নির্বাচন করুন --</option>
                      {neighborhoods.map((n) => (
                        <option key={n.id} value={n.name}>
                          {n.name} {n.description ? `(${n.description})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="যেমন: বাজার সংলগ্ন / মধ্যপাড়া"
                      value={selectedMoholla}
                      onChange={(e) => setSelectedMoholla(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-medium min-h-[40px]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    বাড়ির নাম / সুনির্দিষ্ট ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: বটতলা সংলগ্ন, তিন রাস্তার মোড়"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>
              </div>

              {/* 3. Delivery Method */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  ৩. কীভাবে পণ্য নিতে চান?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors min-h-[44px] ${
                      deliveryType === 'home_delivery'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === 'home_delivery'}
                      onChange={() => setDeliveryType('home_delivery')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div>হোম ডেলিভারি</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {productTotal >= 3000 ? 'ফ্রি ডেলিভারি' : 'চার্জ ৬০ টাকা'}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors min-h-[44px] ${
                      deliveryType === 'pickup'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === 'pickup'}
                      onChange={() => setDeliveryType('pickup')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div>দোকান থেকে সংগ্রহ</div>
                      <div className="text-[10px] text-slate-500 font-normal">কোনো চার্জ নেই</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 4. Payment Method Selection (নগদ, বিকাশ, বাকি, আংশিক বাকি) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ৪. কীভাবে টাকা পরিশোধ করতে চান? (পেমেন্ট পদ্ধতি)
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentChoice('cash')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all min-h-[44px] ${
                      paymentChoice === 'cash'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-4 h-4" />
                      <span>হ্যান্ড ক্যাশ / COD</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${paymentChoice === 'cash' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      পণ্য পেয়ে নগদ টাকা দিন
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChoice('bkash_nagad')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all min-h-[44px] ${
                      paymentChoice === 'bkash_nagad'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      <span>বিকাশ / নগদ</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${paymentChoice === 'bkash_nagad' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      মোবাইল ব্যাংকিং পেমেন্ট
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChoice('partial')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all min-h-[44px] ${
                      paymentChoice === 'partial'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-semibold">⚖️ আংশিক বাকি</div>
                    <div className={`text-[10px] mt-0.5 ${paymentChoice === 'partial' ? 'text-amber-100' : 'text-slate-500'}`}>
                      কিছু নগদ + কিছু বাকি
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChoice('due')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all min-h-[44px] ${
                      paymentChoice === 'due'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-semibold">📝 সম্পূর্ণ বাকি</div>
                    <div className={`text-[10px] mt-0.5 ${paymentChoice === 'due' ? 'text-rose-100' : 'text-slate-500'}`}>
                      খাতায় বকেয়া থাকবে
                    </div>
                  </button>
                </div>

                {/* Sub-inputs based on payment choice */}
                {paymentChoice === 'bkash_nagad' && (
                  <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-2 text-xs">
                    <div className="text-emerald-800 font-medium">
                      📱 দোকানের বিকাশ ও নগদ নম্বর: <strong>{shopPhone}</strong>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        ট্রানজাকশন আইডি (TrxID) — ঐচ্ছিক
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: 9J3K8LA"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {paymentChoice === 'partial' && (
                  <div className="p-3 bg-white border border-amber-300 rounded-xl space-y-2 text-xs">
                    <label className="block font-semibold text-slate-800 mb-1">
                      এখন নগদ কত টাকা পরিশোধ করবেন? *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={grandTotal}
                        placeholder="টাকার পরিমাণ লিখুন"
                        value={customPaidAmount === '' ? '' : customPaidAmount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPaidAmount(val === '' ? '' : (isNaN(parseFloat(val)) ? '' : parseFloat(val)));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">টাকা</span>
                    </div>
                    <div className="text-[11px] text-rose-700 font-semibold flex justify-between">
                      <span>অবশিষ্ট বাকি থাকবে:</span>
                      <strong>{formatTaka(calculatedDueAmount)}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary & Final Bill */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>পণ্যের মূল্য ({formatNumberBengali(currentKg)} কেজি):</span>
                  <span className="font-semibold text-slate-900">{formatTaka(productTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryCharge === 0 ? 'ফ্রি (৳০)' : formatTaka(deliveryCharge)}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-bold text-emerald-950">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {formatTaka(grandTotal)}
                  </span>
                </div>

                <div className="pt-1 border-t border-emerald-100 flex justify-between items-center text-xs font-semibold">
                  <span className="text-emerald-800">নগদ পরিশোধ: {formatTaka(calculatedPaidAmount)}</span>
                  <span className="text-rose-700">বাকি থাকবে: {formatTaka(calculatedDueAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderingProduct(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer border border-slate-200 min-h-[44px]"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                  ) : (
                    <>
                      <span>অর্ডার কনফার্ম করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
