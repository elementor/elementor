import API from 'elementor-api';

jQuery( () => {
	QUnit.module( 'File: core/kits/assets/js/manager.js', ( hooks ) => {
		const eOrig = $e,
			elementorConfigUserOrig = elementor.config.user;

		hooks.beforeEach( () => {
			window.$e = new API();
		} );

		hooks.afterEach( () => {
			window.$e = eOrig;

			elementor.config.user = elementorConfigUserOrig;
		} );

		QUnit.test( 'Initialize() - Validate component available - User can edit kit', ( assert ) => {
			// Arrange.
			elementor.config.user.can_edit_kit = true;

			// Act.
			elementor.kitManager.initialize();

			// Assert.
			assert.true( !! $e.components.get( 'panel/global' ) );
		} );

		QUnit.test( 'Initialize() - Validate component not available - User cannot edit kit', ( assert ) => {
			// Arrange.
			elementor.config.user.can_edit_kit = false;

			// Act.
			elementor.kitManager.initialize();

			// Assert.
			assert.false( !! $e.components.get( 'panel/global' ) );
		} );
	} );
} );
