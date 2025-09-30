import { routes } from 'wasp/client/router';
import { BlogUrl, FAQUrl } from '../../../shared/common';
import type { NavigationItem } from './NavBar';

const staticNavigationItems: NavigationItem[] = [
  { name: 'FAQ', to: FAQUrl },
  { name: 'Blog', to: BlogUrl },
];

export const marketingNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '/#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  ...staticNavigationItems,
] as const;

export const demoNavigationitems: NavigationItem[] = [
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  ...staticNavigationItems,
] as const;
