/** Static public contact details, independent of admin data. */
export const STORE_INFO = {
  name: 'برج المبدع',
  tagline: 'للتقنية والإلكترونيات',
  description: 'برج المبدع للتقنية والإلكترونيات. تسوّق أجهزتك وادفع عند الاستلام.',
  logo: '/logo.webp',
  phone: '01552456445',
  internationalPhone: '+201552456445',
  telephoneUrl: 'tel:+201552456445',
  whatsappUrl: 'https://wa.me/201552456445',
} as const;
export const FOOTER_LINKS = [
  { label: 'عن برج المبدع للتقنية', href: '/about' },
  { label: 'سياسة الاستبدال والاسترجاع', href: '/return-policy' },
  { label: 'سياسة الخصوصية واتفاقية الاستخدام', href: '/privacy' },
] as const;
