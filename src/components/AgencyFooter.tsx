import React, { useState } from 'react';
import { DeveloperAgencyModal, AgencyModalTab } from './DeveloperAgencyModal';

export const AgencyFooter: React.FC = () => {
  const [modalTab, setModalTab] = useState<AgencyModalTab | null>(null);

  const handleOpenModal = (tab: AgencyModalTab) => {
    setModalTab(tab);
  };

  const handleCloseModal = () => {
    setModalTab(null);
  };

  return (
    <>
      {/* 
        PREMIUM DARK MINIMALIST AGENCY FOOTER 
        Hardcoded English Footer - Fully dedicated to SHAHRIYAR LLC & MH Shahriyar Shihab
        100% Mobile & Desktop Optimized with Touch Targets >= 44px
      */}
      <footer className="w-full bg-[#1e2229] text-[#cbd5e1] font-sans border-t border-[#262c35] transition-colors select-none">
        {/* Main 3-Column Footer Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
            
            {/* COLUMN 1: BRANDING & CONTACT */}
            <div className="space-y-4">
              {/* Logo: SH Icon + Text */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white font-black text-lg flex items-center justify-center tracking-wider shadow-md border border-emerald-400/40 shrink-0">
                  SH
                </div>
                <div>
                  <h3 className="text-white text-base sm:text-lg font-bold tracking-tight">
                    SHAHRIYAR LLC
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
                    Creative Web & Software Agency
                  </p>
                </div>
              </div>

              {/* Agency Tagline */}
              <p className="text-xs text-[#94a3b8] leading-relaxed max-w-sm">
                Architecting high-performance digital platforms, modern e-commerce storefronts, real-time database centers, and enterprise-grade Telegram mining bot ecosystems.
              </p>

              {/* Address / Location: Global Remote & THAKURGAON BANGLADESH */}
              <div className="flex items-start gap-2.5 text-xs text-[#cbd5e1] pt-1">
                <i className="fa-solid fa-location-dot mt-0.5 text-emerald-400 text-sm shrink-0"></i>
                <span className="leading-snug font-medium">Global Remote & THAKURGAON BANGLADESH</span>
              </div>

              {/* Email & Mobile Contact Info */}
              <div className="space-y-2.5 pt-1 text-xs">
                {/* Email */}
                <a
                  href="mailto:shahriyahasanshihab@gmail.com"
                  className="flex items-center gap-3 text-[#cbd5e1] hover:text-white transition-colors group py-1 min-h-[44px]"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#282d36] text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all text-xs shrink-0 shadow-xs">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <span className="truncate group-hover:underline underline-offset-4 text-xs sm:text-[13px]">
                    shahriyahasanshihab@gmail.com
                  </span>
                </a>

                {/* Mobile & WhatsApp: 01850737389 */}
                <a
                  href="https://wa.me/8801850737389"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#cbd5e1] hover:text-white transition-colors group py-1 min-h-[44px]"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#282d36] text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all text-xs shrink-0 shadow-xs">
                    <i className="fa-brands fa-whatsapp"></i>
                  </span>
                  <span className="group-hover:underline underline-offset-4 text-xs sm:text-[13px] font-mono">
                    +880 1850-737389 <span className="text-[11px] text-emerald-400 font-sans font-medium">(01850737389)</span>
                  </span>
                </a>
              </div>
            </div>

            {/* COLUMN 2: QUICK LINKS */}
            <div className="space-y-4 md:pl-6 lg:pl-10">
              <h4 className="text-white text-sm font-bold tracking-wider uppercase border-b border-[#2d333f] pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-1.5 text-xs">
                {[
                  { id: 'about', label: 'About Us' },
                  { id: 'services', label: 'Services' },
                  { id: 'portfolio', label: 'Portfolio' },
                  { id: 'careers', label: 'Careers' },
                  { id: 'blog', label: 'Blog' },
                  { id: 'contact', label: 'Contact' },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(item.id as AgencyModalTab)}
                      className="text-[#cbd5e1] hover:text-white hover:translate-x-1.5 transition-all inline-flex items-center gap-2 cursor-pointer text-left py-1.5 min-h-[38px] w-full"
                    >
                      <span className="text-emerald-500 font-bold text-sm">›</span>
                      <span className="font-medium text-xs sm:text-[13px]">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: SOCIAL MEDIA (Behance Removed, Telegram @Xrd_didox Added) */}
            <div className="space-y-4">
              <h4 className="text-white text-sm font-bold tracking-wider uppercase border-b border-[#2d333f] pb-2 inline-block">
                Follow Us
              </h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Connect with MH Shahriyar Shihab for custom web design, high-level Telegram bot engineering, and cloud deployment contracts.
              </p>

              {/* Minimalist Social Icons Grid (Mobile Touch Friendly >= 44px) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Telegram (@Xrd_didox) */}
                <a
                  href="https://t.me/Xrd_didox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#282d36] hover:bg-[#229ED9] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs text-base active:scale-95"
                  title="Telegram: @Xrd_didox"
                  aria-label="Telegram @Xrd_didox"
                >
                  <i className="fa-brands fa-telegram text-lg"></i>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/mh-shahriyar-shihab-251984444?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#282d36] hover:bg-[#0077b5] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs text-base active:scale-95"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in text-base"></i>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1C7B8PkERC/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#282d36] hover:bg-[#1877f2] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs text-base active:scale-95"
                  title="Facebook Profile"
                  aria-label="Facebook"
                >
                  <i className="fa-brands fa-facebook-f text-base"></i>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com/shahriya457"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#282d36] hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs text-base active:scale-95"
                  title="Twitter (X)"
                  aria-label="Twitter"
                >
                  <i className="fa-brands fa-x-twitter text-base"></i>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/shahriya457?rpxt=MXBhcmRjaTNpdnFrYw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#282d36] hover:bg-linear-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs text-base active:scale-95"
                  title="Instagram Profile"
                  aria-label="Instagram"
                >
                  <i className="fa-brands fa-instagram text-base"></i>
                </a>
              </div>

              {/* Social Handle & Telegram username */}
              <div className="pt-2 text-xs text-[#94a3b8] space-y-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Handle:</span>
                  <a
                    href="tel:+8801850737389"
                    className="text-white hover:text-emerald-400 font-bold transition-colors"
                  >
                    +8801850737389
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Telegram:</span>
                  <a
                    href="https://t.me/Xrd_didox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 font-bold transition-colors"
                  >
                    @Xrd_didox
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 
          FOOTER BOTTOM SECTION 
          Background #16191f, separated by thin border, 3 items space-between
        */}
        <div className="w-full bg-[#16191f] border-t border-[#262c35] py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-[#94a3b8]">
            
            {/* Left: Designed & Developed by */}
            <div className="leading-tight">
              <span className="text-[11px] text-[#64748b] block mb-0.5">Designed & Developed by</span>
              <button
                type="button"
                onClick={() => handleOpenModal('about')}
                className="text-white font-bold tracking-wider text-xs uppercase hover:text-emerald-400 transition-colors cursor-pointer text-left"
              >
                SHAHRIYAR LLC
              </button>
            </div>

            {/* Center: Legal & Sitemap Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
              <button
                type="button"
                onClick={() => handleOpenModal('privacy')}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Privacy Policy
              </button>
              <span className="text-[#334155]">|</span>
              <button
                type="button"
                onClick={() => handleOpenModal('terms')}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Terms of Service
              </button>
              <span className="text-[#334155]">|</span>
              <button
                type="button"
                onClick={() => handleOpenModal('sitemap')}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Sitemap
              </button>
            </div>

            {/* Right: Copyright Notice */}
            <div className="text-[11px] text-[#64748b]">
              Copyright © 2026 <span className="text-slate-300 font-semibold">SHAHRIYAR LLC</span>. All rights reserved.
            </div>

          </div>
        </div>
      </footer>

      {/* Interactive Detail Modal for Quick Links & Legal Policies */}
      {modalTab && (
        <DeveloperAgencyModal
          isOpen={true}
          activeTab={modalTab}
          onClose={handleCloseModal}
          onSelectTab={(tab) => setModalTab(tab)}
        />
      )}
    </>
  );
};
