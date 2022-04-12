/* global elementorDevToolsConfig */

QUnit.module( 'File: modules/dev-tools/assets/js/editor/deprecation.js', ( hooks ) => {
	hooks.before( () => {
		elementorDevToolsConfig.deprecation.current_version = '3.0.0';
		elementorDevToolsConfig.deprecation.soft_version_count = 4;
		elementorDevToolsConfig.deprecation.hard_version_count = 8;
	} );

	QUnit.test( 'parseVersion()', ( assert ) => {
		assert.deepEqual( elementorDevToolsModule.deprecation.parseVersion( '1.2.3.beta' ), {
			build: 'beta',
			major1: 1,
			major2: 2,
			minor: 3,
		} );

		assert.deepEqual( elementorDevToolsModule.deprecation.parseVersion( '1.2.3' ), {
			build: '',
			major1: 1,
			major2: 2,
			minor: 3,
		} );
	} );

	QUnit.test( 'compareVersion()', ( assert ) => {
		assert.equal( elementorDevToolsModule.deprecation.compareVersion( '1.1.3.beta', '1.2.3.beta' ), -1 );
		assert.equal( elementorDevToolsModule.deprecation.compareVersion( '1.2.3.beta', '1.2.3.beta' ), 0 );
		assert.equal( elementorDevToolsModule.deprecation.compareVersion( '1.3.3.beta', '1.2.3.beta' ), 1 );
	} );

	QUnit.test( 'getTotalMajor()', ( assert ) => {
		// Act.
		const totalMajor = elementorDevToolsModule.deprecation.getTotalMajor( elementorDevToolsModule.deprecation.parseVersion( '1.2.3.beta' ) );

		// Assert.
		assert.equal( totalMajor, 12 );
	} );

	QUnit.test( 'isSoftDeprecated()', ( assert ) => {
		// Assert.
		assert.equal( elementorDevToolsModule.deprecation.isSoftDeprecated( '2.9.0' ), true );
		assert.equal( elementorDevToolsModule.deprecation.isSoftDeprecated( '3.4.0' ), true );
		assert.equal( elementorDevToolsModule.deprecation.isSoftDeprecated( '3.5.0' ), false );
	} );

	QUnit.test( 'isHardDeprecated()', ( assert ) => {
		// Assert.
		assert.equal( elementorDevToolsModule.deprecation.isHardDeprecated( '3.7.0' ), false );
		assert.equal( elementorDevToolsModule.deprecation.isHardDeprecated( '3.8.0' ), true );
		assert.equal( elementorDevToolsModule.deprecation.isHardDeprecated( '3.9.0' ), true );
	} );
} );

