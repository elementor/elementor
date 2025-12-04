const ICONS_BASE_PATH = '/wp-content/plugins/elementor/tests/playwright/resources/icons';

export default {
	top_with_licences: [
		{
			license: [ 'free' ],
			title_small: 'Test Greeting Free',
			title: 'Test Title - Free License',
			description: 'Test description for free license users with predictable content.',
			button_create_page_title: 'Create a Page',
			button_watch_title: 'Watch Guide',
			button_watch_url: 'https://www.youtube.com/watch?v=test123',
			youtube_embed_id: 'test123',
		},
		{
			license: [ 'pro' ],
			title_small: 'Test Greeting Pro',
			title: 'Test Title - Pro License',
			description: 'Test description for pro license users with predictable content.',
			button_create_page_title: 'Create a Page',
			button_watch_title: 'Watch Guide',
			button_watch_url: 'https://www.youtube.com/watch?v=test456',
			youtube_embed_id: 'test456',
		},
		{
			license: [ 'one' ],
			title_small: 'Test Greeting Editor One',
			title: 'Test Title - Editor One',
			description: 'Test description for Editor One with predictable content.',
			button_create_page_title: 'Create a Page',
			button_watch_title: 'Watch Guide',
			button_watch_url: 'https://www.youtube.com/watch?v=test789',
			youtube_embed_id: 'test789',
		},
	],
	get_started: [
		{
			license: [ 'free' ],
			header: {
				title: 'Test Get Started Title Free',
				description: 'Test get started description for free users with predictable content.',
			},
			repeater: [
				{
					title: 'Brand Identity Setup',
					title_small: 'Configure',
					url: '',
					is_relative_url: false,
					title_small_color: 'text.secondary',
					tab_id: 'settings-site-identity',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Color Palette',
					title_small: 'Design',
					url: '',
					is_relative_url: false,
					title_small_color: 'text.tertiary',
					tab_id: 'global-colors',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Typography System',
					title_small: 'Style',
					url: '',
					is_relative_url: false,
					tab_id: 'global-typography',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Template Library',
					title_small: 'Browse',
					url: 'admin.php?page=elementor-app',
					is_relative_url: false,
					title_small_color: 'text.secondary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Popup Designer',
					title_small: 'Create',
					url: 'edit.php?post_type=elementor_library&page=popup_templates',
					is_relative_url: true,
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Icon Collection',
					title_small: 'Manage',
					url: 'admin.php?page=elementor_custom_icons',
					is_relative_url: false,
					title_small_color: 'text.tertiary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
			],
		},
		{
			license: [ 'pro' ],
			header: {
				title: 'Test Get Started Title Pro',
				description: 'Test get started description for pro users with predictable content.',
			},
			repeater: [
				{
					title: 'Website Configuration',
					title_small: 'Setup',
					url: '',
					is_relative_url: false,
					title_small_color: 'text.tertiary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Logo & Favicon',
					title_small: 'Upload',
					url: '',
					is_relative_url: false,
					tab_id: 'settings-site-identity',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Design Tokens',
					title_small: 'Customize',
					url: '',
					is_relative_url: false,
					tab_id: 'global-colors',
					title_small_color: 'text.secondary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Font Families',
					title_small: 'Select',
					url: '',
					is_relative_url: false,
					tab_id: 'global-typography',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Theme Templates',
					title_small: 'Explore',
					url: 'admin.php?page=elementor-app',
					is_relative_url: false,
					title_small_color: 'text.tertiary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Modal Windows',
					title_small: 'Build',
					url: 'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup',
					is_relative_url: true,
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'SVG Icons',
					title_small: 'Import',
					url: 'admin.php?page=elementor_custom_icons',
					is_relative_url: false,
					title_small_color: 'text.secondary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Web Fonts',
					title_small: 'Add',
					url: 'admin.php?page=elementor_custom_fonts',
					is_relative_url: true,
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
			],
		},
		{
			license: [ 'one' ],
			header: {
				title: 'Test Get Started Title Editor One',
				description: 'Test get started description for Editor One with predictable content.',
			},
			repeater: [
				{
					title: 'Site Preferences',
					title_small: 'Adjust',
					url: '',
					is_relative_url: false,
					title_small_color: 'text.secondary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Visual Identity',
					title_small: 'Define',
					url: '',
					is_relative_url: false,
					tab_id: 'settings-site-identity',
					title_small_color: 'text.tertiary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Color Scheme',
					title_small: 'Choose',
					url: '',
					is_relative_url: false,
					tab_id: 'global-colors',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Text Styling',
					title_small: 'Edit',
					url: '',
					is_relative_url: false,
					tab_id: 'global-typography',
					title_small_color: 'text.secondary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Layout Templates',
					title_small: 'View',
					url: 'admin.php?page=elementor-app',
					is_relative_url: false,
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Overlay Popups',
					title_small: 'Design',
					url: 'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup',
					is_relative_url: true,
					title_small_color: 'text.tertiary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Custom Symbols',
					title_small: 'Organize',
					url: 'admin.php?page=elementor_custom_icons',
					is_relative_url: false,
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
				{
					title: 'Typeface Library',
					title_small: 'Browse',
					url: 'admin.php?page=elementor_custom_fonts',
					is_relative_url: true,
					title_small_color: 'text.secondary',
					image: `${ ICONS_BASE_PATH }/site-settings.svg`,
				},
			],
		},
	],
	add_ons: {
		display_with_one_plan: false,
		header: {
			title: 'Test Add-ons Title',
			description: 'Test add-ons description with predictable content for testing purposes.',
		},
		repeater: [
			{
				file_path: 'test-plugin-1/test-plugin-1.php',
				title: 'Test Plugin 1',
				url: '',
				description: 'Test plugin description with predictable content for testing.',
				button_label: 'Install',
				image: `${ ICONS_BASE_PATH }/icon-community.svg`,
				type: 'wporg',
			},
			{
				file_path: 'test-plugin-2/test-plugin-2.php',
				title: 'Test Plugin 2',
				url: '',
				description: 'Test plugin description with predictable content for testing.',
				button_label: 'Install',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-youtube.svg',
				type: 'wporg',
			},
			{
				file_path: 'test-plugin-3/test-plugin-3.php',
				title: 'Test Plugin 3',
				url: '',
				description: 'Test plugin description with predictable content for testing.',
				button_label: 'Install',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-question-mark.svg',
				type: 'wporg',
			},
			{
				file_path: 'test-plugin-4/test-plugin-4.php',
				title: 'Test Plugin 4',
				url: 'https://test.example.com/plugin4',
				description: 'Test plugin description with predictable content for testing.',
				button_label: 'Install',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
				type: 'wporg',
			},
			{
				title: 'Test Elementor AI',
				url: 'https://test.example.com/elementor-ai',
				description: 'Test AI description with predictable content for testing purposes.',
				button_label: 'Let\'s go',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/theme-builder.svg',
				type: 'link',
				condition: {
					key: 'introduction_meta',
					value: 'ai_get_started',
				},
			},
		],
		footer: {
			label: 'Explore more add-ons',
			file_path: 'wp-admin/admin.php?page=elementor-apps',
		},
	},
	sidebar_upgrade: [
		{
			license: [ 'free' ],
			show: 'true',
			header: {
				title: 'Test Upgrade Title',
				description: 'Test upgrade description with predictable content for testing.',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
			},
			cta: {
				label: 'Upgrade Now',
				url: 'https://test.example.com/upgrade',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
			},
			repeater: [
				{
					title: 'Test Feature 1',
				},
				{
					title: 'Test Feature 2',
				},
				{
					title: 'Test Feature 3',
				},
				{
					title: 'Test Feature 4',
				},
				{
					title: 'Test Feature 5',
				},
				{
					title: 'Test Feature 6',
				},
				{
					title: 'Test Feature 7',
				},
				{
					title: 'Test Feature 8',
				},
			],
		},
		{
			license: [ 'pro' ],
			show: 'false',
			header: {
				title: 'Test Upgrade Title',
				description: 'Test upgrade description with predictable content for testing.',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
			},
			cta: {
				label: 'Upgrade Now',
				url: 'https://test.example.com/upgrade',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
			},
			repeater: [
				{
					title: 'Test Feature 1',
				},
				{
					title: 'Test Feature 2',
				},
				{
					title: 'Test Feature 3',
				},
				{
					title: 'Test Feature 4',
				},
				{
					title: 'Test Feature 5',
				},
				{
					title: 'Test Feature 6',
				},
				{
					title: 'Test Feature 7',
				},
				{
					title: 'Test Feature 8',
				},
			],
		},
		{
			license: [ 'one' ],
			show: 'false',
			header: {
				title: 'Test Upgrade Title',
				description: 'Test upgrade description with predictable content for testing.',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
			},
			cta: {
				label: 'Upgrade Now',
				url: 'https://test.example.com/upgrade',
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-crown.svg',
			},
			repeater: [
				{
					title: 'Test Feature 1',
				},
				{
					title: 'Test Feature 2',
				},
				{
					title: 'Test Feature 3',
				},
				{
					title: 'Test Feature 4',
				},
				{
					title: 'Test Feature 5',
				},
				{
					title: 'Test Feature 6',
				},
				{
					title: 'Test Feature 7',
				},
				{
					title: 'Test Feature 8',
				},
			],
		},
	],
	sidebar_promotion_variants: [
		{
			license: [ 'essential' ],
			is_enabled: 'true',
			type: 'banner',
			data: {
				image: `${ ICONS_BASE_PATH }/icon-community.svg`,
				link: 'https://test.example.com/essential-banner',
			},
		},
		{
			license: [ 'free' ],
			is_enabled: 'true',
			type: 'banner',
			data: {
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-youtube.svg',
				link: 'https://test.example.com/free-banner',
			},
		},
		{
			license: [ 'expired' ],
			is_enabled: 'true',
			type: 'banner',
			data: {
				image: '/wp-content/plugins/elementor/tests/playwright/resources/icons/icon-question-mark.svg',
				link: 'https://test.example.com/expired-banner',
			},
		},
		{
			license: [ 'free' ],
			is_enabled: 'false',
			type: 'default',
			data: {
				header: {
					title: 'Test Upgrade Title',
					description: 'Test upgrade description with predictable content for testing.',
					image: `${ ICONS_BASE_PATH }/icon-crown.svg`,
				},
				cta: {
					label: 'Upgrade Now',
					url: 'https://test.example.com/upgrade',
					image: `${ ICONS_BASE_PATH }/icon-crown.svg`,
				},
				repeater: [
					{
						title: 'Test Feature 1',
					},
					{
						title: 'Test Feature 2',
					},
					{
						title: 'Test Feature 3',
					},
					{
						title: 'Test Feature 4',
					},
					{
						title: 'Test Feature 5',
					},
					{
						title: 'Test Feature 6',
					},
					{
						title: 'Test Feature 7',
					},
					{
						title: 'Test Feature 8',
					},
				],
			},
		},
		{
			license: [ 'pro' ],
			is_enabled: 'false',
			type: 'default',
			data: {
				header: {
					title: 'Test Upgrade Title',
					description: 'Test upgrade description with predictable content for testing.',
					image: `${ ICONS_BASE_PATH }/icon-crown.svg`,
				},
				cta: {
					label: 'Upgrade Now',
					url: 'https://test.example.com/upgrade',
					image: `${ ICONS_BASE_PATH }/icon-crown.svg`,
				},
				repeater: [
					{
						title: 'Test Feature 1',
					},
					{
						title: 'Test Feature 2',
					},
					{
						title: 'Test Feature 3',
					},
					{
						title: 'Test Feature 4',
					},
					{
						title: 'Test Feature 5',
					},
					{
						title: 'Test Feature 6',
					},
					{
						title: 'Test Feature 7',
					},
					{
						title: 'Test Feature 8',
					},
				],
			},
		},
		{
			license: [ 'one' ],
			is_enabled: 'false',
			type: 'default',
			data: {
				header: {
					title: 'Test Upgrade Title',
					description: 'Test upgrade description with predictable content for testing.',
					image: `${ ICONS_BASE_PATH }/icon-crown.svg`,
				},
				cta: {
					label: 'Upgrade Now',
					url: 'https://test.example.com/upgrade',
					image: `${ ICONS_BASE_PATH }/icon-crown.svg`,
				},
				repeater: [
					{
						title: 'Test Feature 1',
					},
					{
						title: 'Test Feature 2',
					},
					{
						title: 'Test Feature 3',
					},
					{
						title: 'Test Feature 4',
					},
					{
						title: 'Test Feature 5',
					},
					{
						title: 'Test Feature 6',
					},
					{
						title: 'Test Feature 7',
					},
					{
						title: 'Test Feature 8',
					},
				],
			},
		},
	],
	external_links: [
		{
			label: 'Help Center',
			image: `${ ICONS_BASE_PATH }/icon-question-mark.svg`,
			url: 'https://test.example.com/help',
		},
		{
			label: 'Youtube',
			image: `${ ICONS_BASE_PATH }/icon-youtube.svg`,
			url: 'https://test.example.com/youtube',
		},
		{
			label: 'Facebook Community',
			image: `${ ICONS_BASE_PATH }/icon-community.svg`,
			url: 'https://test.example.com/community',
		},
		{
			label: 'Blog',
			image: `${ ICONS_BASE_PATH }/icon-community.svg`,
			url: 'https://test.example.com/blog',
		},
	],
};
