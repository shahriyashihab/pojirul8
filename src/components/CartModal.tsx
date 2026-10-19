import React, { useState } from 'react';
import { OrderItem, Order, DeliveryType, PaymentMethod, ShopSettings } from '../types';
import { formatTaka, formatNumberBengali } from '../services/firebaseService';
import { X, Trash2, ArrowRight, CheckCircle2, Phone, MapPin, Truck, Store, Banknote, CreditCard, Clock } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onUpdateQuantity: (productId: string, quantityKg: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: ShopSettings;
  onSubmitOrder: (order: Order) => Promise<void>;
  onOrderSuccess: (order: Order) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  onSubmitOrder,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageAddress, setVillageAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home_delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [partialPaidAmount, setPartialPaidAmount] = useState<number | ''>('');
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const deliveryFee =
    deliveryType === 'home_delivery' && subtotal < settings.freeDeliveryMinAmount
      ? settings.deliveryCharge
      : 0;
  const grandTotal = subtotal + deliveryFee;

  const numPartialPaid = typeof partialPaidAmount === 'number' && !isNaN(partialPaidAmount) ? partialPaidAmount : 0;

  // Calculate paid & due amounts based on payment method
  let calculatedPaid = grandTotal;
  let calculatedDue = 0;

  if (paymentMethod === 'due') {
    calculatedPaid = 0;
    calculatedDue = grandTotal;
  } else if (paymentMethod === 'partial') {
    calculatedPaid = Math.min(grandTotal, Math.max(0, numPartialPaid));
    calculatedDue = grandTotal - calculatedPaid;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('আপনার কার্ট খালি। দয়া করে প্রথমে পণ্য যোগ করুন।');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('দয়া করে আপনার বা খামারের নাম লিখুন।');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 11) {
      setErrorMsg('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
      return;
    }

    if (!villageAddress.trim()) {
      setErrorMsg('দয়া করে আপনার গ্রাম, ইউনিয়ন বা পূর্ণাঙ্গ ঠিকানা লিখুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const memoNo = `MEMO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        memoNo,
        customerName: customerName.trim(),
        phone: phone.trim(),
        villageAddress: villageAddress.trim(),
        deliveryType,
        paymentMethod,
        totalAmount: grandTotal,
        paidAmount: calculatedPaid,
        dueAmount: calculatedDue,
        items: cartItems,
        status: 'pending',
        source: 'online',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        note: customerNote.trim(),
      };

      await onSubmitOrder(newOrder);
      onClearCart();
      onOrderSuccess(newOrder);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('অর্ডার সাবমিট করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">আপনার শপিং কার্ট ও অর্ডার</h2>
            <p className="text-xs text-slate-500">
              নির্বাচিত পণ্য ও ডেলিভারির সঠিক তথ্য দিয়ে অর্ডার নিশ্চিত করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Cart Item List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              আপনার কার্ট বর্তমানে খালি আছে।
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase text-slate-500">পণ্য তালিকা</div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {cartItems.map((item) => (
                  <div key={item.productId} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.productName}</h4>
                      <div className="text-xs text-slate-500">
                        {formatNumberBengali(item.quantityKg)} কেজি · প্রতি কেজি{' '}
                        {formatTaka(item.unitPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatTaka(item.total)}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="পণ্য বাতিল করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Payment Selection */}
          {cartItems.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Delivery Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  ডেলিভারির মাধ্যম নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home_delivery')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      deliveryType === 'home_delivery'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">হোম ডেলিভারি</div>
                      <div className="text-[11px] text-slate-500">
                        বাড়িতে বা খামারে সরাসরি মাল পৌঁছে দেওয়া হবে
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">দোকান থেকে সংগ্রহ</div>
                      <div className="text-[11px] text-slate-500">
                        সরাসরি আমাদের দোকানে এসে মাল তুলে নেবেন (৳০)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  পেমেন্ট পদ্ধতি নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="text-xs">নগদ / ক্যাশ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash_nagad')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bkash_nagad'
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="text-xs">বিকাশ / নগদ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('partial');
                      setPartialPaidAmount(Math.round(grandTotal / 2));
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'partial'
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="text-xs">আংশিক নগদ + বাকি</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('due')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'due'
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="text-xs">সম্পূর্ণ বাকি</div>
                  </button>
                </div>

                {/* Partial Payment Specific Input */}
                {paymentMethod === 'partial' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-900">
                      <span>বর্তমানে কত টাকা নগদ দিতে চান?</span>
                      <span className="font-bold tabular-nums">{formatTaka(calculatedPaid)}</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={grandTotal}
                      value={partialPaidAmount}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPartialPaidAmount(val === '' ? '' : parseFloat(val));
                      }}
                      placeholder="টাকার পরিমাণ লিখুন"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 tabular-nums font-bold"
                    />
                    <div className="text-[11px] text-amber-700">
                      বাকি থাকবে: <strong>{formatTaka(calculatedDue)}</strong> (এটি আপনার বাকির খাতায় যোগ হবে)
                    </div>
                  </div>
                )}

                {paymentMethod === 'bkash_nagad' && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
                    <div>
                      <strong>বিকাশ নম্বর:</strong> {settings.bkashNumber}
                    </div>
                    <div>
                      <strong>নগদ নম্বর:</strong> {settings.nagadNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      (টাকা পাঠানোর পর ট্রানজেকশন আইডি বা রেফারেন্সে আপনার ফোন নম্বর লিখে রাখবেন)
                    </div>
                  </div>
                )}

                {paymentMethod === 'due' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                    ℹ️ সম্পূর্ণ <strong>{formatTaka(grandTotal)}</strong> আপনার মোবাইল নম্বর অনুযায়ী বাকির খাতায় এন্ট্রি করা হবে।
                  </div>
                )}
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-700">ক্রেতার প্রয়োজনীয় তথ্য:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      আপনার নাম / ডেইরি ফার্মের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="যেমন: মোঃ রবিউল ইসলাম"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      মোবাইল নম্বর (১১ ডিজিট) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    গ্রাম, ইউনিয়ন, পাড়া বা ডেলিভারির সম্পূর্ণ ঠিকানা *
                  </label>
                  <input
                    type="text"
                    required
                    value={villageAddress}
                    onChange={(e) => setVillageAddress(e.target.value)}
                    placeholder="যেমন: থানা মোড় বাজার, তিন রাস্তার মোড় সংলগ্ন"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    অতিরিক্ত নির্দেশনা / নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="যেমন: বিকেলে গাড়ি পাঠাবেন বা আসার আগে ফোন করবেন"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>পণ্যের মোট মূল্য:</span>
                  <span className="font-bold tabular-nums">{formatTaka(subtotal)}</span>
                </div>
                {deliveryType === 'home_delivery' && (
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold tabular-nums">
                      {deliveryFee === 0 ? 'বিনামূল্যে' : formatTaka(deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-emerald-700 tabular-nums">{formatTaka(grandTotal)}</span>
                </div>
                {calculatedDue > 0 && (
                  <div className="pt-1 flex justify-between text-xs text-amber-700 font-semibold">
                    <span>নগদ জমা: {formatTaka(calculatedPaid)}</span>
                    <span>বাকি থাকবে: {formatTaka(calculatedDue)}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400"
              >
                {isSubmitting ? (
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <span>অর্ডার নিশ্চিত করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
