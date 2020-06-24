import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistory from 'elementor-document/commands/base/command-history';
import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-base.js', () => {
		QUnit.module( 'CommandBase', () => {
			QUnit.test( 'constructor(): without containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandBase( { } );

						instance.requireContainer();
					},
					new Error( 'container or containers are required.' )
				);
			} );

			QUnit.test( 'constructor(): with container & containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandBase( {
							container: {},
							containers: [],
						} );

						instance.requireContainer();
					},
					new Error( 'container and containers cannot go together please select one of them.' )
				);
			} );

			QUnit.test( 'apply(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandBase( {} );

						instance.apply( {} );
					},
					new Error( 'CommandBase.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'run(): on catch apply', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new CommandBase( {} );

						instance.onBeforeApply = () => {
							throw new Error( random );
						};

						instance.onCatchApply = ( e ) => {
							throw e;
						};

						instance.run( {} );
					},
					new Error( random )
				);
			} );

			QUnit.test( 'onCatchApply()', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new CommandBase( {} );

						instance.onBeforeApply = () => {
							throw new Error( random );
						};

						const origDevTools = $e.devTools;

						// Use `$e.devTools` as a hack.
						$e.devTools = {
							log: { error: ( e ) => {
									$e.devTools = origDevTools;
									throw e;
								} },
						};

						instance.run( {} );
					},
					new Error( random )
				);

				$e.devTools = undefined;
			} );

			QUnit.test( 'instanceOf(): validate: CommandBase', ( assert ) => {
				const validateCommandBase = ( command ) => {
					assert.equal( command instanceof CommandBase, true );
					assert.equal( command instanceof CommandInternalBase, false, );
					assert.equal( command instanceof CommandData, false, );
					assert.equal( command instanceof CommandHistory, false );
					assert.equal( command instanceof CommandHistoryDebounce, false );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, false );
					assert.equal( command instanceof $e.modules.CommandData, false );
					assert.equal( command instanceof $e.modules.document.CommandHistory, false );
					assert.equal( command instanceof $e.modules.document.CommandHistoryDebounce, false );
				};

				validateCommandBase( new CommandBase( {} ) );
				validateCommandBase( new $e.modules.CommandBase( {} ) );
			} );

			QUnit.test( 'instanceOf(): validate: CommandInternalBase', ( assert ) => {
				const validateInternalCommand = ( command ) => {
					assert.equal( command instanceof CommandBase, true, );
					assert.equal( command instanceof CommandInternalBase, true );
					assert.equal( command instanceof CommandData, false, );
					assert.equal( command instanceof CommandHistory, false );
					assert.equal( command instanceof CommandHistoryDebounce, false );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, true );
					assert.equal( command instanceof $e.modules.CommandData, false );
					assert.equal( command instanceof $e.modules.document.CommandHistory, false );
					assert.equal( command instanceof $e.modules.document.CommandHistoryDebounce, false );
				};

				validateInternalCommand( new CommandInternalBase( {} ) );
				validateInternalCommand( new $e.modules.CommandInternalBase( {} ) );
			} );

			QUnit.test( 'instanceOf(): validate: CommandHistory', ( assert ) => {
				const validateHistoryCommand = ( command ) => {
					assert.equal( command instanceof CommandBase, true, );
					assert.equal( command instanceof CommandInternalBase, false );
					assert.equal( command instanceof CommandData, false, );
					assert.equal( command instanceof CommandHistory, true );
					assert.equal( command instanceof CommandHistoryDebounce, false );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, false );
					assert.equal( command instanceof $e.modules.CommandData, false );
					assert.equal( command instanceof $e.modules.document.CommandHistory, true );
					assert.equal( command instanceof $e.modules.document.CommandHistoryDebounce, false );
				};

				const historyCommand = new class History extends CommandHistory {
					getHistory() {}
				}( {} ),
					historyCommandExternal = new class History extends $e.modules.document.CommandHistory {
					getHistory() {}
				}( {} );

				validateHistoryCommand( historyCommand );
				validateHistoryCommand( historyCommandExternal );
			} );

			QUnit.test( 'instanceOf(): validate: CommandHistoryDebounce', ( assert ) => {
				const validateHistoryDebounceCommand = ( command ) => {
					assert.equal( command instanceof CommandBase, true, );
					assert.equal( command instanceof CommandInternalBase, false );
					assert.equal( command instanceof CommandData, false, );
					assert.equal( command instanceof CommandHistory, true );
					assert.equal( command instanceof CommandHistoryDebounce, true );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, false );
					assert.equal( command instanceof $e.modules.CommandData, false );
					assert.equal( command instanceof $e.modules.document.CommandHistory, true );
					assert.equal( command instanceof $e.modules.document.CommandHistoryDebounce, true );
				};

				const historyCommandDebounce = new class HistoryDebounce extends CommandHistoryDebounce {
					getHistory() {}
				}( {} ),
					historyCommandDebounceExternal = new class HistoryDebounce extends $e.modules.document.CommandHistoryDebounce {
					getHistory() {}
				}( {} );

				validateHistoryDebounceCommand( historyCommandDebounce );
				validateHistoryDebounceCommand( historyCommandDebounceExternal );
			} );
		} );
	} );
} );

