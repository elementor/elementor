import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistory from 'elementor-document/commands/base/command-history';
import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';
import ComponentBase from 'elementor-api/modules/component-base';
import * as errors from 'elementor-api/modules/errors';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-data.js', () => {
		QUnit.module( 'CommandData', () => {
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
				command.currentCommand = commandFull;

				const requestData = command.getRequestData();

				// Validate data match.
				assert.equal( requestData.args, args );
				assert.equal( requestData.command, commandFull );
				assert.equal( requestData.endpoint, commandFull );
				assert.equal( requestData.component, component );
				assert.equal( isNaN( requestData.timestamp ), false );
				assert.equal( requestData.type, 'get' );
			} );

			// TODO: Same with all instanceOf validations, each file handle his own tests.
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommandData = ( command ) => {
					assert.equal( command instanceof CommandBase, true, );
					assert.equal( command instanceof CommandInternalBase, false );
					assert.equal( command instanceof CommandData, true, );
					assert.equal( command instanceof CommandHistory, false );
					assert.equal( command instanceof CommandHistoryDebounce, false );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, false );
					assert.equal( command instanceof $e.modules.CommandData, true );
					assert.equal( command instanceof $e.modules.document.CommandHistory, false );
					assert.equal( command instanceof $e.modules.document.CommandHistoryDebounce, false );
				};

				validateCommandData( new CommandData( {} ) );
				validateCommandData( new $e.modules.CommandData( {} ) );
			} );

			QUnit.test( 'onCatchApply(): make sure it transform the error to our semantic errors', ( assert ) => {
				const notFoundCalled = assert.async();
				const defaultCalled = assert.async();

				const commandData = new CommandData( {} );

				// Mock the notify functions.
				errors.NotFoundError.prototype.notify = () => {
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

