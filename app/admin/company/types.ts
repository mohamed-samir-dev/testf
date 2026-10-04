// Strongly-typed interface for company data.
// Previously was `Record<string, string>` which gave zero type-safety —
// any typo in a field key would compile silently.
export interface CompanyData {
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsapp: string;
  website: string;
  email: string;
  currencyAr: string;
  currencyEn: string;
  taxNumber: string;
  shippingCompany: string;
  paymentMethod: string;
  details: string;
  logo: string;
  header: string;
  footer: string;
  stamp: string;
  cancelStamp: string;
  [key: string]: string; // index signature for dynamic access in loops
}
