import {
	hardDeprecated, softDeprecated, deprecatedMessage, deprecated, compareVersion, getTotalMajor, parseVersion,
	isSoftDeprecated, isHardDeprecated,
} from 'elementor/modules/dev-tools/assets/js/deprecation/utils';

import { consoleWarn } from 'elementor/modules/dev-tools/assets/js/utils';

jest.mock( 'elementor/modules/dev-tools/assets/js/utils', () => ( {
	consoleWarn: jest.fn(),
} ) );

describe( 'modules/dev-tools/assets/js/deprecation/utils.js', () => {
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
			},
		};
	} );

	afterAll( () => {
		delete global.elementorDevToolsConfig;
	} );

	test( 'softDeprecated() -- Sanity', () => {
		// Act.
		softDeprecated( 'test', '3.0.0', 'anything' );

		// Assert.
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'test' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( '3.0.0' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'anything' ) );
	} );

	test( 'hardDeprecated() -- Sanity', () => {
		// Act.
		hardDeprecated( 'hard', '3.0.0', 'anything' );

		// Assert.
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'hard' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( '3.0.0' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'anything' ) );
	} );

	test( 'deprecatedMessage() -- Sanity', () => {
		// Arrange.
		deprecatedMessage( 'hard', 'test', '3.0.0', 'anything' );

		// Assert.
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'hard' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'test' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( '3.0.0' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'anything' ) );
	} );

	test( 'deprecated() -- Should print soft deprecation', () => {
		// Act.
		deprecated( 'test', '3.0.0', 'anything' );

		// Assert.
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'test' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'soft' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( '3.0.0' ) );
		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'anything' ) );
	} );

	test( 'deprecated() -- Should print hard deprecation', () => {
		deprecated( 'test', '0.0.0', 'anything' );

		expect( consoleWarn ).toBeCalledWith( expect.stringContaining( 'hard' ) );
	} );

	test( 'parseVersion() -- Sanity', () => {
		expect( compareVersion( '1.1.3.beta', '1.2.3.beta' ) ).toBe( -1 );
		expect( compareVersion( '1.2.3.beta', '1.2.3.beta' ) ).toBe( 0 );
		expect( compareVersion( '1.1.3.beta', '1.2.3.beta' ) ).toBe( -1 );
	} );

	test( 'getTotalMajor() -- Sanity', () => {
		expect( getTotalMajor( parseVersion( '1.2.3.beta' ) ) ).toBe( 12 );
	} );

	test( 'isSoftDeprecated() -- Sanity', () => {
		expect( isSoftDeprecated( '2.9.0' ) ).toBe( true );
		expect( isSoftDeprecated( '3.4.0' ) ).toBe( true );
		expect( isSoftDeprecated( '3.5.0' ) ).toBe( false );
	} );

	test( 'isHardDeprecated() -- Sanity', () => {
		expect( isHardDeprecated( '3.7.0' ) ).toBe( false );
		expect( isHardDeprecated( '3.8.0' ) ).toBe( true );
		expect( isHardDeprecated( '3.9.0' ) ).toBe( true );
	} );
} );
