import React from 'react';
import { ShopSettings } from '../types';
import { 
  ShieldCheck, 
  Truck, 
  Scale, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Award, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface StoreBrandShowcaseProps {
  settings: ShopSettings;
}

export const StoreBrandShowcase: React.FC<StoreBrandShowcaseProps> = ({ settings }) => {
  // Format phone numbers for tel: and whatsapp:
  const rawPhone = settings.phone || '01712-345678';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const rawWhatsapp = settings.whatsappNumber || settings.phone || '01712-345678';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp.startsWith('88') ? cleanWhatsapp : '88' + cleanWhatsapp}`;

  const brandTitle = settings.brandStoryTitle || 'খামারির সমৃদ্ধি ও খাঁটি গো-খাদ্যের বিশ্বস্ত মোকাম';
  const brandSubtitle = settings.brandStorySubtitle || '১৯৯৮ সাল থেকে স্থানীয় ডেইরি খামারি ভাইদের সাথে আস্থার সুদৃঢ় সম্পর্ক';
  const proprietorMsg = settings.proprietorMessage || 
    'আমরা কোনো প্রকার মধ্যস্বত্বভোগী ছাড়া সরাসরি কুষ্টিয়ার দেশি লাল গমের মিল ও আন্তর্জাতিক কানাডিয়ান পোর্ট থেকে প্রথম চাপের ভুসি এবং কাঠের ঘানির খাঁটি সরিষার খইল সংগ্রহ করি। প্রতিটি দানায় সঠিক প্রোটিন ও পুষ্টি উপাদান নিশ্চিত করাই আমাদের ব্যবসার মূল অঙ্গীকার।';
  const openingHours = settings.shopOpeningHours || 'প্রতিদিন সকাল ৭:০০টা থেকে রাত ১০:০০টা (সপ্তাহের ৭ দিনই খোলা)';
  const advisory = settings.advisoryNote || 
    'আপনার খামারের গাভীর দুধের ফ্যাট বৃদ্ধি বা ষাঁড় মোটাতাজাকরণে দৈনিক সুষম খাদ্য তালিকা নির্ধারণে অভিজ্ঞ পরামর্শের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।';

  return (
    <section className="w-full bg-slate-100/70 border-t border-slate-200 py-12 sm:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* =========================================================================
            1. EXECUTIVE BRAND STORY (EDITORIAL 2-COLUMN SPLIT)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Visual & Heritage Banner (5 Cols) */}
          <div className="relative lg:col-span-5 min-h-[280px] lg:min-h-full bg-slate-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8 text-white">
            <img
              src="./images/hero_cattle_feed_store_1792082237019.jpg"
              alt="দোকানের দৃশ্য ও গুদাম"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter saturate-110"
              onError={(e) => {
                // Graceful fallback if image unavailable
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/80 to-slate-950/40"></div>

            <div className="relative z-10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold tracking-wide">
                <Award className="w-3.5 h-3.5" />
                <span>মোকাম ঐতিহ্য ও বিশ্বস্ততা</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold leading-snug text-white">
                {settings.shopName}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {brandSubtitle}
              </p>
              <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-300 border-t border-white/10 font-medium">
                <span>✓ ভেজালমুক্ত পুষ্টি</span>
                <span>✓ পাইকারি মোকাম রেট</span>
                <span>✓ নিজস্ব সাপ্লাই চেইন</span>
              </div>
            </div>
          </div>

          {/* Right Column: Proprietor Message & Institutional Commitment (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>প্রোপাইটরের প্রাতিষ্ঠানিক অঙ্গীকার</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                "{brandTitle}"
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {proprietorMsg}
              </p>
            </div>

            {/* Signature & Assurance Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-900">{settings.proprietor}</div>
                <div className="text-xs text-emerald-700 font-semibold">স্বত্বাধিকারী (Proprietor)</div>
                <div className="text-[11px] text-slate-500">{settings.shopName}</div>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>১০০% খাঁটি ও গুণগত মানের নিশ্চয়তা</span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            2. THREE PILLARS OF AGRICULTURAL EXCELLENCE (ARCHITECTURAL HAIRLINE GRID)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white rounded-2xl border border-slate-200 shadow-xs divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          
          {/* Pillar 01 */}
          <div className="p-6 sm:p-7 space-y-3 hover:bg-slate-50/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase font-mono">
              ০১ / মান ও বিশুদ্ধতা
            </div>
            <h4 className="text-base font-bold text-slate-900">
              বিশুদ্ধতা ও পুষ্টি উপাদানের মানদণ্ড
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              কোনো প্রকার চিটা, বালি বা কাঠের গুঁড়া ছাড়া ১০০% খাঁটি কুষ্টিয়ার লাল ভুসি, চকলেট খইল ও আন্তর্জাতিক কানাডিয়ান ভুসি সরাসরি সরবরাহ করি।
            </p>
          </div>

          {/* Pillar 02 */}
          <div className="p-6 sm:p-7 space-y-3 hover:bg-slate-50/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center">
              <Truck className="w-5 h-5 text-teal-700" />
            </div>
            <div className="text-[11px] font-bold text-teal-700 tracking-wider uppercase font-mono">
              ০২ / খামার লজিস্টিকস
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ডাইরেক্ট ফার্ম ডেলিভারি ব্যবস্থা
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার পাড়া ও মহল্লায় নিজস্ব ভ্যান বা পিকআপের মাধ্যমে সম্পূর্ণ শুকনো ও অক্ষত বস্তা সরাসরি আপনার খামার শেডে দ্রুত পৌঁছে দেওয়া হয়।
            </p>
          </div>

          {/* Pillar 03 */}
          <div className="p-6 sm:p-7 space-y-3 hover:bg-slate-50/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-800 flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-700" />
            </div>
            <div className="text-[11px] font-bold text-indigo-700 tracking-wider uppercase font-mono">
              ০৩ / বাণিজ্যিক স্বচ্ছতা
            </div>
            <h4 className="text-base font-bold text-slate-900">
              সঠিক ডিজিটাল ওজন ও পাকা মেমো
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              প্রতিটি বস্তা ও খুচরা বিক্রয়ে ডিজিটাল স্কেলে ১০০% সঠিক ওজন এবং কম্পিউটারাইজড পাকা ক্যাশ মেমো রসিদ প্রদান করা হয়।
            </p>
          </div>

        </div>

        {/* =========================================================================
            3. DIRECT CONTACT & DEPOT VISIT HUB (DARK EMERALD EXECUTIVE HUB)
           ========================================================================= */}
        <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-emerald-800/40 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Depot Address & Schedule (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <Clock className="w-3.5 h-3.5" />
                <span>মোকাম খোলা ও ডেলিভারি সময়</span>
              </div>

              <h4 className="text-xl sm:text-2xl font-bold leading-tight">
                সরাসরি দোকানে আসুন অথবা ফোনে অর্ডার করুন
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block mb-0.5">দোকান ও ডিপোর ঠিকানা:</span>
                    <span className="leading-relaxed">{settings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block mb-0.5">কার্যক্রমের সময়সূচী:</span>
                    <span className="leading-relaxed">{openingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Hotline & WhatsApp Action Buttons (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
              <a
                href={`tel:${cleanPhone}`}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg text-center"
              >
                <PhoneCall className="w-4 h-4" />
                <span>সরাসরি হটলাইনে কল: {rawPhone}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all text-center"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>হোয়াটসঅ্যাপে পাইকারি দর ও পরামর্শ</span>
              </a>
            </div>

          </div>
        </div>

        {/* =========================================================================
            4. FARMER ADVISORY STRIP (SPECIAL NUTRITION NOTE)
           ========================================================================= */}
        <div className="p-4 sm:p-5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-3.5 text-amber-950 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-amber-950">খামারি ভাইদের জন্য বিশেষ পরামর্শ: </span>
            <span className="text-amber-900">{advisory}</span>
          </div>
        </div>

      </div>
    </section>
  );
};
