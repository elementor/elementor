type TransitionCategory = { label: string };

describe( 'transition properties conditional loading', () => {
	const originalElementorPro = window.elementorPro;

	afterEach( () => {
		window.elementorPro = originalElementorPro;
		jest.resetModules();
	} );

	it.each( [
		{
			scenario: 'Pro not installed',
			proConfig: undefined,
			expectedLength: 1,
			expectedHasMargin: false,
		},
		{
			scenario: 'Pro version 3.35 or higher',
			proConfig: { config: { version: '3.35.0' } },
			expectedLength: 'greater than 1',
			expectedHasMargin: true,
		},
		{
			scenario: 'Pro version below 3.35',
			proConfig: { config: { version: '3.34.0' } },
			expectedLength: 1,
			expectedHasMargin: false,
		},
	] )( 'should load correct properties when $scenario', ( { proConfig, expectedLength, expectedHasMargin } ) => {
		window.elementorPro = proConfig;

		const { transitionProperties: props } = require( '../data' );

		if ( expectedLength === 'greater than 1' ) {
			expect( props.length ).toBeGreaterThan( 1 );
		} else {
			expect( props.length ).toBe( expectedLength );
		}

		expect( props.some( ( cat: TransitionCategory ) => cat.label === 'Margin' ) ).toBe( expectedHasMargin );
	} );
} );
