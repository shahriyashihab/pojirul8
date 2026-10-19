import React, { useState } from 'react';
import { Product, StockInRecord } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate, getBDBusinessDate } from '../../services/firebaseService';
import {
  Boxes,
  PlusCircle,
  Truck,
  AlertTriangle,
  ArrowDownRight,
  Edit,
  Save,
  X,
  History,
  Camera,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { ProductImageUploader } from '../ProductImageUploader';
import { DEFAULT_PRODUCT_IMAGE, FALLBACK_SVG_DATA } from '../../utils/imageUtils';

interface AdminInventoryProps {
  products: Product[];
  stockIns: StockInRecord[];
  onAddStockIn: (record: StockInRecord) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  stockIns,
  onAddStockIn,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock In Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [stockInKg, setStockInKg] = useState<number | ''>(1000);
  const [stockInBuyPrice, setStockInBuyPrice] = useState<number | ''>(38);
  const [supplierName, setSupplierName] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [stockInNote, setStockInNote] = useState<string>('');
  const [isSubmittingStockIn, setIsSubmittingStockIn] = useState(false);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('গমের ভুসি');
  const [newImageUrl, setNewImageUrl] = useState<string>(DEFAULT_PRODUCT_IMAGE);
  const [newBuyPrice, setNewBuyPrice] = useState<number | ''>(40);
  const [newSellPrice, setNewSellPrice] = useState<number | ''>(46);
  const [newBagWeight, setNewBagWeight] = useState<number | ''>(50);
  const [newStockKg, setNewStockKg] = useState<number | ''>(1000);
  const [newMinAlert, setNewMinAlert] = useState<number | ''>(200);
  const [newDescription, setNewDescription] = useState('');
  const [newNutrition, setNewNutrition] = useState('');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const totalStockKg = products.reduce((sum, p) => sum + p.stockKg, 0);
  const totalStockAssetValue = products.reduce((sum, p) => sum + p.stockKg * p.buyPricePerKg, 0);

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const numKg = typeof stockInKg === 'number' && !isNaN(stockInKg) ? stockInKg : 0;
    const numPrice = typeof stockInBuyPrice === 'number' && !isNaN(stockInBuyPrice) ? stockInBuyPrice : 0;
    if (numKg <= 0) return;

    setIsSubmittingStockIn(true);
    try {
      const now = new Date();
      const record: StockInRecord = {
        id: `stk-${Date.now()}`,
        date: getBDBusinessDate(now),
        productId: prod.id,
        productName: prod.name,
        quantityKg: numKg,
        buyPricePerKg: numPrice,
        totalCost: numKg * numPrice,
        supplierName: supplierName.trim(),
        invoiceNo: invoiceNo.trim(),
        note: stockInNote.trim(),
      };

      await onAddStockIn(record);
      setShowStockInModal(false);
      setSupplierName('');
      setInvoiceNo('');
      setStockInNote('');
    } finally {
      setIsSubmittingStockIn(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const numBuy = typeof newBuyPrice === 'number' && !isNaN(newBuyPrice) ? newBuyPrice : 0;
    const numSell = typeof newSellPrice === 'number' && !isNaN(newSellPrice) ? newSellPrice : 0;
    const numBag = typeof newBagWeight === 'number' && !isNaN(newBagWeight) && newBagWeight > 0 ? newBagWeight : 50;
    const numStock = typeof newStockKg === 'number' && !isNaN(newStockKg) ? newStockKg : 0;
    const numMin = typeof newMinAlert === 'number' && !isNaN(newMinAlert) ? newMinAlert : 50;

    setIsCreatingProduct(true);
    try {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: newName.trim(),
        category: newCategory,
        imageUrl: newImageUrl || DEFAULT_PRODUCT_IMAGE,
        buyPricePerKg: numBuy,
        sellPricePerKg: numSell,
        bagWeightKg: numBag,
        bagSellPrice: numSell * numBag,
        stockKg: numStock,
        minStockAlertKg: numMin,
        description: newDescription.trim() || 'উন্নত মানের সুষম পুষ্টিকর গো-খাদ্য।',
        nutritionNote: newNutrition.trim(),
      };

      await onUpdateProduct(newProduct);
      setShowNewProductModal(false);
      setNewName('');
      setNewDescription('');
      setNewNutrition('');
      setNewImageUrl(DEFAULT_PRODUCT_IMAGE);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const bagWeight = typeof editingProduct.bagWeightKg === 'number' && !isNaN(editingProduct.bagWeightKg) && editingProduct.bagWeightKg > 0 ? editingProduct.bagWeightKg : 50;
    const buyPrice = typeof editingProduct.buyPricePerKg === 'number' && !isNaN(editingProduct.buyPricePerKg) ? editingProduct.buyPricePerKg : 0;
    const sellPrice = typeof editingProduct.sellPricePerKg === 'number' && !isNaN(editingProduct.sellPricePerKg) ? editingProduct.sellPricePerKg : 0;
    const stockKg = typeof editingProduct.stockKg === 'number' && !isNaN(editingProduct.stockKg) ? editingProduct.stockKg : 0;
    const minAlert = typeof editingProduct.minStockAlertKg === 'number' && !isNaN(editingProduct.minStockAlertKg) ? editingProduct.minStockAlertKg : 50;
    await onUpdateProduct({
      ...editingProduct,
      bagWeightKg: bagWeight,
      buyPricePerKg: buyPrice,
      sellPricePerKg: sellPrice,
      bagSellPrice: sellPrice * bagWeight,
      stockKg,
      minStockAlertKg: minAlert,
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    let should = true;
    try {
      should = confirm(`আপনি কি নিশ্চিত যে "${name}" পণ্যটি সম্পূর্ণ মুছে ফেলতে চান?`);
    } catch {
      should = true;
    }
    if (should && onDeleteProduct) {
      await onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-700" />
            <span>গুদাম ও স্টক ব্যবস্থাপনা (Inventory Ledger)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            মজুত মালের হিসাব, মোকাম থেকে চালান এন্ট্রি ও বর্তমান ইনভেন্টরি সম্পদের মূল্য
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowStockInModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Truck className="w-4 h-4" />
            <span>+ নতুন চালান (স্টক ইন)</span>
          </button>

          <button
            onClick={() => setShowNewProductModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>+ নতুন পণ্য ও ছবি যোগ</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">দোকানের মোট পণ্য আইটেম</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatNumberBengali(products.length)} টি
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">মোট মজুত মালের ওজন</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {formatNumberBengali(totalStockKg)} কেজি
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            (প্রায় {formatNumberBengali(Math.round(totalStockKg / 50))} বস্তা)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">মোট অবিক্রীত মালের বাজার মূল্য</div>
          <div className="text-2xl font-bold text-blue-900 tabular-nums">
            {formatTaka(totalStockAssetValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">মোকামের ক্রয়মূল্য অনুযায়ী মূলধন</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            বর্তমান পণ্যের মজুত ও দর তালিকা
          </h4>
          <span className="text-xs text-slate-500">স্বয়ংক্রিয় স্টক হ্রাস চালু আছে</span>
        </div>

        {/* 1. Mobile Phone Cards View (block md:hidden) */}
        <div className="md:hidden space-y-3">
          {products.map((p) => {
            const isLow = p.stockKg <= p.minStockAlertKg;
            const assetVal = p.stockKg * p.buyPricePerKg;

            return (
              <div
                key={p.id}
                className={`p-3.5 bg-white rounded-xl border shadow-xs space-y-3 ${
                  isLow ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
                }`}
              >
                {/* Header: Photo, Name, Category & Bag Weight */}
                <div className="flex items-start gap-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.fallbackTried) {
                        target.dataset.fallbackTried = '1';
                        target.src = DEFAULT_PRODUCT_IMAGE;
                      } else {
                        target.src = FALLBACK_SVG_DATA;
                      }
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{p.name}</h4>
                      {isLow && (
                        <span className="text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 px-1.5 py-0.5 rounded shrink-0 animate-pulse">
                          স্বল্প মজুত
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        {p.category}
                      </span>
                      <span>·</span>
                      <span>১ বস্তা = {formatNumberBengali(p.bagWeightKg)} কেজি</span>
                    </div>
                  </div>
                </div>

                {/* 2x2 Financials and Stock Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">মোকাম ক্রয়দর</span>
                    <strong className="text-slate-800 tabular-nums">{formatTaka(p.buyPricePerKg)}/কেজি</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">বিক্রয়দর</span>
                    <strong className="text-emerald-800 font-extrabold tabular-nums">{formatTaka(p.sellPricePerKg)}/কেজি</strong>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">বর্তমান মজুত</span>
                    <span className={`font-bold tabular-nums ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatNumberBengali(p.stockKg)} কেজি
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({(p.stockKg / p.bagWeightKg).toFixed(1)} বস্তা)
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">মোট সম্পদ মূল্য</span>
                    <strong className="text-blue-900 tabular-nums font-bold">{formatTaka(assetVal)}</strong>
                  </div>
                </div>

                {/* Quick Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-600" />
                    <span>এডিট/ছবি</span>
                  </button>
                  {onDeleteProduct && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-colors flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>মুছুন</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Desktop Table View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3">পণ্যের নাম</th>
                <th className="py-2.5 px-3">ক্যাটাগরি</th>
                <th className="py-2.5 px-3 text-right">মোকাম ক্রয়দর</th>
                <th className="py-2.5 px-3 text-right">খুচরা বিক্রয়দর</th>
                <th className="py-2.5 px-3 text-right">বর্তমান মজুত</th>
                <th className="py-2.5 px-3 text-right">মোট সম্পদ মূল্য</th>
                <th className="py-2.5 px-3 text-center">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isLow = p.stockKg <= p.minStockAlertKg;
                const assetVal = p.stockKg * p.buyPricePerKg;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.dataset.fallbackTried) {
                              target.dataset.fallbackTried = '1';
                              target.src = DEFAULT_PRODUCT_IMAGE;
                            } else {
                              target.src = FALLBACK_SVG_DATA;
                            }
                          }}
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">
                            ১ বস্তা = {formatNumberBengali(p.bagWeightKg)} কেজি
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.category}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-medium">
                      {formatTaka(p.buyPricePerKg)}/কেজি
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-900 font-bold">
                      {formatTaka(p.sellPricePerKg)}/কেজি
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-extrabold tabular-nums ${
                          isLow ? 'text-rose-600' : 'text-emerald-800'
                        }`}
                      >
                        {formatNumberBengali(p.stockKg)} কেজি
                      </span>
                      <div className="text-[10px] text-slate-500">
                        ({(p.stockKg / p.bagWeightKg).toFixed(1)} বস্তা)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-blue-900">
                      {formatTaka(assetVal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-xs font-semibold cursor-pointer transition-colors"
                          title="ছবি বা তথ্য এডিট করুন"
                        >
                          <Edit className="w-3 h-3 text-emerald-600" />
                          <span>এডিট</span>
                        </button>
                        {onDeleteProduct && (
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded text-xs font-semibold cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>মুছুন</span>
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

      {/* Stock In Log History */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <History className="w-4 h-4 text-emerald-700" />
          <span>সাম্প্রতিক মোকাম চালান ও ক্রয় ইনভয়েসের তালিকা (Recent Stock-Ins)</span>
        </h4>

        {stockIns.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            এখনো কোনো ক্রয়ের চালান এন্ট্রি করা হয়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {stockIns.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-800">
                    {s.productName} — {formatNumberBengali(s.quantityKg)} কেজি
                  </div>
                  <div className="text-[11px] text-slate-500">
                    তারিখ: {getBengaliDate(s.date)} · চালান নং: {s.invoiceNo || '-'} · মোকাম: {s.supplierName || 'সাধারণ'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 tabular-nums">{formatTaka(s.totalCost)}</div>
                  <div className="text-[10px] text-slate-500">
                    দর: {formatTaka(s.buyPricePerKg)}/কেজি
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Stock In (Add Stock from Mokam) */}
      {showStockInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 relative">
            <button
              onClick={() => setShowStockInModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">মোকাম চালান ও স্টক বৃদ্ধি</h3>
            <p className="text-xs text-slate-500 mb-4">ট্রাক থেকে আসা নতুন মালের পরিমাণ ও কেনা দর এন্ট্রি করুন</p>

            <form onSubmit={handleStockInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পণ্য সিলেক্ট করুন:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((pr) => pr.id === e.target.value);
                    if (p) setStockInBuyPrice(p.buyPricePerKg);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">নতুন মালের ওজন (কেজি):</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockInKg}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStockInKg(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কেনা দর (প্রতি কেজি ৳):</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stockInBuyPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStockInBuyPrice(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">সাপ্লায়ার / মোকামের নাম:</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="যেমন: কুষ্টিয়া ফ্লাওয়ার মিলস"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ইনভয়েস / চালান নম্বর:</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="যেমন: CH-908"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                <span>চালানের মোট ক্রয়মূল্য:</span>
                <span className="text-emerald-800 tabular-nums">
                  {formatTaka(
                    (typeof stockInKg === 'number' ? stockInKg : 0) *
                      (typeof stockInBuyPrice === 'number' ? stockInBuyPrice : 0)
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingStockIn}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                {isSubmittingStockIn ? 'সংরক্ষিত হচ্ছে...' : 'স্টক যোগ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Product */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNewProductModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">নতুন পণ্য যোগ করুন</h3>
            <p className="text-xs text-slate-500 mb-4">পণ্য তালিকা ও অনলাইন স্টোরে প্রদর্শনের জন্য ছবি ও তথ্য দিন</p>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3.5 text-xs">
              {/* Product Image Uploader */}
              <ProductImageUploader
                currentImageUrl={newImageUrl}
                onChange={setNewImageUrl}
                productName={newName || 'নতুন পণ্য'}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পণ্যের পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: লাল মোটা কানাডিয়ান ভুসি"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="গমের ভুসি">গমের ভুসি</option>
                    <option value="খইল">সরিষার খইল</option>
                    <option value="ফিড">দানাদার ফিড</option>
                    <option value="ছোলা ও ডাল">ছোলা ও ডাল</option>
                    <option value="খুদি ও কুঁড়া">খুদি ও কুঁড়া</option>
                    <option value="ভিটামিন ও খনিজ">ভিটামিন ও খনিজ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">১ বস্তার ওজন (কেজি)</label>
                  <input
                    type="number"
                    min={1}
                    value={newBagWeight}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewBagWeight(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোকাম ক্রয়দর (প্রতি কেজি ৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={newBuyPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewBuyPrice(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">খুচরা বিক্রয়দর (প্রতি কেজি ৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={newSellPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewSellPrice(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রারম্ভিক স্টক (কেজি)</label>
                  <input
                    type="number"
                    min={0}
                    value={newStockKg}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewStockKg(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কম স্টক সতর্কতা লেভেল (কেজি)</label>
                  <input
                    type="number"
                    min={0}
                    value={newMinAlert}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewMinAlert(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পণ্যের বিবরণ</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="যেমন: ১০০% পরিষ্কার ভুসি"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পুষ্টির উপকারিতা</label>
                <input
                  type="text"
                  value={newNutrition}
                  onChange={(e) => setNewNutrition(e.target.value)}
                  placeholder="যেমন: গাভীর দুধ বৃদ্ধি করে"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingProduct}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                {isCreatingProduct ? 'তৈরি হচ্ছে...' : 'পণ্য সংরক্ষণ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">পণ্য সম্পাদন (Edit Product)</h3>
            <p className="text-xs text-slate-500 mb-4">{editingProduct.name}</p>

            <form onSubmit={handleEditProductSubmit} className="space-y-3.5 text-xs">
              {/* Product Image Uploader in Edit Modal */}
              <ProductImageUploader
                currentImageUrl={editingProduct.imageUrl}
                onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                productName={editingProduct.name}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পণ্যের নাম</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value as any })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="গমের ভুসি">গমের ভুসি</option>
                    <option value="খইল">সরিষার খইল</option>
                    <option value="ফিড">দানাদার ফিড</option>
                    <option value="ছোলা ও ডাল">ছোলা ও ডাল</option>
                    <option value="খুদি ও কুঁড়া">খুদি ও কুঁড়া</option>
                    <option value="ভিটামিন ও খনিজ">ভিটামিন ও খনিজ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">১ বস্তার ওজন (কেজি)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingProduct.bagWeightKg ?? ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = val === '' ? ('' as any) : parseFloat(val);
                      setEditingProduct({
                        ...editingProduct,
                        bagWeightKg: num,
                        bagSellPrice: (editingProduct.sellPricePerKg || 0) * (typeof num === 'number' ? num : 0),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোকাম ক্রয়দর (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.buyPricePerKg ?? ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        buyPricePerKg: val === '' ? ('' as any) : parseFloat(val),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">খুচরা বিক্রয়দর (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.sellPricePerKg ?? ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = val === '' ? ('' as any) : parseFloat(val);
                      setEditingProduct({
                        ...editingProduct,
                        sellPricePerKg: num,
                        bagSellPrice: (typeof num === 'number' ? num : 0) * (editingProduct.bagWeightKg || 50),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">বর্তমান স্টক (কেজি)</label>
                  <input
                    type="number"
                    value={editingProduct.stockKg ?? ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        stockKg: val === '' ? ('' as any) : parseFloat(val),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সতর্কতা স্টক (কেজি)</label>
                  <input
                    type="number"
                    value={editingProduct.minStockAlertKg ?? ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        minStockAlertKg: val === '' ? ('' as any) : parseFloat(val),
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পণ্যের বিবরণ</label>
                <input
                  type="text"
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পুষ্টির উপকারিতা</label>
                <input
                  type="text"
                  value={editingProduct.nutritionNote || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, nutritionNote: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                আপডেট সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
