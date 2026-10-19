import { Product, CustomerDue, ShopExpense, ShopSettings, StockInRecord, Neighborhood } from '../types';

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার',
  proprietor: 'মোঃ শাহরিয়ার ইসলাম',
  phone: '০১৭১২-৩৪৫৬৭৮',
  secondaryPhone: '০১৮১২-৯৮৭৬৫৪',
  address: 'থানা মোড় বাজার, ডেইরি জোন রোড, বাংলাদেশ',
  bkashNumber: '০১৭১২-৩৪৫৬৭৮ (পার্সোনাল)',
  nagadNumber: '০১৮১২-৯৮৭৬৫৪ (মার্চেন্ট)',
  deliveryCharge: 60,
  freeDeliveryMinAmount: 3000,
  adminUsername: 'admin',
  adminPassword: 'admin123',
  memoFooterNote: 'বিক্রিত মাল ফেরত নেওয়া হয় না। উন্নত গো-খাদ্যে দুধ ও মাংসের সর্বোচ্চ নিশ্চয়তা। আমাদের সাথে থাকার জন্য ধন্যবাদ।',
  firebaseUrl: 'https://pjri-e771a-default-rtdb.firebaseio.com/',
  brandStoryTitle: 'খামারির সমৃদ্ধি ও খাঁটি গো-খাদ্যের বিশ্বস্ত মোকাম',
  brandStorySubtitle: '১৯৯৮ সাল থেকে স্থানীয় ডেইরি খামারি ভাইদের সাথে আস্থার সুদৃঢ় সম্পর্ক',
  proprietorMessage: 'আমরা কোনো প্রকার মধ্যস্বত্বভোগী ছাড়া সরাসরি কুষ্টিয়ার দেশি লাল গমের মিল ও আন্তর্জাতিক কানাডিয়ান পোর্ট থেকে প্রথম চাপের ভুসি এবং কাঠের ঘানির খাঁটি সরিষার খইল সংগ্রহ করি। প্রতিটি দানায় সঠিক প্রোটিন ও পুষ্টি উপাদান নিশ্চিত করাই আমাদের ব্যবসার মূল অঙ্গীকার।',
  shopOpeningHours: 'প্রতিদিন সকাল ৭:০০টা থেকে রাত ১০:০০টা (সপ্তাহের ৭ দিনই খোলা)',
  whatsappNumber: '০১৭১২-৩৪৫৬৭৮',
  advisoryNote: 'আপনার খামারের গাভীর দুধের ফ্যাট বৃদ্ধি বা ষাঁড় মোটাতাজাকরণে দৈনিক সুষম খাদ্য তালিকা নির্ধারণে অভিজ্ঞ পরামর্শের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।',
};

// No hardcoded dummy/demo data — all catalog, transactions, customers and neighborhoods live in Firebase
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_EXPENSES: ShopExpense[] = [];
export const INITIAL_CUSTOMERS_DUE: CustomerDue[] = [];
export const INITIAL_STOCK_IN: StockInRecord[] = [];
export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [];
