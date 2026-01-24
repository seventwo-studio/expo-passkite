// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://seventwo-studio.github.io',
	base: '/passkite',
	integrations: [
		starlight({
			title: 'PassKite',
			description: 'Generate Apple Wallet passes (.pkpass) and add them to iOS Wallet or Google Wallet',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/seventwo-studio/passkite' },
			],
			editLink: {
				baseUrl: 'https://github.com/seventwo-studio/passkite/edit/main/docs/',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Setup Credentials', slug: 'guides/setup-credentials' },
						{ label: 'Creating Passes', slug: 'guides/creating-passes' },
						{ label: 'Pass Types', slug: 'guides/pass-types' },
						{ label: 'Wallet Integration', slug: 'guides/wallet-integration' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
			customCss: [],
			head: [
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://seventwo-studio.github.io/passkite/og-image.png',
					},
				},
			],
		}),
	],
});
