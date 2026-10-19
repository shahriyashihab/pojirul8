import { Order, ShopSettings, CustomerDue } from '../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../services/firebaseService';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { safeOpenUrl } from '../utils/safeOpen';

interface PrintableMemoProps {
  order: Order | null;
  settings: ShopSettings;
  dues?: CustomerDue[];
  onClose: () => void;
}

export const PrintableMemo: React.FC<PrintableMemoProps> = ({ order, settings, dues = [], onClose }) => {
  if (!order) return null;

  // Resolve previous due
  let resolvedPreviousDue = order.previousDue ?? 0;
  if (order.previousDue === undefined && dues.length > 0) {
    const cust = dues.find(
      (c) =>
        (order.customerId && c.id === order.customerId) ||
        (order.phone && c.phone && c.phone.length > 5 && c.phone === order.phone) ||
        (c.customerName.trim().toLowerCase() === order.customerName.trim().toLowerCase() &&
          (!order.moholla || !c.moholla || c.moholla === order.moholla))
    );
    if (cust) {
      resolvedPreviousDue = order.status === 'confirmed' ? Math.max(0, cust.totalDue - (order.dueAmount || 0)) : cust.totalDue;
    }
  }

  const currentDue = order.dueAmount || 0;
  const totalCumulativeDue = resolvedPreviousDue + currentDue;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <span>ক্যাশ মেমো ও চালান ({order.memoNo})</span>
          </div>

          <div className="flex items-center gap-2">
            {order.phone && (
              <button
                type="button"
                onClick={() => {
                  const cleanPhone = order.phone.replace(/\D/g, '');
                  const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
                  const itemsSummary = order.items.map((i) => `${i.productName} (${i.quantityKg}কেজি)`).join(', ');
                  const dueInfo =
                    resolvedPreviousDue > 0
                      ? `\nবর্তমান ক্রয় বিল: ${formatTaka(order.totalAmount)}\nনগদ জমা: ${formatTaka(order.paidAmount)}\nবর্তমান বাকি: ${formatTaka(currentDue)}\nপূর্বের বকেয়া: ${formatTaka(resolvedPreviousDue)}\nসর্বমোট বকেয়া: ${formatTaka(totalCumulativeDue)}`
                      : `\nমোট বিল: ${formatTaka(order.totalAmount)}\nজমা: ${formatTaka(order.paidAmount)}\nবাকি: ${formatTaka(order.dueAmount)}`;
                  const text = `আসসালামু আলাইকুম ${order.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার ক্যাশ মেমো নং ${order.memoNo} প্রস্তুত।\nপণ্য: ${itemsSummary}${dueInfo}।\nধন্যবাদ!`;
                  safeOpenUrl(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`);
                }}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors min-h-[38px]"
                title="WhatsApp মেমো পাঠান"
              >
                <span>WhatsApp</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Cash Memo Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-white" id="printable-memo">
          {/* Memo Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
              বিসমিল্লাহির রাহমানির রাহিম
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {settings.shopName}
            </h1>
            <p className="text-xs text-slate-700 font-medium mt-1">
              উন্নত জাতের গমের ভুসি, ঘানির সরিষার খইল, ভাঙা ছোলা, খুদি ও পশুখাদ্যের পাইকারি ও খুচরা বিক্রেতা
            </p>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center justify-center gap-x-4">
              <span>ঠিকানা: {settings.address}</span>
              <span>মোবাইল: {settings.phone}</span>
            </div>
          </div>

          {/* Sub Bar: Memo No & Date */}
          <div className="flex justify-between items-center text-xs font-semibold py-2 px-1 border-b border-slate-300 mb-4">
            <div>
              <span className="text-slate-500">মেমো নং: </span>
              <span className="font-mono text-slate-900 font-bold">{order.memoNo}</span>
            </div>
            <div>
              <span className="text-slate-500">তারিখ: </span>
              <span className="text-slate-900">{getBengaliDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Customer Info Box */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">ক্রেতা/খামারের নাম: </span>
              <strong className="text-slate-900">{order.customerName}</strong>
            </div>
            <div>
              <span className="text-slate-500">মোবাইল নম্বর: </span>
              <strong className="font-mono text-slate-900">{order.phone}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500">ঠিকানা: </span>
              <span className="text-slate-800">{order.villageAddress}</span>
            </div>
            <div>
              <span className="text-slate-500">ডেলিভারি ধরন: </span>
              <span className="text-slate-800 font-medium">
                {order.deliveryType === 'home_delivery' ? 'হোম ডেলিভারি' : 'দোকান থেকে নেওয়া'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">পেমেন্ট মাধ্যম: </span>
              <span className="text-slate-800 font-medium">
                {order.paymentMethod === 'cash'
                  ? 'নগদ / হ্যান্ড ক্যাশ'
                  : order.paymentMethod === 'bkash_nagad'
                  ? 'বিকাশ / নগদ'
                  : order.paymentMethod === 'partial'
                  ? 'আংশিক নগদ ও বাকি'
                  : 'সম্পূর্ণ বাকি'}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800">
                <th className="py-2 px-2 text-center w-12">নং</th>
                <th className="py-2 px-3">পণ্যের বিবরণ</th>
                <th className="py-2 px-3 text-right">পরিমাণ</th>
                <th className="py-2 px-3 text-right">দর (টাকা)</th>
                <th className="py-2 px-3 text-right">মোট (টাকা)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-2 text-center text-slate-600">{formatNumberBengali(idx + 1)}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {formatNumberBengali(item.quantityKg)} কেজি
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">{formatTaka(item.unitPrice)}</td>
                  <td className="py-2 px-3 text-right font-bold tabular-nums text-slate-900">
                    {formatTaka(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                <span>বর্তমান পণ্যের মূল্য:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatTaka(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>আজকের নগদ জমা:</span>
                <span className="font-bold tabular-nums text-emerald-800">
                  {formatTaka(order.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>আজকের নতুন বাকি:</span>
                <span className="font-bold tabular-nums text-rose-600">
                  {formatTaka(order.dueAmount)}
                </span>
              </div>
              {resolvedPreviousDue > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700 bg-amber-50/70 px-1.5 rounded">
                  <span>পূর্বের বকেয়া (পুরাতন বাকি):</span>
                  <span className="font-bold tabular-nums text-amber-800">
                    {formatTaka(resolvedPreviousDue)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-t-2 border-b-2 border-slate-900 text-sm font-extrabold text-slate-950 bg-slate-100/80 px-1.5 rounded mt-1">
                <span>সর্বমোট অবশিষ্ট দেনা / বকেয়া:</span>
                <span className="tabular-nums text-rose-700">
                  {formatTaka(totalCumulativeDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note and Signature Lines */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <p className="text-[11px] text-center text-slate-500 mb-12 italic">
              "{settings.memoFooterNote}"
            </p>

            <div className="flex justify-between items-end text-xs text-slate-700 px-6">
              <div className="text-center">
                <div className="w-36 border-t border-slate-400 pt-1">ক্রেতার স্বাক্ষর</div>
              </div>
              <div className="text-center">
                <div className="w-36 border-t border-slate-400 pt-1 font-semibold">
                  দোকানদারের স্বাক্ষর
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
