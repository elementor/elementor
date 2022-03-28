QUnit.module( 'File: modules/dev-tools/assets/js/editor/dev-tools.js', ( hooks ) => {
	hooks.before( () => {
		elementor.config.dev_tools.deprecation.current_version = '3.0.0';
		elementor.config.dev_tools.deprecation.soft_version_count = 4;
		elementor.config.dev_tools.deprecation.hard_version_count = 8;
	} );

	QUnit.test( 'notifyBackendDeprecations()', ( assert ) => {
		const softDeprecatedOrig = elementorCommon.helpers.softDeprecated;

		// The soft notices object structure changed, instead of a nested array, it is now an object, for caching.
		elementor.config.dev_tools.deprecation.soft_notices = { test: [ 'version', 'replacement' ] };

		elementorCommon.helpers.softDeprecated = () => {
			assert.deepEqual( { test: [ 'version', 'replacement' ] }, elementor.config.dev_tools.deprecation.soft_notices );
		};

		elementor.devTools.notifyBackendDeprecations();

		elementorCommon.helpers.softDeprecated = softDeprecatedOrig;
	} );

	QUnit.test( 'parseVersion()', ( assert ) => {
		// Act.
		const version = elementor.devTools.parseVersion( '1.2.3.beta' );

		// Assert.
		assert.deepEqual( version, {
			build: 'beta',
			major1: 1,
			major2: 2,
			minor: 3,
		} );
	} );

	QUnit.test( 'compareVersion()', ( assert ) => {
		// Act.
		const result = elementor.devTools.compareVersion( '1.2.3.beta', '1.2.3.beta' );

		// Assert.
		assert.equal( result, 0 );
	} );

	QUnit.test( 'getTotalMajor()', ( assert ) => {
		// Act.
		const totalMajor = elementor.devTools.getTotalMajor( elementor.devTools.parseVersion( '1.2.3.beta' ) );

		// Assert.
		assert.equal( totalMajor, 12 );
	} );

	QUnit.test( 'isSoftDeprecated()', ( assert ) => {
		// Assert.
		assert.equal( elementor.devTools.isSoftDeprecated( '2.9.0' ), true );
		assert.equal( elementor.devTools.isSoftDeprecated( '3.4.0' ), true );
		assert.equal( elementor.devTools.isSoftDeprecated( '3.5.0' ), false );
	} );

	QUnit.test( 'isHardDeprecated()', ( assert ) => {
		// Assert.
		assert.equal( elementor.devTools.isHardDeprecated( '3.7.0' ), false );
		assert.equal( elementor.devTools.isHardDeprecated( '3.8.0' ), true );
		assert.equal( elementor.devTools.isHardDeprecated( '3.9.0' ), true );
	} );
} );
