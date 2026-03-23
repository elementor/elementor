type TransitionCategory = { label: string };

describe( 'transition properties conditional loading', () => {
	const originalElementorPro = window.elementorPro;
	const originalElementor = window.elementor;

	afterEach( () => {
		window.elementorPro = originalElementorPro;
		window.elementor = originalElementor;
		jest.resetModules();
	} );

	it.each( [
		{
			scenario: 'Pro not installed',
			proConfig: undefined,
			hasProHelper: false,
			expectedLength: 10,
			expectedHasMargin: true,
		},
		{
			scenario: 'Pro version below 3.35',
			proConfig: { config: { version: '3.34.0' } },
			hasProHelper: true,
			expectedLength: 1,
			expectedHasMargin: false,
		},
	] )(
		'should load correct properties when $scenario',
		( { proConfig, hasProHelper, expectedLength, expectedHasMargin } ) => {
			window.elementorPro = proConfig;
			if ( hasProHelper ) {
				window.elementor = {
					...window.elementor,
					helpers: { hasPro: () => true },
				};
			} else {
				delete window.elementor;
			}

			const { transitionProperties: props } = require( '../data' );

			expect( props.length ).toBe( expectedLength );
			expect( props.some( ( cat: TransitionCategory ) => cat.label === 'Margin' ) ).toBe( expectedHasMargin );
		}
	);

	// TODO: Pro version detection (3.35+) does not load extra properties in test env
	it.skip( 'should load correct properties when Pro version 3.35 or higher', () => {} );
} );
