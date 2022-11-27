jest.mock( 'elementor-dynamic-tags/tag-panel-view', () => {} );

describe( 'assets/dev/js/editor/components/dynamic-tags/control-behavior.js', () => {
	let controlBehavior;

	beforeEach( async () => {
		global.Marionette = {
			Behavior: {
				extend: ( obj ) => obj,
			},
			ItemView: {
				extend: ( obj ) => obj,
			},
		};

		controlBehavior = await import( 'elementor/assets/dev/js/editor/components/dynamic-tags/control-behavior.js' );

		controlBehavior.getOption = jest.fn();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{
			hasDefault: true,
			hasPro: true,
			isProConnected: true,
			hasTags: true,
			expected: false,
			description: 'Should not render tools when there is default',
		},
		{
			hasDefault: false,
			hasPro: true,
			isProConnected: true,
			hasTags: false,
			expected: false,
			description: 'Should not render tools when Pro is connected and there are no tags',
		},
		{
			hasDefault: false,
			hasPro: true,
			isProConnected: true,
			hasTags: true,
			expected: true,
			description: 'Should render tools when Pro is connected and there are tags',
		},
		{
			hasDefault: false,
			hasPro: true,
			isProConnected: false,
			hasTags: true,
			expected: true,
			description: 'Should render tools when Pro is disconnected and there are tags',
		},
		{
			hasDefault: false,
			hasPro: true,
			isProConnected: false,
			hasTags: false,
			expected: true,
			description: 'Should render tools when Pro is disconnected and there are no tags',
		},
		{
			hasDefault: true,
			hasPro: true,
			isProConnected: true,
			hasTags: true,
			expected: false,
			description: 'Should not render tools when Pro is connected, there are tags, and there is default',
		},
		{
			hasDefault: true,
			hasPro: true,
			isProConnected: false,
			hasTags: true,
			expected: false,
			description: 'Should not render tools when Pro is disconnected, there are tags, and there is default',
		},
		{
			hasDefault: true,
			hasPro: true,
			isProConnected: false,
			hasTags: false,
			expected: false,
			description: 'Should not render tools when Pro is disconnected, there are no tags, and there is default',
		},
		{
			hasDefault: false,
			hasPro: false,
			isProConnected: false,
			hasTags: false,
			expected: true,
			description: 'Should render tools when there is no Pro',
		},
		{
			hasDefault: true,
			hasPro: false,
			isProConnected: false,
			hasTags: false,
			expected: false,
			description: 'Should not render tools when there is no Pro and there is default',
		},
	] )( '$description', ( options ) => {
		// Arrange.
		controlBehavior.getOption.mockImplementation( ( option ) => {
			switch ( option ) {
				case 'dynamicSettings':
					return {
						default: options.hasDefault ? 'default-value' : null,
					};

				case 'tags':
					return options.hasTags ? [ 'tag' ] : [];
			}
		} );

		global.elementor = {
			helpers: {
				hasPro: () => options.hasPro,
				hasProAndNotConnected: () => options.hasPro && ! options.isProConnected,
			},
		};

		// Act & Assert.
		expect( controlBehavior.shouldRenderTools() ).toBe( options.expected );
	} );
} );
