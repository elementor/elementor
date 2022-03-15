import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandCallback from 'elementor-api/modules/command-callback';
import CommandCallbackMock from './mock/command-callback.spec';

jQuery( () => {
	QUnit.module( 'File: modules/web-cli/assets/js/modules/command-callback.js', () => {
		QUnit.module( 'CommandCallback', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const command = new CommandCallbackMock( {} );

				assert.equal( command instanceof CommandInfra, true );
				assert.equal( command instanceof CommandBase, true );
				assert.equal( command instanceof CommandCallback, true, );
				assert.equal( command instanceof $e.modules.CommandBase, true );
			} );

			// TODO: Add more tests. register a component with callback and validate it instance.
		} );
	} );
} );
