import avatarPlaceholder from '../client/static/avatar-placeholder.webp';
import kivo from '../client/static/examples/kivo.webp';
import messync from '../client/static/examples/messync.webp';
import microinfluencerClub from '../client/static/examples/microinfluencers.webp';
import promptpanda from '../client/static/examples/promptpanda.webp';
import reviewradar from '../client/static/examples/reviewradar.webp';
import scribeist from '../client/static/examples/scribeist.webp';
import searchcraft from '../client/static/examples/searchcraft.webp';
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
    question: 'Where do the rates come from?',
    answer:
      'Per diem values follow the National Joint Council (NJC) directives and government accommodation schedules. Mileage rates are updated per province.',
  },
  {
    id: 2,
    question: 'Can I export estimates?',
    answer: 'Yes. Download PDF or CSV summaries for your approval packages and audit trail.',
  },
  {
    id: 3,
    question: 'Do you support teams?',
    answer:
      'Invite colleagues, assign roles, and monitor credit usage. Stripe billing supports both subscriptions and pay-per-credit models.',
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

export const examples = [
  {
    name: 'Regional Travel (ON → QC)',
    description: 'Mileage + 2 days M&I with hotel cap guidance.',
    imageSrc: kivo,
    href: '#',
  },
  {
    name: 'Ottawa Client Visit',
    description: '1-day meetings with per diem and transport.',
    imageSrc: messync,
    href: '#',
  },
  {
    name: 'Training Week',
    description: '5 days out-of-town with nightly hotel cap.',
    imageSrc: microinfluencerClub,
    href: '#',
  },
  {
    name: 'Team Offsite',
    description: 'Group travel planning for finance review.',
    imageSrc: promptpanda,
    href: '#',
  },
  {
    name: 'Field Audit Trip',
    description: 'Mileage-heavy day trips across regions.',
    imageSrc: reviewradar,
    href: '#',
  },
  {
    name: 'Conference Attendance',
    description: 'Per diem + hotel for multi-day event.',
    imageSrc: scribeist,
    href: '#',
  },
  {
    name: 'Public Sector Travel',
    description: 'NJC-compliant estimates for approvals.',
    imageSrc: searchcraft,
    href: '#',
  },
];
