import React from 'react';
import { Lock, PhoneCall, ShieldCheck, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onGoToAdmin: () => void;
  onGoToStore: () => void;
  activeView: 'store' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdminLogin,
  isAdminLoggedIn,
  onGoToAdmin,
  onGoToStore,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar Announcement */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 text-center flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span>🌾 ১০০% খাঁটি ও পুষ্টিকর গো-খাদ্য — সরাসরি মিল ও মোকাম থেকে সংগৃহীত</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <a href="tel:01712345678" className="inline-flex items-center gap-1.5 hover:text-emerald-200 font-semibold text-emerald-100 transition-colors">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>অর্ডার ও পরামর্শ: ০১৭১২-৩৪৫৬৭৮</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onGoToStore}
          className="text-left group cursor-pointer focus:outline-hidden min-w-0"
        >
          <div className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
            মেসার্স ভাই ভাই ভুসি ভাণ্ডার
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 truncate">
            গো-খাদ্য ও হিসাব ব্যবস্থাপনা
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onGoToStore}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 ${
              activeView === 'store' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 pb-0.5' : ''
            }`}
          >
            পণ্য ক্যাটালগ
          </button>
          <a
            href="#contact-info"
            onClick={(e) => {
              if (activeView !== 'store') {
                e.preventDefault();
                onGoToStore();
                setTimeout(() => {
                  document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="whitespace-nowrap transition-colors hover:text-emerald-700"
          >
            যোগাযোগ ও ঠিকানা
          </a>
        </nav>

        {/* Zone 3: Primary Action & Admin Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="tel:01712345678"
            className="sm:hidden flex items-center justify-center p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer min-h-[36px] min-w-[36px]"
            title="সরাসরি ফোন করুন"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          {/* Admin Switch / Login Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={activeView === 'admin' ? onGoToStore : onGoToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors rounded-lg shadow-xs whitespace-nowrap cursor-pointer min-h-[36px] sm:min-h-[38px]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{activeView === 'admin' ? 'স্টোরে ফিরুন' : 'অ্যাডমিন প্যানেল'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer min-h-[36px] sm:min-h-[38px]"
              title="দোকান মালিকের লগইন"
            >
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>মালিক লগইন</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
