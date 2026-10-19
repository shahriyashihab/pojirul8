import React, { useState } from 'react';
import { ShopExpense, ExpenseCategory } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate, getBDBusinessDate } from '../../services/firebaseService';
import { Wallet, PlusCircle, Calendar, Tag, Trash2 } from 'lucide-react';

interface AdminExpensesProps {
  expenses: ShopExpense[];
  onAddExpense: (expense: ShopExpense) => Promise<void>;
}

export const AdminExpenses: React.FC<AdminExpensesProps> = ({ expenses, onAddExpense }) => {
  const todayStr = getBDBusinessDate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('transport');
  const [amount, setAmount] = useState<number | ''>(500);
  const [date, setDate] = useState<string>(todayStr);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryMap: Record<ExpenseCategory, string> = {
    rent: 'দোকান ভাড়া',
    transport: 'পরিবহন ও ট্রাকভাড়া',
    labour: 'কুলি ও লেবার বিল',
    electricity: 'বিদ্যুৎ বিল',
    salary: 'কর্মচারীর বেতন',
    tea_snacks: 'চা-নাস্তা ও আপ্যায়ন',
    other: 'অন্যান্য খরচ',
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    if (!title.trim() || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const newExpense: ShopExpense = {
        id: `exp-${Date.now()}`,
        title: title.trim(),
        category,
        amount: numAmount,
        date,
        note: note.trim(),
      };

      await onAddExpense(newExpense);
      setTitle('');
      setAmount('');
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-700" />
            <span>দৈনিক দোকান খরচের খাতা (Expense Tracker)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            দোকান ভাড়া, পরিবহন, লেবার, বিদ্যুৎ বিল, কর্মচারীর বেতন ও নাস্তার হিসাব
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-right">
          <div className="text-[11px] text-slate-500 font-medium">মোট খরচের যোগফল</div>
          <div className="text-xl font-bold text-rose-700 tabular-nums">
            {formatTaka(totalExpense)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Expense Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            নতুন খরচ এন্ট্রি করুন
          </h4>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">খরচের বিবরণ *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: ট্রাক থেকে ৬০ বস্তা আনলোড লেবার"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="transport">পরিবহন ও ট্রাকভাড়া</option>
                  <option value="labour">কুলি ও লেবার বিল</option>
                  <option value="rent">দোকান ভাড়া</option>
                  <option value="electricity">বিদ্যুৎ বিল</option>
                  <option value="salary">কর্মচারীর বেতন</option>
                  <option value="tea_snacks">চা-নাস্তা ও আপ্যায়ন</option>
                  <option value="other">অন্যান্য বিবিধ</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={amount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val === '' ? '' : parseFloat(val));
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">তারিখ</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">অতিরিক্ত নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: রফিকুলের মাধ্যমে পরিশোধ"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs min-h-[44px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'সংরক্ষিত হচ্ছে...' : '+ খরচ সংরক্ষণ করুন'}
            </button>
          </form>
        </div>

        {/* Right: Expenses History (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            খরচের বিস্তারিত তালিকা
          </h4>

          {expenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              এখনো কোনো খরচ এন্ট্রি করা হয়নি।
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs max-h-[500px] overflow-y-auto">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{exp.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium text-slate-600">
                        {categoryMap[exp.category]}
                      </span>
                      <span>·</span>
                      <span>{getBengaliDate(exp.date)}</span>
                      {exp.note && <span>· {exp.note}</span>}
                    </div>
                  </div>

                  <div className="font-extrabold text-rose-700 tabular-nums text-sm">
                    -{formatTaka(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
