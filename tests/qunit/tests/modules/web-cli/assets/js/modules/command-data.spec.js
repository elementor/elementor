import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandData from 'elementor-api/modules/command-data';
import ComponentBase from 'elementor-api/modules/component-base';
import CommandDataMock, { CommandDataExportedMock } from './mock/command-data.spec';
import * as errors from 'elementor-api/core/data/errors/';

jQuery( () => {
	QUnit.module( 'File: modules/web-cli/assets/js/modules/command-data.js', () => {
		QUnit.module( 'CommandData', () => {
			QUnit.test( 'getRequestData(): simple', ( assert ) => {
				// Register test data command.
				const component = $e.components.register( new class TestComponent extends ComponentBase {
						getNamespace() {
							return 'test-get-request-data-component';
						}

						defaultData() {
							return this.importCommands( {
								TestCommand: class TestCommand extends CommandDataMock {
								},
							} );
						}
					} ),
					args = {
						options: {
							type: 'get',
						},
					},
					command = new CommandDataMock( args ),
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
				const validateCommand = ( command ) => {
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					assert.equal( command instanceof CommandData, true );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandData, true );
				};

				validateCommand( new CommandDataMock( {} ) );
				validateCommand( new CommandDataExportedMock( {} ) );
			} );

			QUnit.test( 'onCatchApply(): make sure it transform the error to our semantic errors', ( assert ) => {
				const notFoundCalled = assert.async(),
					defaultCalled = assert.async(),
					commandData = new CommandDataMock( {} );

				// Mock the notify functions.
				errors.Error404.prototype.notify = () => {
					assert.ok( true, 'NotFoundError notify has been called.' );
					notFoundCalled();
				};

				errors.DefaultError.prototype.notify = () => {
					assert.ok( true, 'DefaultError notify has not been called.' );
					defaultCalled();
				};

				commandData.onCatchApply( { data: { status: 404 } } );
				commandData.onCatchApply( {} );
			} );
		} );
	} );
} );

