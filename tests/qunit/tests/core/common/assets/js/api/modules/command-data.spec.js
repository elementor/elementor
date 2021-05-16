import CommandBase from 'elementor-api/modules/command-base';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';
import ComponentBase from 'elementor-api/modules/component-base';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-data.js', () => {
		QUnit.module( 'CommandData', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );

			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'getRequestData(): simple', ( assert ) => {
				// Register test data command.
				const component = $e.components.register( new class TestComponent extends ComponentBase {
						getNamespace() {
							return 'test-get-request-data-component';
						}

						defaultData() {
							return this.importCommands( {
								TestCommand: class TestCommand extends CommandData {
								},
							} );
						}
					} ),
					args = {
						options: {
							type: 'get',
						},
					},
					command = new CommandData( args ),
					commandFull = component.getNamespace() + '/test-command';

				command.component = component;
				command.command = commandFull;

				const requestData = command.getRequestData();

				// Validate data match.
				assert.equal( requestData.args, args );
				assert.equal( requestData.command, commandFull );
				assert.equal( requestData.endpoint, commandFull );
				assert.equal( requestData.component, component );
				assert.equal( isNaN( requestData.timestamp ), false );
				assert.equal( requestData.type, 'get' );
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommandData = ( command ) => {
					assert.equal( command instanceof CommandBase, true, );
					assert.equal( command instanceof Command, true, );
					assert.equal( command instanceof CommandInternal, false );
					assert.equal( command instanceof CommandData, true, );
					assert.equal( command instanceof $e.modules.Command, true );
					assert.equal( command instanceof $e.modules.CommandInternal, false );
					assert.equal( command instanceof $e.modules.CommandData, true );
				};

				validateCommandData( new CommandData( {} ) );
				validateCommandData( new $e.modules.CommandData( {} ) );
			} );
		} );
	} );
} );

