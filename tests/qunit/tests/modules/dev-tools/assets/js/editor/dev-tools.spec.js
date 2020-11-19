QUnit.module( 'File: modules/dev-tools/assets/js/editor/dev-tools.js', () => {
	QUnit.test( 'notifyDeprecated()', ( assert ) => {
		const softDeprecatedOrig = elementorCommon.helpers.softDeprecated;

		// The soft notices object structure changed, instead of a nested array, it is now an object, for caching.
		elementor.config.dev_tools.deprecation.soft_notices = { test: [ 'version', 'replacement' ] };

		elementorCommon.helpers.softDeprecated = ( ... args ) => {
			assert.deepEqual( { test: [ 'version', 'replacement' ] }, elementor.config.dev_tools.deprecation.soft_notices );
		};

		elementor.devTools.notifyDeprecated();

		elementorCommon.helpers.softDeprecated = softDeprecatedOrig;
	} );
} );
