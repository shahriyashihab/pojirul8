import React, { useState } from 'react';
import { ShopSettings, ResetOptions } from '../../types';
import { Settings, Save, ShieldCheck, Download, CheckCircle2, Database, KeyRound, AlertTriangle, Trash2, X, CheckSquare, Square, Store } from 'lucide-react';

interface AdminSettingsProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
  onExportBackup: () => void;
  onResetSelectedData?: (
    options: ResetOptions,
    adminIdInput: string,
    passwordInput: string
  ) => Promise<{ success: boolean; message: string }>;
  onResetAllData?: (adminIdInput: string, passwordInput: string) => Promise<{ success: boolean; message: string }>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  onExportBackup,
  onResetSelectedData,
  onResetAllData,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Granular Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAdminId, setResetAdminId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmedCheck, setResetConfirmedCheck] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Individual selection checkboxes for reset
  const [resetOptions, setResetOptions] = useState<ResetOptions>({
    resetOrders: true,
    resetCustomersDue: true,
    resetExpenses: true,
    resetStockIns: true,
    resetDailyCash: true,
    resetProducts: false,
    resetNeighborhoods: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAllResetOptions = (val: boolean) => {
    setResetOptions({
      resetOrders: val,
      resetCustomersDue: val,
      resetExpenses: val,
      resetStockIns: val,
      resetDailyCash: val,
      resetProducts: val,
      resetNeighborhoods: val,
    });
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetConfirmedCheck) {
      setResetError('অনুগ্রহ করে নিশ্চিতকরণ চেকবক্সে টিক দিন।');
      return;
    }

    const hasAnySelected = Object.values(resetOptions).some(Boolean);
    if (!hasAnySelected) {
      setResetError('অনুগ্রহ করে অন্তত একটি বিষয়ের চেকবক্সে টিক দিন যা আপনি রিসেট করতে চান।');
      return;
    }

    setIsResetting(true);
    setResetError('');
    try {
      let res: { success: boolean; message: string };
      if (onResetSelectedData) {
        res = await onResetSelectedData(resetOptions, resetAdminId, resetPassword);
      } else if (onResetAllData) {
        res = await onResetAllData(resetAdminId, resetPassword);
      } else {
        res = { success: false, message: 'রিসেট ফাংশন পাওয়া যায়নি।' };
      }

      if (res.success) {
        setResetSuccessMessage(res.message);
        setShowResetModal(false);
        setResetAdminId('');
        setResetPassword('');
        setResetConfirmedCheck(false);
      } else {
        setResetError(res.message);
      }
    } catch (err) {
      setResetError('রিসেট প্রক্রিয়া চলাকালীন সমস্যা হয়েছে।');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>দোকানের তথ্য ও সেটিংস</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            দোকানের নাম, ঠিকানা, বিকাশ/নগদ নম্বর এবং হিসাব ব্যাকআপ
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExportBackup}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>হিসাব ব্যাকআপ ডাউনলোড</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>সকল সেটিংস সফলভাবে ক্লাউড ডেটাবেজে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {resetSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            দোকান ও মেমো তথ্য
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">দোকানের নাম *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">প্রোপাইটর / মালিকের নাম</label>
              <input
                type="text"
                value={formData.proprietor}
                onChange={(e) => setFormData({ ...formData, proprietor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">দোকানের প্রাথমিক মোবাইল নম্বর *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">বিকল্প মোবাইল নম্বর</label>
              <input
                type="text"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">দোকানের ঠিকানা</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">বিকাশ পার্সোনাল নম্বর</label>
              <input
                type="text"
                value={formData.bkashNumber}
                onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">নগদ নম্বর</label>
              <input
                type="text"
                value={formData.nagadNumber}
                onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Storefront Brand Showcase & Advisory Card (পণ্য তালিকার নিচের পরিচিতি ও তথ্য) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-700" />
              <span>ওয়েবসাইট শোকেস ও প্রাতিষ্ঠানিক তথ্য (Storefront Showcase)</span>
            </h4>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              পণ্য তালিকার নিচে লাইভ শো হবে
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">শোকেস হেডলাইন (Brand Title)</label>
              <input
                type="text"
                value={formData.brandStoryTitle || ''}
                onChange={(e) => setFormData({ ...formData, brandStoryTitle: e.target.value })}
                placeholder="যেমন: খামারির সমৃদ্ধি ও খাঁটি গো-খাদ্যের বিশ্বস্ত মোকাম"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">সাব-হেডলাইন (Sub-title)</label>
              <input
                type="text"
                value={formData.brandStorySubtitle || ''}
                onChange={(e) => setFormData({ ...formData, brandStorySubtitle: e.target.value })}
                placeholder="যেমন: ১৯৯৮ সাল থেকে স্থানীয় ডেইরি খামারি ভাইদের সাথে আস্থার সুদৃঢ় সম্পর্ক"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">প্রোপাইটরের প্রাতিষ্ঠানিক অঙ্গীকার ও বার্তা (Proprietor Message)</label>
              <textarea
                rows={3}
                value={formData.proprietorMessage || ''}
                onChange={(e) => setFormData({ ...formData, proprietorMessage: e.target.value })}
                placeholder="আমরা কোনো প্রকার মধ্যস্বত্বভোগী ছাড়া সরাসরি কুষ্টিয়ার দেশি লাল গমের মিল ও আন্তর্জাতিক কানাডিয়ান পোর্ট থেকে..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">দোকান খোলার সময়সূচী (Opening Hours)</label>
              <input
                type="text"
                value={formData.shopOpeningHours || ''}
                onChange={(e) => setFormData({ ...formData, shopOpeningHours: e.target.value })}
                placeholder="প্রতিদিন সকাল ৭:০০টা থেকে রাত ১০:০০টা (সপ্তাহের ৭ দিনই খোলা)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">হোয়াটসঅ্যাপ অর্ডার নম্বর (WhatsApp Number)</label>
              <input
                type="text"
                value={formData.whatsappNumber || ''}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="০১৭১২-৩৪৫৬৭৮"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">খামারিদের জন্য ফ্রি পুষ্টি পরামর্শ বার্তা (Expert Advisory Note)</label>
              <textarea
                rows={2}
                value={formData.advisoryNote || ''}
                onChange={(e) => setFormData({ ...formData, advisoryNote: e.target.value })}
                placeholder="আপনার খামারের গাভীর দুধের ফ্যাট বৃদ্ধি বা ষাঁড় মোটাতাজাকরণে দৈনিক সুষম খাদ্য তালিকা নির্ধারণে..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>অ্যাডমিন আইডি ও লগইন পাসওয়ার্ড</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">অ্যাডমিন আইডি / ইউজারনেম *</label>
              <input
                type="text"
                required
                value={formData.adminUsername}
                onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">অ্যাডমিন পাসওয়ার্ড *</label>
              <input
                type="text"
                required
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>

      {/* DANGER ZONE: Factory Reset (সকল ডেটা মুছে নতুন করে শুরু করা) */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">
              বিপজ্জনক জোন — সকল ডেটা সম্পূর্ণ মুছুন (Master Factory Reset)
            </h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              আপনি কি সব টেস্ট অর্ডার, সকল গ্রাহকের বকেয়া খাতা এবং হিসাব সম্পূর্ণ মুছে দোকানটি একদম শূন্য থেকে নতুন করে শুরু করতে চান? এই বাটনে ক্লিক করলে অ্যাডমিন আইডি ও পাসওয়ার্ড যাচাই করার পর সকল ডেটা রিসেট হয়ে যাবে।
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setShowResetModal(true);
              setResetError('');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>সকল ডেটা মুছুন ও নতুন করে শুরু করুন</span>
          </button>
        </div>
      </div>

      {/* Granular Data Reset Confirmation Modal with Checkboxes and Password Lock */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">কাস্টম ডেটা রিসেট ও ফ্রেশ শুরু</h3>
                  <p className="text-xs text-slate-500">যে যে বিষয়ের হিসাব মুছতে চান সেগুলোতে টিক দিন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] pb-1">
              <span className="text-slate-500 font-semibold">শর্টকাট নির্বাচন:</span>
              <button
                type="button"
                onClick={() => toggleAllResetOptions(true)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer transition-colors"
              >
                সবগুলোতে টিক দিন (Master Reset)
              </button>
              <button
                type="button"
                onClick={() =>
                  setResetOptions({
                    resetOrders: true,
                    resetCustomersDue: true,
                    resetExpenses: true,
                    resetStockIns: true,
                    resetDailyCash: true,
                    resetProducts: false,
                    resetNeighborhoods: false,
                  })
                }
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold cursor-pointer transition-colors"
              >
                শুধু আর্থিক হিসাবসমূহ
              </button>
              <button
                type="button"
                onClick={() => toggleAllResetOptions(false)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
              >
                সব টিক মুছুন
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              {/* Checkboxes List */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  কোন কোন ডেটা মুছতে চান নির্বাচন করুন:
                </div>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetOrders}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetOrders: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">১. সকল অর্ডার ও বিক্রয় তথ্য (Orders & Sales)</div>
                    <div className="text-[11px] text-slate-500">অনলাইন ও কাউন্টারের সকল বিক্রয় মেমোর রেকর্ড মুছে শূন্য হবে</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetCustomersDue}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetCustomersDue: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">২. গ্রাহক তালিকা ও বাকি খাতা (Customer Dues)</div>
                    <div className="text-[11px] text-slate-500">সকল গ্রাহকের খাতা, পূর্বের বকেয়া ও লেনদেনের ইতিহাস মুছে যাবে</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetExpenses}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetExpenses: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">৩. সকল দোকান খরচের হিসাব (Expenses)</div>
                    <div className="text-[11px] text-slate-500">দোকান ভাড়া, পরিবহন, বিদ্যুৎ ও অন্যান্য খরচের হিসাব রিসেট হবে</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetStockIns}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetStockIns: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">৪. মোকাম চালান ও পাইকারি খরিদ (Stock-Ins)</div>
                    <div className="text-[11px] text-slate-500">পাইকারি মোকাম থেকে মাল কেনার সকল চালানের ইতিহাস মুছে যাবে</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetDailyCash}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetDailyCash: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">৫. দৈনিক ক্যাশ বই ও রোকার হিসাব (Cashbook)</div>
                    <div className="text-[11px] text-slate-500">প্রতিদিনের প্রারম্ভিক ও সমাপনী ক্যাশের রোকার রেকর্ড মুছে যাবে</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetProducts}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetProducts: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">৬. পণ্যের মজুত ও ক্যাটালগ প্রাথমিক মানে রিসেট (Products)</div>
                    <div className="text-[11px] text-slate-500">পণ্যের তালিকা ও স্টক ডিফল্ট প্রাথমিক অবস্থায় ফিরে যাবে</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!resetOptions.resetNeighborhoods}
                    onChange={(e) => setResetOptions({ ...resetOptions, resetNeighborhoods: e.target.checked })}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">৭. পাড়া ও মহল্লার তালিকা রিসেট (Neighborhoods)</div>
                    <div className="text-[11px] text-slate-500">এলাকা ও পাড়ার তালিকা ডিফল্ট মানে রিসেট হবে</div>
                  </div>
                </label>
              </div>

              {/* Admin Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অ্যাডমিন আইডি *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: admin"
                    value={resetAdminId}
                    onChange={(e) => setResetAdminId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অ্যাডমিন পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    required
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 p-2.5 bg-rose-50/50 rounded-xl border border-rose-200">
                  <input
                    type="checkbox"
                    checked={resetConfirmedCheck}
                    onChange={(e) => setResetConfirmedCheck(e.target.checked)}
                    className="accent-rose-600 mt-0.5 w-4 h-4"
                  />
                  <span className="font-medium text-slate-800 text-[11px] leading-relaxed">
                    আমি নিশ্চিত যে আমি নির্বাচিত বিষয়সমূহের হিসাব ও ডেটা সম্পূর্ণ মুছে ফ্রেশ শুরু করতে চাই। এটি ফিরিয়ে আনা সম্ভব নয়।
                  </span>
                </label>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !resetConfirmedCheck}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isResetting ? 'রিসেট হচ্ছে...' : 'নির্বাচিত ডেটা রিসেট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
