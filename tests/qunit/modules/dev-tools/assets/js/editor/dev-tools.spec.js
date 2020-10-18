QUnit.module( 'File: modules/dev-tools/assets/js/editor/dev-tools.js', () => {
	QUnit.test( 'notifyDeprecated()', ( assert ) => {
		const softDeprecatedOrig = elementorCommon.helpers.softDeprecated;

		elementor.config.dev_tools = {
			deprecation: { soft_notices: [ [ 'name', 'version', 'replacement' ] ] },
		};

		elementorCommon.helpers.softDeprecated = ( ... args ) => {
			assert.deepEqual( [ args ], elementor.config.dev_tools.deprecation.soft_notices );
		};

		elementor.devTools.notifyDeprecated();

		elementorCommon.helpers.softDeprecated = softDeprecatedOrig;
	} );
} );
