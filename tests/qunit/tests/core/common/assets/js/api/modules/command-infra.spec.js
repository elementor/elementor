import CommandInfra from 'elementor-api/modules/command-infra';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-infra.js', () => {
		QUnit.module( 'CommandInfra', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );
			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'constructor(): Doing it wrong', ( assert ) => {
				// Trying to create-command while $e.components.isRegistering = false;
				$e.components.isRegistering = false;

				assert.throws(
					() => new CommandInfra( {} ),
					new RangeError( 'Doing it wrong: $e.components.isRegistering is false while $e.commands.constructor.trace.length is empty' )
				);
			} );

			QUnit.test( 'apply(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandInfra( {} );

						instance.apply( {} );
					},
					new Error( 'CommandInfra.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const commandInfra = new CommandInfra( {} );

				assert.equal( commandInfra instanceof CommandInfra, true );
				assert.equal( commandInfra instanceof Command, false );
				assert.equal( commandInfra instanceof CommandInternal, false, );
				assert.equal( commandInfra instanceof CommandData, false, );
				assert.equal( commandInfra instanceof $e.modules.Command, false );
				assert.equal( commandInfra instanceof $e.modules.CommandInternal, false );
				assert.equal( commandInfra instanceof $e.modules.CommandData, false );
			} );
		} );
	} );
} );

