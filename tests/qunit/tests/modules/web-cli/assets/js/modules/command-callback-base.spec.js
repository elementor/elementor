import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandCallbackBase from 'elementor-api/modules/command-callback-base';
import CommandCallbackBaseMock from './mock/command-callback-base.spec';

jQuery( () => {
	QUnit.module( 'File: modules/web-cli/assets/js/modules/command-callback-base.js', () => {
		QUnit.module( 'CommandCallback', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const command = new CommandCallbackBaseMock( {} );

				assert.equal( command instanceof CommandInfra, true );
				assert.equal( command instanceof CommandBase, true );
				assert.equal( command instanceof CommandCallbackBase, true );
				assert.equal( command instanceof $e.modules.CommandBase, true );
			} );

			// TODO: Add more tests. register a component with callback and validate it instance.
		} );
	} );
} );
