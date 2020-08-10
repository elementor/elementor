import CommandBase from 'elementor-api/modules/command-base';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-base.js', () => {
		QUnit.module( 'CommandBase', () => {
			QUnit.test( 'apply(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandBase( {} );

						instance.apply( {} );
					},
					new Error( 'CommandBase.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const commandBase = new CommandBase( {} );

				assert.equal( commandBase instanceof CommandBase, true );
				assert.equal( commandBase instanceof Command, false );
				assert.equal( commandBase instanceof CommandInternal, false, );
				assert.equal( commandBase instanceof CommandData, false, );
				assert.equal( commandBase instanceof $e.modules.Command, false );
				assert.equal( commandBase instanceof $e.modules.CommandInternal, false );
				assert.equal( commandBase instanceof $e.modules.CommandData, false );
			} );
		} );
	} );
} );

