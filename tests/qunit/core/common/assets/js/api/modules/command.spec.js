import Command from 'elementor-api/modules/command';
import CommandHistoryHistory from 'elementor-document/commands/base/command-history';
import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command.js', () => {
		QUnit.module( 'Command', () => {
			QUnit.test( 'constructor(): without containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new Command( { } );

						instance.requireContainer();
					},
					new Error( 'container or containers are required.' )
				);
			} );

			QUnit.test( 'constructor(): with container & containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new Command( {
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
						const instance = new Command( {} );

						instance.apply( {} );
					},
					new Error( 'Command.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'run(): on catch apply', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new Command( {} );

						instance.apply = () => {
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
						const instance = new Command( {} );

						instance.apply = () => {
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
				const internalCommand = new CommandInternalBase( {} ),
					historyCommand = new class Command extends CommandHistoryHistory {
						getHistory() {}
					}( {} ),
					historyDebounceCommand = new class Command extends CommandHistoryDebounce {
						getHistory() {}
					}( {} );

				assert.equal( internalCommand instanceof Command, true );
				assert.equal( internalCommand instanceof CommandInternalBase, true );
				assert.equal( internalCommand instanceof CommandHistoryHistory, false );
				assert.equal( internalCommand instanceof CommandHistoryDebounce, false );

				assert.equal( historyCommand instanceof Command, true );
				assert.equal( historyCommand instanceof CommandInternalBase, false );
				assert.equal( historyCommand instanceof CommandHistoryHistory, true );
				assert.equal( historyCommand instanceof CommandHistoryDebounce, false );

				assert.equal( historyDebounceCommand instanceof Command, true );
				assert.equal( historyDebounceCommand instanceof CommandInternalBase, false );
				assert.equal( historyDebounceCommand instanceof CommandHistoryHistory, true );
				assert.equal( historyDebounceCommand instanceof CommandHistoryDebounce, true );
			} );
		} );
	} );
} );

