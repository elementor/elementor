QUnit.module( 'File: modules/dev-tools/assets/js/editor/deprecation.js', ( hooks ) => {
	hooks.before( () => {
		elementor.config.dev_tools.deprecation.current_version = '3.0.0';
		elementor.config.dev_tools.deprecation.soft_version_count = 4;
		elementor.config.dev_tools.deprecation.hard_version_count = 8;
	} );

	QUnit.test( 'parseVersion()', ( assert ) => {
		assert.deepEqual( elementor.devTools.deprecation.parseVersion( '1.2.3.beta' ), {
			build: 'beta',
			major1: 1,
			major2: 2,
			minor: 3,
		} );

		assert.deepEqual( elementor.devTools.deprecation.parseVersion( '1.2.3' ), {
			build: '',
			major1: 1,
			major2: 2,
			minor: 3,
		} );
	} );

	QUnit.test( 'compareVersion()', ( assert ) => {
		assert.equal( elementor.devTools.deprecation.compareVersion( '1.1.3.beta', '1.2.3.beta' ), -1 );
		assert.equal( elementor.devTools.deprecation.compareVersion( '1.2.3.beta', '1.2.3.beta' ), 0 );
		assert.equal( elementor.devTools.deprecation.compareVersion( '1.3.3.beta', '1.2.3.beta' ), 1 );
	} );

	QUnit.test( 'getTotalMajor()', ( assert ) => {
		// Act.
		const totalMajor = elementor.devTools.deprecation.getTotalMajor( elementor.devTools.deprecation.parseVersion( '1.2.3.beta' ) );

		// Assert.
		assert.equal( totalMajor, 12 );
	} );

	QUnit.test( 'isSoftDeprecated()', ( assert ) => {
		// Assert.
		assert.equal( elementor.devTools.deprecation.isSoftDeprecated( '2.9.0' ), true );
		assert.equal( elementor.devTools.deprecation.isSoftDeprecated( '3.4.0' ), true );
		assert.equal( elementor.devTools.deprecation.isSoftDeprecated( '3.5.0' ), false );
	} );

	QUnit.test( 'isHardDeprecated()', ( assert ) => {
		// Assert.
		assert.equal( elementor.devTools.deprecation.isHardDeprecated( '3.7.0' ), false );
		assert.equal( elementor.devTools.deprecation.isHardDeprecated( '3.8.0' ), true );
		assert.equal( elementor.devTools.deprecation.isHardDeprecated( '3.9.0' ), true );
	} );
} );

