/* global elementorDevToolsConfig */
/* global elementorDevToolsModule */

QUnit.module( 'File: modules/dev-tools/assets/js/editor/dev-tools.js', () => {
	QUnit.test( 'notifyBackendDeprecations()', ( assert ) => {
		const softDeprecatedOrig = elementorDevToolsModule.deprecation.softDeprecated;

		// The soft notices object structure changed, instead of a nested array, it is now an object, for caching.
		elementorDevToolsConfig.deprecation.soft_notices = { test: [ 'version', 'replacement' ] };

		elementorDevToolsModule.deprecation.softDeprecated = () => {
			assert.deepEqual( { test: [ 'version', 'replacement' ] }, elementorDevToolsConfig.deprecation.soft_notices );
		};

		elementorDevToolsModule.notifyBackendDeprecations();

		elementorDevToolsModule.deprecation.softDeprecated = softDeprecatedOrig;
	} );

	require( './deprecation.spec' );
} );
