/* global elementorDevToolsConfig */
/* global elemeelementorDevToolsModule */

QUnit.module( 'File: modules/dev-tools/assets/js/editor/dev-tools.js', () => {
	QUnit.test( 'notifyBackendDeprecations()', ( assert ) => {
		const softDeprecatedOrig = elementorCommon.helpers.softDeprecated;

		// The soft notices object structure changed, instead of a nested array, it is now an object, for caching.
		elementorDevToolsConfig.deprecation.soft_notices = { test: [ 'version', 'replacement' ] };

		elementorDevToolsModule.softDeprecated = () => {
			assert.deepEqual( { test: [ 'version', 'replacement' ] }, elementorDevToolsConfig.deprecation.soft_notices );
		};

		elemeelementorDevToolsModule.notifyBackendDeprecations();

		elementorCommon.helpers.softDeprecated = softDeprecatedOrig;
	} );

	require( './deprecation.spec' );
} );
