import CommandBase from 'elementor-api/modules/command-base';
import CommandHistoryHistory from 'elementor-document/commands/base/command-history';
import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';

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

			QUnit.test( 'instanceOf', ( assert ) => {
				const validateCommandBase = ( commandBase ) => {
						assert.equal( commandBase instanceof CommandBase, true );
						assert.equal( commandBase instanceof CommandInternalBase, false, );
						assert.equal( commandBase instanceof CommandHistoryHistory, false );
						assert.equal( commandBase instanceof CommandHistoryDebounce, false );
						assert.equal( commandBase instanceof $e.modules.CommandBase, true );
						assert.equal( commandBase instanceof $e.modules.CommandInternalBase, false );
						assert.equal( commandBase instanceof $e.modules.document.CommandHistory, false );
						assert.equal( commandBase instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateInternalCommand = ( internalCommand ) => {
						assert.equal( internalCommand instanceof CommandBase, true, );
						assert.equal( internalCommand instanceof CommandInternalBase, true );
						assert.equal( internalCommand instanceof CommandHistoryHistory, false );
						assert.equal( internalCommand instanceof CommandHistoryDebounce, false );
						assert.equal( internalCommand instanceof $e.modules.CommandBase, true );
						assert.equal( internalCommand instanceof $e.modules.CommandInternalBase, true );
						assert.equal( internalCommand instanceof $e.modules.document.CommandHistory, false );
						assert.equal( internalCommand instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateHistoryCommand = ( historyCommand ) => {
						assert.equal( historyCommand instanceof CommandBase, true );
						assert.equal( historyCommand instanceof CommandInternalBase, false );
						assert.equal( historyCommand instanceof CommandHistoryHistory, true );
						assert.equal( historyCommand instanceof CommandHistoryDebounce, false );
						assert.equal( historyCommand instanceof $e.modules.CommandBase, true );
						assert.equal( historyCommand instanceof $e.modules.CommandInternalBase, false );
						assert.equal( historyCommand instanceof $e.modules.document.CommandHistory, true );
						assert.equal( historyCommand instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateHistoryDebounceCommand = ( historyDebounceCommand ) => {
						assert.equal( historyDebounceCommand instanceof CommandBase, true );
						assert.equal( historyDebounceCommand instanceof CommandInternalBase, false );
						assert.equal( historyDebounceCommand instanceof CommandHistoryHistory, true );
						assert.equal( historyDebounceCommand instanceof CommandHistoryDebounce, true );
						assert.equal( historyDebounceCommand instanceof $e.modules.CommandBase, true );
						assert.equal( historyDebounceCommand instanceof $e.modules.CommandInternalBase, false );
						assert.equal( historyDebounceCommand instanceof $e.modules.document.CommandHistory, true );
						assert.equal( historyDebounceCommand instanceof $e.modules.document.CommandHistoryDebounce, true );
					},
					validateCommands = ( commandBase, internalCommand, historyCommand, historyDebounceCommand ) => {
						validateCommandBase( commandBase );
						validateInternalCommand( internalCommand );
						validateHistoryCommand( historyCommand );
						validateHistoryDebounceCommand( historyDebounceCommand );
					};

				let commandBase = new CommandBase( {} ),
					internalCommand = new CommandInternalBase( {} ),
					historyCommand = new class History extends CommandHistoryHistory {
						getHistory() {}
					}( {} ),
					historyDebounceCommand = new class HistoryDebounce extends CommandHistoryDebounce {
						getHistory() {}
					}( {} );

				validateCommands( commandBase, internalCommand, historyCommand, historyDebounceCommand );

				// eslint-disable-next-line no-unused-expressions
				commandBase = new $e.modules.CommandBase( {} ),
					internalCommand = new $e.modules.CommandInternalBase( {} ),
					historyCommand = new class History extends $e.modules.document.CommandHistory {
						getHistory() {}
					}( {} ),
					historyDebounceCommand = new class HistoryDebounce extends $e.modules.document.CommandHistoryDebounce {
						getHistory() {}
					}( {} );

				validateCommands( commandBase, internalCommand, historyCommand, historyDebounceCommand );
			} );
		} );
	} );
} );

