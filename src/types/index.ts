export type ProductUnit = 'কেজি' | 'বস্তা' | 'মণ';

export interface Product {
  id: string;
  name: string;
  category: 'গমের ভুসি' | 'খইল' | 'ফিড' | 'ছোলা ও ডাল' | 'খুদি ও কুঁড়া' | 'ভিটামিন ও খনিজ';
  imageUrl: string;
  buyPricePerKg: number;    // মোকাম থেকে পাইকারি কেনার দর (প্রতি কেজি)
  sellPricePerKg: number;   // খুচরা বিক্রয় দর (প্রতি কেজি)
  bagWeightKg: number;      // ১ বস্তায় কত কেজি (যেমন: ৫০ কেজি)
  bagSellPrice: number;     // ১ বস্তার দর
  stockKg: number;          // দোকানে বর্তমান মজুত (কেজি)
  minStockAlertKg: number;  // সতর্কতামূলক সর্বনিম্ন স্টক
  description: string;      // বিস্তারিত বিবরণ
  nutritionNote?: string;   // গাভী/ষাঁড়/ছাগলের পুষ্টির উপকারিতা
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantityKg: number;
  packageType: 'kg' | 'bag' | 'maund';
  unitPrice: number;
  buyPricePerKg: number;
  total: number;
  totalPrice?: number;
}

// সরলীকৃত অর্ডার স্ট্যাটাস: পেন্ডিং (নতুন) অথবা কনফার্ম (সম্পন্ন)
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'cash' | 'bkash_nagad' | 'partial' | 'due';
export type DeliveryType = 'home_delivery' | 'pickup';

export interface Order {
  id: string;
  memoNo: string;
  customerId?: string;      // অনন্য গ্রাহক আইডি (Unique Customer ID binding)
  previousDue?: number;     // এই মেমোর আগের পুরনো বকেয়া
  businessDate?: string;    // বাংলাদেশের ব্যবসায়িক শিফট তারিখ (সকাল ৯টা থেকে রাত ২টা পর্যন্ত আজকের তারিখ)
  customerName: string;
  customerNickName?: string; // ডাকনাম / পিতার নাম / খামার
  phone: string;
  moholla?: string;         // নির্বাচিত পাড়া / মহল্লা
  villageAddress: string;   // বিস্তারিত ঠিকানা
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  items: OrderItem[];
  status: OrderStatus;
  source: 'online' | 'pos';
  createdAt: string; // ISO string
  updatedAt: string;
  note?: string;
}

export interface DuePaymentRecord {
  id: string;
  date: string;
  type: 'sale_due' | 'payment_received' | 'cash_sale';
  amount: number;
  memoNo?: string;
  note?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CustomerDue {
  id: string;
  customerName: string;
  fatherOrFarmName?: string; // ডাকনাম / পিতার নাম / খামার
  phone: string;
  village?: string;
  moholla: string;           // পাড়া / মহল্লা
  totalDue: number;
  lifetimePurchases: number;
  lastPaymentDate: string;
  history: DuePaymentRecord[];
}

export type ExpenseCategory = 'rent' | 'transport' | 'labour' | 'electricity' | 'salary' | 'tea_snacks' | 'other';

export interface ShopExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface StockInRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantityKg: number;
  buyPricePerKg: number;
  totalCost: number;
  supplierName?: string;
  invoiceNo?: string;
  note?: string;
}

export interface DailyCashRecord {
  id: string;
  date: string; // YYYY-MM-DD
  openingCash: number;
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  proprietor: string;
  phone: string;
  secondaryPhone: string;
  address: string;
  bkashNumber: string;
  nagadNumber: string;
  deliveryCharge: number;
  freeDeliveryMinAmount: number;
  adminUsername: string;
  adminPassword: string;
  memoFooterNote: string;
  firebaseUrl: string;
  // Customizable Storefront Brand Showcase fields
  brandStoryTitle?: string;
  brandStorySubtitle?: string;
  proprietorMessage?: string;
  shopOpeningHours?: string;
  whatsappNumber?: string;
  advisoryNote?: string;
}

export interface ResetOptions {
  resetOrders?: boolean;          // সকল অর্ডার ও বিক্রয় তথ্য
  resetCustomersDue?: boolean;    // সকল গ্রাহকের তালিকা ও বাকি খাতা
  resetExpenses?: boolean;        // সকল খরচের হিসাব
  resetStockIns?: boolean;        // মোকাম চালান / স্টক ইন হিস্ট্রি
  resetDailyCash?: boolean;       // দৈনিক ক্যাশ রোকার
  resetProducts?: boolean;        // পণ্যের মজুত ও তালিকা ডিফল্টে ফিরিয়ে নেওয়া
  resetNeighborhoods?: boolean;   // পাড়া/মহল্লা তালিকা রিসেট
}
