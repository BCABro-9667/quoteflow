import type { NavItemGroup } from '@/types';
import { LayoutDashboard, Building2, FileText, Settings } from 'lucide-react';

export const siteConfig = {
  name: 'QuoteFlow',
  description: 'Efficient Quotation Management System',
  url: 'https://quoteflow.example.com', // Replace with your actual URL
  ogImage: 'https://quoteflow.example.com/og.jpg', // Replace with your actual OG image
};

export const mainNav: NavItemGroup[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview of your activities.',
      },
      {
        title: 'Companies',
        href: '/companies',
        icon: Building2,
        description: 'Manage your client companies.',
      },
      {
        title: 'Quotations',
        href: '/quotations',
        icon: FileText,
        description: 'Create and manage quotations.',
      },
    ],
  },
  // {
  //   title: 'Settings',
  //   items: [
  //     {
  //       title: 'General',
  //       href: '/settings',
  //       icon: Settings,
  //       description: 'Application settings.',
  //     },
  //   ],
  // }
];
