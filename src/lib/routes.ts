export type PortfolioRoute = '/' | '/about' | '/blog' | '/projects' | '/contact';

export interface MangaNavOption {
  href: Exclude<PortfolioRoute, '/'>;
  code: string;
  label: string;
  subtitle: string;
  chapter: string;
}

export const MANGA_NAV_OPTIONS: MangaNavOption[] = [
  {
    href: '/about',
    code: '01',
    label: 'PROFILE',
    subtitle: 'Story, craft & background',
    chapter: 'CH.01',
  },
  {
    href: '/projects',
    code: '02',
    label: 'PROJECTS',
    subtitle: 'Selected works, 3D & tools',
    chapter: 'CH.02',
  },
  {
    href: '/blog',
    code: '03',
    label: 'BLOG',
    subtitle: 'Field notes & dev essays',
    chapter: 'CH.03',
  },
  {
    href: '/contact',
    code: '04',
    label: 'CONTACT',
    subtitle: 'Say hello & send dispatch',
    chapter: 'CH.04',
  },
];
