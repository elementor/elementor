describe( 'TextPathHandler', () => {
	let TextPath, userAgent;
	const getElementSettings = jest.fn();

	beforeEach( async () => {
		jest.resetModules();

		global.elementorModules = {
			frontend: {
				handlers: {
					Base: class {
						getElementSettings() {
							return getElementSettings();
						}
					},
				},
			},
		};

		const HandlerClass = ( await import( 'elementor/modules/shapes/assets/js/frontend/handlers/text-path' ) ).default;

		TextPath = new HandlerClass();

		userAgent = jest.spyOn( navigator, 'userAgent', 'get' );
	} );

	it.each( [
		{
			browser: 'Chrome 90',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
			isRTL: {
				site: true,
				widget: false,
			},
			expected: true,
		},
		{
			browser: 'Chrome 96',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4430.212 Safari/537.36',
			isRTL: {
				site: true,
				widget: false,
			},
			expected: false,
		},
		{
			browser: 'Firefox 107',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0',
			isRTL: {
				site: true,
				widget: false,
			},
			expected: false,
		},
		{
			browser: 'Edge 18',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582',
			isRTL: {
				site: true,
				widget: false,
			},
			expected: true,
		},
		{
			browser: 'Edge 18',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582',
			isRTL: {
				site: false,
				widget: false,
			},
			expected: false,
		},
		{
			browser: 'Edge 18',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582',
			isRTL: {
				site: false,
				widget: true,
			},
			expected: true,
		},
		{
			browser: 'Edge 107',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.26',
			isRTL: {
				site: true,
				widget: false,
			},
			expected: false,
		},
		{
			browser: 'Opera 92',
			ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 OPR/92.0.4561.21',
			isRTL: {
				site: true,
				widget: false,
			},
			expected: false,
		},
	] )( 'shouldReverseText() -- Browser: $browser\t\tRTL: $isRTL\t\tShould Reverse: $expected', async ( { ua, isRTL, expected } ) => {
		// Arrange.
		userAgent.mockReturnValue( ua );

		// Mock for Chromium.
		// @see `elementor-common/utils/environment`.
		global.CSS = {};

		global.elementorFrontend = {
			config: {
				is_rtl: isRTL.site,
			},
			utils: {
				environment: ( await import( 'elementor-common/utils/environment' ) ).default,
			},
		};

		getElementSettings.mockReturnValue( {
			text_path_direction: isRTL.widget ? 'rtl' : '',
		} );

		// Act & Assert.
		expect( TextPath.shouldReverseText() ).toBe( expected );
	} );
} );
