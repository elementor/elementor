import { loadCustomIconLibraries, resolveCustomIcon } from '../custom-icon-libraries';

const MY_ICONS_CONFIG = {
	name: 'my-icons',
	label: 'My Icons',
	prefix: 'my-icons-',
	displayPrefix: 'my-icons',
	fetchJson: 'https://example.com/uploads/my-icons.js',
	native: false,
};

describe('custom-icon-libraries', () => {
	const originalElementor = window.elementor;

	beforeEach(() => {
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{ name: 'all', label: 'All Icons', native: true },
						{ name: 'fa-solid', label: 'Font Awesome - Solid', prefix: 'fa-', native: true },
						MY_ICONS_CONFIG,
						{
							name: 'empty-set',
							label: 'Empty',
							prefix: 'empty-',
							displayPrefix: 'empty',
							native: false,
						},
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
	});

	afterEach(() => {
		window.elementor = originalElementor;
		jest.restoreAllMocks();
	});

	it('loads name-only custom libraries and skips native tabs', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ icons: ['badge', 'spark'] }),
		});

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect(global.fetch).toHaveBeenCalledTimes(1);
		expect(global.fetch).toHaveBeenCalledWith(MY_ICONS_CONFIG.fetchJson, expect.objectContaining({ mode: 'cors' }));
		expect(window.elementor?.helpers?.enqueueIconFonts).toHaveBeenCalledWith('my-icons');
		expect(catalog).toEqual([
			expect.objectContaining({
				id: 'my-icons:badge',
				library: 'my-icons',
				value: 'my-icons my-icons-badge',
				glyphClass: 'my-icons my-icons-badge',
			}),
			expect.objectContaining({
				id: 'my-icons:spark',
				value: 'my-icons my-icons-spark',
			}),
		]);
	});

	it('returns empty catalog when fetch fails', async () => {
		// Arrange.
		global.fetch = jest.fn().mockRejectedValue(new Error('network'));

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect(catalog).toEqual([]);
	});

	it('resolves custom icons that include svg markup', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					icons: {
						badge: {
							svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1"></path></svg>',
						},
					},
				}),
		});

		// Act.
		const icon = await resolveCustomIcon('my-icons', 'my-icons my-icons-badge');

		// Assert.
		expect(icon?.svgMarkup).toContain('<svg');
		expect(icon?.name).toBe('badge');
	});

	it('fetches a sibling svg when the catalog only has icon names', async () => {
		// Arrange.
		global.fetch = jest.fn().mockImplementation((url: string) => {
			if (url.endsWith('my-icons.js')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ icons: ['badge'] }),
				});
			}

			if (url.endsWith('badge.svg')) {
				return Promise.resolve({
					ok: true,
					text: () =>
						Promise.resolve('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><path d="M2 2"></path></svg>'),
				});
			}

			return Promise.resolve({ ok: false, json: () => Promise.resolve({}), text: () => Promise.resolve('') });
		});

		// Act.
		const icon = await resolveCustomIcon('my-icons', 'my-icons my-icons-badge');

		// Assert.
		expect(icon?.svgMarkup).toContain('M2 2');
		expect(global.fetch).toHaveBeenCalledWith(
			'https://example.com/uploads/badge.svg',
			expect.objectContaining({ mode: 'cors' })
		);
	});
});
