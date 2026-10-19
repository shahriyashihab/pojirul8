import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Code2, 
  Cpu, 
  CheckCircle2, 
  Send, 
  Bot, 
  Database, 
  Server, 
  Layers, 
  Zap, 
  Award, 
  Sparkles, 
  Workflow, 
  ExternalLink,
  Laptop,
  Check,
  TrendingUp,
  Briefcase,
  Users,
  Terminal,
  Clock,
  ArrowRight,
  FileCode2,
  Lock,
  Headphones,
  Compass
} from 'lucide-react';

export type AgencyModalTab = 
  | 'about' 
  | 'services' 
  | 'portfolio' 
  | 'careers' 
  | 'blog' 
  | 'contact' 
  | 'privacy' 
  | 'terms' 
  | 'sitemap';

interface DeveloperAgencyModalProps {
  isOpen: boolean;
  activeTab: AgencyModalTab;
  onClose: () => void;
  onSelectTab: (tab: AgencyModalTab) => void;
}

export const DeveloperAgencyModal: React.FC<DeveloperAgencyModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e2229] border border-[#2d333f] text-[#cbd5e1] rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            1. MODAL TOP HEADER (Responsive & Clean)
           ========================================================================= */}
        <div className="bg-[#16191f] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2d333f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* SH Logo Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white font-black text-base sm:text-lg flex items-center justify-center tracking-wider shadow-md border border-emerald-400/40 shrink-0 select-none">
              SH
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm sm:text-base tracking-wide truncate">
                  SHAHRIYAR LLC
                </h3>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider hidden sm:inline-block">
                  Verified Agency
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#94a3b8] truncate">
                MH Shahriyar Shihab · Principal Systems Architect & Telegram Bot Engineer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#252a33] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 active:scale-95"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            2. HORIZONTAL TAB NAVIGATION (Touch-Scrollable with Active Pills)
           ========================================================================= */}
        <div className="bg-[#181b22] px-3 sm:px-6 py-2.5 border-b border-[#2d333f] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'about', label: 'About Us' },
            { id: 'services', label: 'Services' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'careers', label: 'Careers & Team' },
            { id: 'blog', label: 'Engineering Blog' },
            { id: 'contact', label: 'Contact' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as AgencyModalTab)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-xs min-h-[40px] flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-[#252a33]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* =========================================================================
            3. MODAL CONTENT BODY
           ========================================================================= */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm leading-relaxed text-[#cbd5e1] overscroll-contain">
          
          {/* =========================================================================
              TAB: ABOUT US (Massive, Professional & Comprehensive)
             ========================================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              
              {/* Profile Hero Header */}
              <div className="border-b border-[#2d333f] pb-5 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Engineering Profile & Agency Overview</span>
                </div>
                <h4 className="text-white text-xl sm:text-3xl font-extrabold tracking-tight">
                  MH Shahriyar Shihab
                </h4>
                <p className="text-emerald-400 text-xs sm:text-sm font-semibold">
                  Founder & Principal Systems Architect at SHAHRIYAR LLC · Global Remote & THAKURGAON BANGLADESH
                </p>
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <i className="fa-solid fa-location-dot text-emerald-400"></i>
                    Global Remote & THAKURGAON BANGLADESH
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <i className="fa-solid fa-phone text-emerald-400"></i>
                    01850737389
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <i className="fa-solid fa-envelope text-emerald-400"></i>
                    shahriyahasanshihab@gmail.com
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">⚡ 100% Production Guarantee</span>
                </div>
              </div>

              {/* In-depth Introduction & Manifesto */}
              <div className="space-y-3.5 text-slate-300">
                <p className="text-xs sm:text-sm leading-relaxed">
                  I am <strong className="text-white">MH Shahriyar Shihab</strong>, a senior-level software engineer, web architect, and the creative director behind <strong className="text-emerald-400 font-bold">SHAHRIYAR LLC</strong>. Over years of intensive commercial engineering, I have established a track record of designing, building, and deploying mission-critical digital systems for clients across Bangladesh and worldwide.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed">
                  I specialize in designing and engineering <strong className="text-white">literally any custom website or digital product</strong> from the ground up: from high-converting corporate portals and multi-vendor e-commerce stores with Point-of-Sale (POS) accounting, to dynamic business ERPs, complex cloud dashboards, and high-frequency Telegram bot networks.
                </p>
              </div>

              {/* 5 Core Superpowers & Technological Domains */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                
                {/* 1. Any Custom Website at Any Scale */}
                <div className="p-4 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2">
                  <div className="flex items-center gap-2.5 text-white font-bold text-xs sm:text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span>Any Website, Any Scale & Any Complexity</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                    Capable of architecting and designing literally any type of website. Whether you need a lightning-fast commercial storefront, an automated accounting system, a multi-role administrative dashboard, or an interactive web application, I build production-grade, pixel-perfect platforms tailored to exact specifications using React 19, TypeScript, Next.js, Vite, and Tailwind CSS.
                  </p>
                </div>

                {/* 2. Real-Time Databases & Cloud Data Centers */}
                <div className="p-4 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2">
                  <div className="flex items-center gap-2.5 text-white font-bold text-xs sm:text-sm">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <span>All Database Ecosystems & Real-Time Sync</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                    Total mastery of all modern database centers and real-time synchronization pipelines: Firebase Realtime Database (RTDB), Google Cloud Firestore, PostgreSQL, Cloud SQL, Supabase, MongoDB, SQLite, and client-side offline-first caching engines that guarantee instant zero-second response times even under intermittent networks.
                  </p>
                </div>

                {/* 3. High-Level Telegram Mining Bots & TMA WebApps */}
                <div className="p-4 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2">
                  <div className="flex items-center gap-2.5 text-white font-bold text-xs sm:text-sm">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span>High-Performance Telegram Mining & Earning Bots</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                    Elite engineering of Telegram Mini Apps (TMA) and viral Tap-to-Earn mining bot ecosystems. Built with energy-refill timers, multi-tier referral matrices, anti-cheat & anti-sybil validation algorithms, real-time balance calculations, Telegram cloud wallet integration, and automated community channel verification.
                  </p>
                </div>

                {/* 4. Cloud Web Hosting & Apache Server Optimization */}
                <div className="p-4 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2">
                  <div className="flex items-center gap-2.5 text-white font-bold text-xs sm:text-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                      <Server className="w-4 h-4" />
                    </div>
                    <span>Cloud Hosting & Web Server Optimization</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                    Pioneered high-performance web deployment pipelines across static cloud hosts, cPanel, and Apache web servers where browsers stubbornly cache old JavaScript bundles and refuse to show updates. Engineered a proprietary dual-mode bootstrapper and cache-busting <code className="text-emerald-300 font-mono">.htaccess</code> architecture with timestamped asset injection, guaranteeing immediate live updates on every deployment.
                  </p>
                </div>

              </div>

              {/* The Dedicated Agency Team Behind SHAHRIYAR LLC */}
              <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>The Multidisciplinary Engineering Team at SHAHRIYAR LLC</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Full-Service Studio
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  MH Shahriyar Shihab leads a dedicated team of digital specialists ready to tackle complex commercial projects with speed and precision:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-[#202530] rounded-lg border border-[#2b3341]">
                    <div className="text-white font-semibold">UI/UX Design Studio</div>
                    <div className="text-[11px] text-slate-400">Mobile-first Figma interfaces, ergonomic layouts & design systems</div>
                  </div>
                  <div className="p-2.5 bg-[#202530] rounded-lg border border-[#2b3341]">
                    <div className="text-white font-semibold">Bot & Backend Division</div>
                    <div className="text-[11px] text-slate-400">High-concurrency Node.js, Telegram Bot APIs & database engineers</div>
                  </div>
                  <div className="p-2.5 bg-[#202530] rounded-lg border border-[#2b3341]">
                    <div className="text-white font-semibold">QA & Cloud DevOps</div>
                    <div className="text-[11px] text-slate-400">Cross-device validation, Apache/cPanel pipelines & zero-lag deployment</div>
                  </div>
                </div>
              </div>

              {/* Verified Contact Details Grid */}
              <div className="p-4 sm:p-5 bg-[#13161c] border border-emerald-500/30 rounded-xl space-y-3">
                <h5 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Direct Communication & Verified Credentials</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* Phone */}
                  <a
                    href="tel:+8801850737389"
                    className="p-3 bg-[#1e2229] hover:bg-[#252b35] border border-[#2d333f] hover:border-emerald-500 rounded-lg transition-all group"
                  >
                    <span className="text-[10px] text-slate-400 block mb-0.5">Mobile Hotline</span>
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors font-mono">01850737389</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/8801850737389"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1e2229] hover:bg-[#252b35] border border-[#2d333f] hover:border-emerald-500 rounded-lg transition-all group"
                  >
                    <span className="text-[10px] text-slate-400 block mb-0.5">WhatsApp Direct</span>
                    <span className="font-bold text-emerald-400 group-hover:underline font-mono">+880 1850-737389</span>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:shahriyahasanshihab@gmail.com"
                    className="p-3 bg-[#1e2229] hover:bg-[#252b35] border border-[#2d333f] hover:border-emerald-500 rounded-lg transition-all group"
                  >
                    <span className="text-[10px] text-slate-400 block mb-0.5">Official Email</span>
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate block">shahriyahasanshihab@gmail.com</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href="https://t.me/Xrd_didox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1e2229] hover:bg-[#252b35] border border-[#2d333f] hover:border-teal-400 rounded-lg transition-all group"
                  >
                    <span className="text-[10px] text-slate-400 block mb-0.5">Telegram Bot Specialist</span>
                    <span className="font-bold text-teal-400 group-hover:underline">@Xrd_didox</span>
                  </a>

                </div>

                {/* Social Profiles Bar */}
                <div className="pt-3 border-t border-[#252b36] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 font-medium">Follow MH Shahriyar Shihab:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://t.me/Xrd_didox"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#252b35] hover:bg-[#229ED9] text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm"
                      title="Telegram: @Xrd_didox"
                    >
                      <i className="fa-brands fa-telegram"></i>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/mh-shahriyar-shihab-251984444?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#252b35] hover:bg-[#0077b5] text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm"
                      title="LinkedIn Profile"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a
                      href="https://www.facebook.com/share/1C7B8PkERC/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#252b35] hover:bg-[#1877f2] text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm"
                      title="Facebook Profile"
                    >
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                    <a
                      href="https://twitter.com/shahriya457"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#252b35] hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm"
                      title="Twitter / X"
                    >
                      <i className="fa-brands fa-x-twitter"></i>
                    </a>
                    <a
                      href="https://www.instagram.com/shahriya457?rpxt=MXBhcmRjaTNpdnFrYw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#252b35] hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm"
                      title="Instagram Profile"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: SERVICES (6 Major High-Level Service Offerings)
             ========================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="border-b border-[#2d333f] pb-3">
                <h4 className="text-white text-lg sm:text-2xl font-bold">Comprehensive Engineering Services</h4>
                <p className="text-emerald-400 text-xs mt-1">
                  Full-Lifecycle Engineering Across Custom Web, Cloud Databases, Telegram Bots, and Free Hosting Optimization
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* Service 1 */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">01.</span>
                        <span>Custom Full-Stack Web Development & Enterprise Portals</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Complete bespoke architecture for any business requirement: multi-vendor e-commerce marketplaces, corporate landing pages, software-as-a-service (SaaS) web applications, and customer portals. Engineered with clean React 19, TypeScript, modern Tailwind CSS, responsive mobile typography, and strict zero-pill discipline.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-emerald-300">React 19 & TypeScript</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Next.js & Vite</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Tailwind CSS v4</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">100% Mobile First</span>
                  </div>
                </div>

                {/* Service 2 */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">02.</span>
                        <span>High-Scale Telegram Mining Bots & TMA WebApps</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Industry-grade Telegram bot creation: viral Tap-to-Earn mining games, Proof-of-Tap algorithms, energy boost mechanics, multi-tier referral distribution matrices, Telegram Mini-Apps (TMA) interfaces, and automated notification broadcast pipelines capable of handling thousands of concurrent users.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-teal-300">Telegram WebApps (TMA)</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Tap-to-Earn Engines</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Anti-Sybil Protections</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Crypto Wallet Integration</span>
                  </div>
                </div>

                {/* Service 3 */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">03.</span>
                        <span>Multi-Database Systems & Real-Time Sync Centers</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Design and deployment across any database center: Firebase Realtime Database, Cloud Firestore, PostgreSQL, Cloud SQL, Supabase, MongoDB, and SQLite. Architected with offline-first synchronization that preserves data integrity and renders user interfaces instantly with zero lag.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-indigo-300">Firebase RTDB & Firestore</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">PostgreSQL / Cloud SQL</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Supabase & MongoDB</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Zero-Latency Cache</span>
                  </div>
                </div>

                {/* Service 4 */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">04.</span>
                        <span>Cloud Hosting Optimization & Static Server Cache Engineering</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Expert deployment pipelines across cloud platforms, VPS, cPanel, and Apache web servers. We solve the notorious static hosting caching dilemma where old files get locked in client browsers by injecting dynamic cache-busting timestamps and fine-tuning <code className="text-emerald-300 font-mono">.htaccess</code> headers for immediate, automatic live updates.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-amber-300">Zero-Cache Architecture</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Custom .htaccess Tuning</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Apache & Cloud Deploy</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">100% Live Sync</span>
                  </div>
                </div>

                {/* Service 5 */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">05.</span>
                        <span>E-Commerce Commerce Platforms & POS Double-Entry Accounting</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Complete retail, wholesale, and agro-commodity store solutions. Includes multi-item counter billing terminals, automated stock inventory reduction, customer due credit ledgers with duplicate account merging, daily cashbook expense management, and printable thermal/A4 cash memos.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Counter POS Register</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Customer Due Ledger</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Daily Cashbook Balancing</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Thermal Memo Print</span>
                  </div>
                </div>

                {/* Service 6 */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold">06.</span>
                        <span>Telegram Community Automation & Crypto Payment Gateways</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Automated channel subscription access bots, paid VIP membership gatekeepers, automated USDT/TON crypto invoice processing, and scheduled announcement dispatchers.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">VIP Subscription Gate</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">TON & USDT Payment</span>
                    <span className="px-2 py-0.5 bg-[#202530] rounded border border-[#2d333f] text-slate-300">Auto Member Approver</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: PORTFOLIO (Real-World Case Studies & Architectural Highlights)
             ========================================================================= */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="border-b border-[#2d333f] pb-3">
                <h4 className="text-white text-lg sm:text-2xl font-bold">Delivered Systems & Case Studies</h4>
                <p className="text-emerald-400 text-xs mt-1">Real-World Enterprise Implementations by MH Shahriyar Shihab</p>
              </div>

              <div className="space-y-4">
                
                {/* Case 1: Bhai Bhai Agro Feed Store */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-white font-bold text-sm sm:text-base">
                        M/S Bhai Bhai Agro Feed Store & POS ERP Platform
                      </h5>
                      <span className="text-[11px] text-emerald-400">Retail Storefront, Accounting, Due Ledger & Zero-Latency Sync</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-full font-bold">
                      Full-Stack Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A comprehensive retail commerce and financial ledger platform built for an established agro-feed business in Bangladesh. Features a responsive customer storefront, single-tap order placement, real-time inventory deduction, customer due ledgers with duplicate account merging, daily cashbook reconciliation, printable memos, and instant automated cloud state persistence.
                  </p>
                  <div className="p-3 bg-[#111419] rounded-lg border border-[#252b36] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-center">
                    <div>
                      <span className="text-slate-500 block">Initial Load</span>
                      <span className="font-bold text-emerald-400">0s Instant Boot</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Database</span>
                      <span className="font-bold text-white">Dual-Sync RTDB</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Cache Status</span>
                      <span className="font-bold text-emerald-400">Anti-Cache .htaccess</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Responsiveness</span>
                      <span className="font-bold text-white">100% Mobile Ready</span>
                    </div>
                  </div>
                </div>

                {/* Case 2: Telegram Mining Bot Network */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-white font-bold text-sm sm:text-base">
                        Apex Telegram Tap-to-Earn Mining Bot & TMA Mini-App
                      </h5>
                      <span className="text-[11px] text-teal-400">High-Concurrency Telegram Mini App & Reward Matrix</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-teal-500/15 text-teal-400 border border-teal-500/30 text-[10px] font-mono rounded-full font-bold">
                      Telegram TMA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed and deployed a viral Tap-to-Earn Telegram WebApp (TMA) mining engine. Incorporates energy pool exhaustion and recharge curves, multiplier boosts, multi-tier referral distribution trees, cryptographic signature verification, anti-clicker heuristics, and seamless cloud wallet linkage.
                  </p>
                  <div className="p-3 bg-[#111419] rounded-lg border border-[#252b36] grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-center">
                    <div>
                      <span className="text-slate-500 block">Concurrent Taps</span>
                      <span className="font-bold text-white">High Scale</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Anti-Cheat</span>
                      <span className="font-bold text-teal-400">Proof-of-Tap Active</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">UI Interface</span>
                      <span className="font-bold text-white">Telegram Mini App</span>
                    </div>
                  </div>
                </div>

                {/* Case 3: Real-Time Multi-Cloud Database Synchronizer */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-white font-bold text-sm sm:text-base">
                        Real-Time Multi-Cloud Database & Offline Cache Engine
                      </h5>
                      <span className="text-[11px] text-indigo-400">Dual Firebase RTDB + Offline Local Storage System</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono rounded-full font-bold">
                      Data Center Architecture
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Engineered an ultra-resilient data layer for commercial web apps that reads immediately from local storage for a 0-second UI boot, performs silent optimistic background synchronizations to Firebase Realtime Database, and gracefully handles network drops without losing accounting transactions.
                  </p>
                </div>

                {/* Case 4: Breakthrough Anti-Cache Cloud & Apache Pipeline */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-white font-bold text-sm sm:text-base">
                        Breakthrough Anti-Cache Cloud & Apache Pipeline
                      </h5>
                      <span className="text-[11px] text-amber-400">Apache Cache-Busting & Dual-Mode Bootstrapping</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono rounded-full font-bold">
                      Infrastructure Breakthrough
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed the proprietary bootstrapper that solved the infamous web server caching bug where users deploy updated code to static servers or Apache hosts but the live site remains stuck on old code. Combines timestamp query strings, a fallback script tag, and specialized `.htaccess` headers to force web servers and client browsers to load fresh updates instantly.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: CAREERS & TEAM (Collaborations, Commissions & Hiring)
             ========================================================================= */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div className="border-b border-[#2d333f] pb-3">
                <h4 className="text-white text-lg sm:text-2xl font-bold">Commissioning, Careers & Team Network</h4>
                <p className="text-emerald-400 text-xs mt-1">Partner with MH Shahriyar Shihab & SHAHRIYAR LLC</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We work with international startups, local business owners, enterprise clients, and creative agencies worldwide. You can commission bespoke projects with milestone-based guarantees or join our growing network of digital creators.
              </p>

              <div className="space-y-4">
                
                {/* Commission a Project Card */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span>Commission a Bespoke Project with MH Shahriyar Shihab</span>
                    </h5>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Open for Commissions
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Need a custom website, an e-commerce platform, a POS billing ledger, a viral Telegram mining bot, or a fix for your hosting deployment? I provide direct senior-level consulting and rapid turnaround.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Transparent Milestones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>100% Working Code Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Post-Launch Free Support</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href="https://wa.me/8801850737389"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <i className="fa-brands fa-whatsapp text-sm"></i>
                      <span>WhatsApp Inquiry: 01850737389</span>
                    </a>
                    <a
                      href="mailto:shahriyahasanshihab@gmail.com"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#252b36] hover:bg-[#313947] text-white rounded-xl text-xs font-bold transition-all border border-[#3b4455] active:scale-95"
                    >
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>Send Project Brief</span>
                    </a>
                  </div>
                </div>

                {/* Team Expansion & Developer Network */}
                <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-400" />
                      <span>Join Our Engineering Talent Network</span>
                    </h5>
                    <span className="text-[10px] text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Collaborators Welcome
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Are you a passionate UI designer, Telegram bot engineer, frontend developer, or technical writer based in Bangladesh or abroad? We frequently bring top talent onto commercial contracts. Send your portfolio or GitHub profile to connect directly.
                  </p>
                  <div className="text-xs text-slate-300">
                    <span>Contact lead for collaborations: </span>
                    <strong className="text-white font-mono">shahriyahasanshihab@gmail.com</strong>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: BLOG (In-Depth Technical Insights & Breakthrough Articles)
             ========================================================================= */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="border-b border-[#2d333f] pb-3">
                <h4 className="text-white text-lg sm:text-2xl font-bold">Engineering Insights & Technical Articles</h4>
                <p className="text-emerald-400 text-xs mt-1">Authoritative Deep Dives by MH Shahriyar Shihab</p>
              </div>

              <div className="space-y-4">
                
                {/* Article 1: Solving Web Server Caching */}
                <article className="p-4 sm:p-5 bg-[#16191f] border border-emerald-500/30 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                    <span className="font-bold">Infrastructure Breakthrough</span>
                    <span>•</span>
                    <span>6 Min Read</span>
                  </div>
                  <h5 className="text-white font-bold text-sm sm:text-base leading-snug">
                    How We Solved Apache & Static Web Server Browser Caching Forever: The Dual-Mode Bootstrapper Breakdown
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Most developers encounter a frustrating barrier when uploading Single Page Applications (SPAs) to static web hosting and Apache servers: even after uploading updated code to the root web folder, client browsers continue serving the stale, cached bundle of <code className="text-emerald-300 font-mono">app.js</code> and <code className="text-emerald-300 font-mono">app.css</code>. We resolved this through a multi-tiered mechanism: an intelligent dual-mode bootstrapper in <code className="text-emerald-300 font-mono">index.html</code> that appends dynamic timestamps to asset URLs, accompanied by strict <code className="text-emerald-300 font-mono">.htaccess</code> headers declaring <code className="text-emerald-300 font-mono">Cache-Control: no-cache, must-revalidate</code> for HTML/JS/CSS assets.
                  </p>
                </article>

                {/* Article 2: Architecting Telegram Mining Bots */}
                <article className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-teal-400 font-mono">
                    <span className="font-bold">Telegram Bot Engineering</span>
                    <span>•</span>
                    <span>8 Min Read</span>
                  </div>
                  <h5 className="text-white font-bold text-sm sm:text-base leading-snug">
                    Architecting High-Concurrency Telegram Mining Bots & TMA WebApps with Anti-Cheat Protections
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap-to-Earn Telegram WebApps experience massive traffic spikes. In this article, we explain how to construct distributed session handling, prevent auto-clicker scripts with client-side Proof-of-Tap challenges, configure energy regeneration equations, and implement multi-tier referral distribution algorithms without overloading the database.
                  </p>
                </article>

                {/* Article 3: Zero-Latency Database Sync */}
                <article className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-mono">
                    <span className="font-bold">Database Architecture</span>
                    <span>•</span>
                    <span>5 Min Read</span>
                  </div>
                  <h5 className="text-white font-bold text-sm sm:text-base leading-snug">
                    Zero-Latency Real-Time Multi-Database Sync: Combining Firebase, LocalStorage & Cloud SQL
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Why choose between speed and reliability? By caching full snapshot states into browser local storage, our web apps achieve instant 0-second first contentful paint. Then, a silent background sync worker reconciles changes with Firebase Realtime Database and Cloud SQL, ensuring offline durability and multi-device persistence.
                  </p>
                </article>

                {/* Article 4: POS Accounting Ledgers */}
                <article className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-amber-400 font-mono">
                    <span className="font-bold">ERP Engineering</span>
                    <span>•</span>
                    <span>4 Min Read</span>
                  </div>
                  <h5 className="text-white font-bold text-sm sm:text-base leading-snug">
                    Building Double-Entry POS Billing & Customer Credit Due Ledgers for High-Throughput Retail
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A deep dive into ledger normalization, single-click customer account merging, real-time stock deduction, and daily cashbook reconciliation for agricultural and retail trade businesses.
                  </p>
                </article>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: CONTACT (Interactive, High-Converting Contact Hub)
             ========================================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="border-b border-[#2d333f] pb-3">
                <h4 className="text-white text-lg sm:text-2xl font-bold">Direct Contact Channels</h4>
                <p className="text-emerald-400 text-xs mt-1">Connect with MH Shahriyar Shihab & SHAHRIYAR LLC</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Available 24/7 for custom website commissions, Telegram bot development, database architecture, and hosting troubleshooting contracts.
              </p>

              {/* Direct Action Contact Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Direct Mobile */}
                <a
                  href="tel:+8801850737389"
                  className="p-4 bg-[#16191f] border border-[#2d333f] hover:border-emerald-500 rounded-xl transition-all flex items-center gap-3.5 group min-h-[68px]"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Direct Mobile Call</div>
                    <div className="text-white font-bold text-sm sm:text-base font-mono truncate">+880 1850-737389</div>
                    <div className="text-[11px] text-emerald-400 font-mono">01850737389</div>
                  </div>
                </a>

                {/* 2. WhatsApp Direct */}
                <a
                  href="https://wa.me/8801850737389"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-[#16191f] border border-[#2d333f] hover:border-emerald-500 rounded-xl transition-all flex items-center gap-3.5 group min-h-[68px]"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-2xl">
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">WhatsApp Chat (Available 24/7)</div>
                    <div className="text-white font-bold text-sm sm:text-base font-mono truncate">+880 1850-737389</div>
                    <div className="text-[11px] text-emerald-400 font-medium">01850737389 · Instant Reply</div>
                  </div>
                </a>

                {/* 3. Official Email */}
                <a
                  href="mailto:shahriyahasanshihab@gmail.com"
                  className="p-4 bg-[#16191f] border border-[#2d333f] hover:border-emerald-500 rounded-xl transition-all flex items-center gap-3.5 group min-h-[68px]"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Official Project Email</div>
                    <div className="text-white font-bold text-xs sm:text-sm truncate">shahriyahasanshihab@gmail.com</div>
                    <div className="text-[11px] text-emerald-400">Formal RFP & Quotes</div>
                  </div>
                </a>

                {/* 4. Telegram Direct */}
                <a
                  href="https://t.me/Xrd_didox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-[#16191f] border border-[#2d333f] hover:border-teal-400 rounded-xl transition-all flex items-center gap-3.5 group min-h-[68px]"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-2xl">
                    <i className="fa-brands fa-telegram"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Telegram Direct</div>
                    <div className="text-teal-400 font-bold text-sm sm:text-base truncate">@Xrd_didox</div>
                    <div className="text-[11px] text-slate-400">Telegram Bot Specialist</div>
                  </div>
                </a>

              </div>

              {/* Physical Location & Full Social Hub */}
              <div className="p-4 sm:p-5 bg-[#16191f] border border-[#2d333f] rounded-xl space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <i className="fa-solid fa-location-dot text-emerald-400 text-sm mt-0.5 shrink-0"></i>
                  <div>
                    <span className="font-bold text-white block">Corporate & Engineering Hub:</span>
                    <span className="text-emerald-400 font-medium text-xs sm:text-sm">Global Remote & THAKURGAON BANGLADESH</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#252b36] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-mono">
                    <span>Hotline / WhatsApp: </span>
                    <strong className="text-white font-mono">+880 1850-737389 (01850737389)</strong>
                  </div>

                  {/* Social Grid */}
                  <div className="flex items-center gap-2">
                    <a
                      href="https://t.me/Xrd_didox"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#232832] hover:bg-[#229ED9] text-slate-300 hover:text-white flex items-center justify-center transition-all text-base active:scale-95 shadow-xs"
                      title="Telegram: @Xrd_didox"
                      aria-label="Telegram"
                    >
                      <i className="fa-brands fa-telegram"></i>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/mh-shahriyar-shihab-251984444?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#232832] hover:bg-[#0077b5] text-slate-300 hover:text-white flex items-center justify-center transition-all text-base active:scale-95 shadow-xs"
                      title="LinkedIn Profile"
                      aria-label="LinkedIn"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a
                      href="https://www.facebook.com/share/1C7B8PkERC/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#232832] hover:bg-[#1877f2] text-slate-300 hover:text-white flex items-center justify-center transition-all text-base active:scale-95 shadow-xs"
                      title="Facebook Profile"
                      aria-label="Facebook"
                    >
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                    <a
                      href="https://twitter.com/shahriya457"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#232832] hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-all text-base active:scale-95 shadow-xs"
                      title="Twitter (X)"
                      aria-label="Twitter"
                    >
                      <i className="fa-brands fa-x-twitter"></i>
                    </a>
                    <a
                      href="https://www.instagram.com/shahriya457?rpxt=MXBhcmRjaTNpdnFrYw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#232832] hover:bg-linear-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] text-slate-300 hover:text-white flex items-center justify-center transition-all text-base active:scale-95 shadow-xs"
                      title="Instagram Profile"
                      aria-label="Instagram"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Project Message Launcher */}
              <div className="p-4 sm:p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Ready to Build Your Project? Send a Direct WhatsApp Message</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click below to open WhatsApp with a pre-formatted inquiry directly to MH Shahriyar Shihab (+8801850737389). We respond within minutes to discuss your timeline, tech stack, and budget.
                </p>
                <div className="pt-1">
                  <a
                    href="https://wa.me/8801850737389?text=Hello%20MH%20Shahriyar%20Shihab,%20I%20would%20like%20to%20discuss%20a%20website%20/%20Telegram%20bot%20/%20database%20development%20project%20with%20SHAHRIYAR%20LLC."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-950/50 active:scale-95"
                  >
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    <span>Launch WhatsApp Chat (+8801850737389)</span>
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB: PRIVACY POLICY
             ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h4 className="text-white text-base sm:text-xl font-bold">Privacy Policy</h4>
              <p className="text-xs text-slate-400 font-mono">SHAHRIYAR LLC · Global Remote & THAKURGAON BANGLADESH · 2026</p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                SHAHRIYAR LLC respects the privacy and proprietary data of all visitors and enterprise clients. Any business metrics, customer ledger balances, transaction records, or telephone contacts processed by this platform are encrypted and utilized solely for fulfillment, point-of-sale accounting, and authorized system communication. No client data is ever sold, leased, or distributed to external third parties.
              </p>
            </div>
          )}

          {/* =========================================================================
              TAB: TERMS OF SERVICE
             ========================================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-white text-base sm:text-xl font-bold">Terms of Service</h4>
              <p className="text-xs text-slate-400 font-mono">SHAHRIYAR LLC · Global Remote & THAKURGAON BANGLADESH · 2026</p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All platform architectures, custom scripts, reactive state synchronizers, and digital designs remain the intellectual creation of SHAHRIYAR LLC. Use of this storefront or engagement in bespoke engineering contracts implies acceptance of fair commercial exchange, digital memo validation, and verified commodity supply agreements.
              </p>
            </div>
          )}

          {/* =========================================================================
              TAB: SITEMAP
             ========================================================================= */}
          {activeTab === 'sitemap' && (
            <div className="space-y-4">
              <h4 className="text-white text-base sm:text-xl font-bold">Platform Sitemap & Navigation Index</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3.5 bg-[#16191f] rounded-lg border border-[#2d333f]">
                  <strong className="text-white block mb-1.5 text-xs sm:text-sm font-bold">Storefront & Commerce</strong>
                  <ul className="space-y-1 text-slate-400">
                    <li>• Cattle Feed Product Catalog</li>
                    <li>• Direct One-Click Order Terminal</li>
                    <li>• Printable Cash Memo Receipt</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-[#16191f] rounded-lg border border-[#2d333f]">
                  <strong className="text-white block mb-1.5 text-xs sm:text-sm font-bold">Enterprise Management</strong>
                  <ul className="space-y-1 text-slate-400">
                    <li>• Real-Time POS Counter Register</li>
                    <li>• Customer Credit & Due Ledger</li>
                    <li>• Daily Cashbook & Profit Auditing</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-[#16191f] rounded-lg border border-[#2d333f]">
                  <strong className="text-white block mb-1.5 text-xs sm:text-sm font-bold">Brand Showcase</strong>
                  <ul className="space-y-1 text-slate-400">
                    <li>• Executive Brand Story & Commitment</li>
                    <li>• 3 Pillars of Agricultural Excellence</li>
                    <li>• Depot Contact & Farmer Advisory Hub</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-[#16191f] rounded-lg border border-[#2d333f]">
                  <strong className="text-white block mb-1.5 text-xs sm:text-sm font-bold">Developer Agency</strong>
                  <ul className="space-y-1 text-slate-400">
                    <li>• SHAHRIYAR LLC Profile & Services</li>
                    <li>• Telegram Bot Architecture Showcase</li>
                    <li>• Direct Contact & Collaboration</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* =========================================================================
            4. MODAL STICKY FOOTER (Clean Mobile Actions)
           ========================================================================= */}
        <div className="bg-[#16191f] px-4 sm:px-6 py-3.5 border-t border-[#2d333f] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px] min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-slate-300 font-medium truncate">
              SHAHRIYAR LLC · Global Remote & THAKURGAON BANGLADESH
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href="https://wa.me/8801850737389"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-center text-xs min-h-[40px] flex items-center justify-center gap-1.5 active:scale-95"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i>
              <span>WhatsApp (01850737389)</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#252a33] hover:bg-[#2e3440] text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs min-h-[40px] flex items-center justify-center active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
