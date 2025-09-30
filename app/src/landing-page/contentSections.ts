import avatarPlaceholder from '../client/static/avatar-placeholder.webp';
import type { GridFeature } from './components/FeaturesGrid';

export const features: GridFeature[] = [
  {
    eyebrow: 'Compliance',
    name: 'Government-rate compliance engine',
    description:
      'Daily synchronisation with NJC meal allowances, kilometric tables, and accommodation guidance keeps every estimate policy-aligned.',
    points: [
      'Automatic rate refreshes with historical change tracking and audit trail.',
      'Regional variance handling for provinces, territories, and international travel.',
      'Exception notes for out-of-policy items so approvers see context instantly.',
    ],
  },
  {
    eyebrow: 'Planning',
    name: 'Workspace built for travel planners',
    description:
      'Model multi-stop itineraries, compare scenarios, and collaborate with stakeholders in a single shared workspace.',
    points: [
      'Scenario estimates with adjustable mileage, lodging nights, and per diem assumptions.',
      'Share read-only links with approvers or export briefing summaries for stakeholders.',
      'Track consumption of free credits and subscription status in real time.',
    ],
  },
  {
    eyebrow: 'Finance & reporting',
    name: 'Finance-ready deliverables',
    description:
      'Deliver exports, API payloads, and webhook events that plug straight into finance workflows and procurement systems.',
    points: [
      'One-click PDF and CSV exports with itemised totals and cost drivers.',
      'Stripe-powered billing for subscriptions or pay-per-credit models, with invoices your finance team recognises.',
      'Webhook/API hooks to push estimates into ERPs, data warehouses, or analytics dashboards.',
    ],
    note: 'Need something bespoke? Custom fields and approval metadata can be configured without leaving the app.',
  },
];

export const testimonials = [
  {
    name: 'Melissa Grant',
    role: 'Director, Government Travel Services',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote:
      'Our finance officers trust every estimate because the tool mirrors the NJC directives exactly. Reviews that used to take hours now take minutes.',
  },
  {
    name: 'Sacha Desroches',
    role: 'Procurement Lead, Provincial Agency',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote:
      'Mileage, meals, hotels—everything is in one export. It made our approval workflow predictable and auditable.',
  },
  {
    name: 'Jordan Patel',
    role: 'Operations Manager, National Association',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote:
      'We roll out estimates to dozens of staff each month. Credits and subscriptions make budgeting effortless.',
  },
];

export const faqs = [
  {
    id: 1,
    question: 'What do I get beyond a spreadsheet or manual lookup?',
    answer:
      'The estimator automatically syncs NJC meal allowances, kilometric rates, and PWGSC accommodation guidance so every figure is policy-compliant the moment you enter it. Instead of maintaining tabs and formulas, you walk through four guided steps and export finance-ready summaries in minutes.',
  },
  {
    id: 2,
    question: 'How much time can we expect to save each month?',
    answer:
      'Teams running 8–10 itineraries a month see planning time drop from 45 minutes per trip to under 10 minutes. That’s five or more hours saved every month—often more than the cost of a subscription in the first week.',
  },
  {
    id: 3,
    question: 'Do you support teams?',
    answer:
      'Yes. Invite colleagues, assign approver/requester roles, and track usage in real time. You can start with pay-per-credit billing and graduate to subscriptions as your volume grows—no hidden fees.',
  },
  {
    id: 4,
    question: 'How do approvals and finance benefit?',
    answer:
      'Approvers see policy citations and contextual notes alongside every number, so they can sign off faster. Finance teams receive clean PDFs and CSVs that drop directly into audit logs or ERP uploads, no reformatting required.',
  },
  {
    id: 5,
    question: 'What happens when directives change?',
    answer:
      'You don’t have to chase updates. We monitor NJC and PWGSC changes and refresh the datasets automatically. When you open the estimator, you’re already working with the latest per diem caps, mileage allowances, and accommodation limits.',
  },
];

export const footerNavigation = {
  app: [
    { name: 'Estimator', href: '/estimator' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Account', href: '/account' },
  ],
  company: [
    { name: 'Support', href: 'mailto:support@travelcost.app' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ],
};
