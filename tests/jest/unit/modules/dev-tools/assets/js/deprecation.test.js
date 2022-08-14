import Deprecation from 'elementor/modules/dev-tools/assets/js/deprecation';

const deprecation = new Deprecation();

describe( 'modules/dev-tools/assets/js/deprecation.js', () => {
	beforeEach( () => {
		global.elementorDevToolsConfig = {
			isDebug: true,
			urls: {
				assets: 'https://localtest/assets/',
			},
			deprecation: {
				current_version: '3.0.0',
				soft_version_count: 4,
				hard_version_count: 8,
				soft_notices: [],
			},
		};

		global.elementorDevTools = {
			consoleWarn: jest.fn(),
		};
	} );

	afterAll( () => {
		delete global.elementorDevToolsConfig;
		delete global.elementorDevTools;
	} );

	test( 'deprecated() -- Should print soft deprecation', () => {
		// Act.
		deprecation.deprecated( 'test', '3.0.0', 'anything' );

		// Assert.
		expect( elementorDevTools.consoleWarn ).toBeCalledWith( '`test` is soft deprecated since 3.0.0 - Use `anything` instead' );
	} );

	test( 'deprecated() -- Should print hard deprecation', () => {
		deprecation.deprecated( 'test', '0.0.0', 'anything' );

		expect( elementorDevTools.consoleWarn ).toBeCalledWith( expect.stringContaining( 'hard' ) );
	} );

	test( 'parseVersion() -- Sanity', () => {
		expect( deprecation.compareVersion( '1.1.3.beta', '1.2.3.beta' ) ).toBe( -1 );
		expect( deprecation.compareVersion( '1.2.3.beta', '1.2.3.beta' ) ).toBe( 0 );
		expect( deprecation.compareVersion( '1.2.3.beta', '1.1.3.beta' ) ).toBe( 1 );
	} );

	test( 'getTotalMajor() -- Sanity', () => {
		expect( deprecation.getTotalMajor( deprecation.parseVersion( '1.2.3.beta' ) ) ).toBe( 12 );
	} );

	test( 'isSoftDeprecated() -- Sanity', () => {
		expect( deprecation.isSoftDeprecated( '2.9.0' ) ).toBe( true );
		expect( deprecation.isSoftDeprecated( '3.4.0' ) ).toBe( true );
		expect( deprecation.isSoftDeprecated( '3.5.0' ) ).toBe( false );
	} );

	test( 'isHardDeprecated() -- Sanity', () => {
		expect( deprecation.isHardDeprecated( '3.7.0' ) ).toBe( false );
		expect( deprecation.isHardDeprecated( '3.8.0' ) ).toBe( true );
		expect( deprecation.isHardDeprecated( '3.9.0' ) ).toBe( true );
	} );
} );
