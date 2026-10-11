// Website pages intentionally excluded from search. Keep private Central
// reports under /central/; mailbox exports and NAS reports stay off the site.
export const noindexRegistry = [
  {path: '/central', descendants: true, reason: 'Private staff assistant and evaluation pages'},
  {path: '/admin', descendants: true, reason: 'Private administration'},
  {path: '/used-oil', descendants: false, reason: 'Direct-mail campaign landing page'},
  {path: '/404', descendants: false, reason: 'Not-found page'},
];

export function isNoindexPage(page) {
  const pathname = new URL(page, 'https://dolphincentrifuge.com').pathname.replace(/\/$/, '');
  return noindexRegistry.some(({path, descendants}) => pathname === path ||
    pathname === path + '.html' || (descendants && pathname.startsWith(path + '/')));
}
