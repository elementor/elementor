import CommandBase from 'elementor-api/modules/command-base';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';
import CommandCallback from 'elementor-api/modules/command-callback';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-callback.js', () => {
		QUnit.module( 'CommandCallback', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );

			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const commandCallback = new CommandCallback( {} );

				assert.equal( commandCallback instanceof CommandBase, true );
				assert.equal( commandCallback instanceof Command, true );
				assert.equal( commandCallback instanceof CommandInternal, false, );
				assert.equal( commandCallback instanceof CommandData, false, );
				assert.equal( commandCallback instanceof CommandCallback, true, );
				assert.equal( commandCallback instanceof $e.modules.Command, true );
				assert.equal( commandCallback instanceof $e.modules.CommandInternal, false );
				assert.equal( commandCallback instanceof $e.modules.CommandData, false );
			} );

			// TODO: Add more tests.
		} );
	} );
} );

