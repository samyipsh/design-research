// Site-wide settings. Every generated link is relative, so the same build works at
// https://samyipsh.github.io/design-research/, at a custom domain root, or locally.
// BASE_PATH is only used where relative links are impossible (404.html, local preview).
const base = process.env.BASE_PATH ?? '/design-research/';

export const site = {
  title: 'design-research',
  repoUrl: 'https://github.com/samyipsh/design-research',
  branch: 'main',
  basePath: base.endsWith('/') ? base : `${base}/`,
};

export const paths = {
  content: 'content',
  research: 'content/research',
  design: 'content/design',
  theme: 'theme',
  out: '_site',
};
