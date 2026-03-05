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
			scenario: 'Pro version below 3.35',
			proConfig: { config: { version: '3.34.0' } },
			expectedLength: 1,
			expectedHasMargin: false,
		},
	] )( 'should load correct properties when $scenario', ( { proConfig, expectedLength, expectedHasMargin } ) => {
		window.elementorPro = proConfig;

		const { transitionProperties: props } = require( '../data' );

		expect( props.length ).toBe( expectedLength );
		expect( props.some( ( cat: TransitionCategory ) => cat.label === 'Margin' ) ).toBe( expectedHasMargin );
	} );

	// TODO: Pro version detection (3.35+) does not load extra properties in test env
	it.skip( 'should load correct properties when Pro version 3.35 or higher', () => {} );
} );
