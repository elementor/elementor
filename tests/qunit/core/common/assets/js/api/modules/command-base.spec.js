import CommandBase from 'elementor-api/modules/command-base-original'; // TODO: Change to command-base.
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistory from 'elementor-document/commands/base/command-history';
import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-base.js', () => {
		QUnit.module( 'Command', () => {
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
					// TODO: Remove - Should be 'CommandBase' instead of 'CommandBaseOriginal'.
					new Error( 'CommandBaseOriginal.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'instanceOf', ( assert ) => {
				const validateCommandBase = ( commandBase ) => {
						assert.equal( commandBase instanceof CommandBase, true );
						assert.equal( commandBase instanceof Command, false );
						assert.equal( commandBase instanceof CommandInternal, false, );
						assert.equal( commandBase instanceof CommandData, false, );
						assert.equal( commandBase instanceof CommandHistory, false );
						assert.equal( commandBase instanceof CommandHistoryDebounce, false );
						assert.equal( commandBase instanceof $e.modules.Command, false );
						assert.equal( commandBase instanceof $e.modules.CommandInternalBase, false );
						assert.equal( commandBase instanceof $e.modules.CommandData, false );
						assert.equal( commandBase instanceof $e.modules.document.CommandHistory, false );
						assert.equal( commandBase instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateCommand = ( command ) => {
						assert.equal( command instanceof CommandBase, true );
						assert.equal( command instanceof Command, true );
						assert.equal( command instanceof CommandInternal, false, );
						assert.equal( command instanceof CommandData, false, );
						assert.equal( command instanceof CommandHistory, false );
						assert.equal( command instanceof CommandHistoryDebounce, false );
						assert.equal( command instanceof $e.modules.Command, true );
						assert.equal( command instanceof $e.modules.CommandInternalBase, false );
						assert.equal( command instanceof $e.modules.CommandData, false );
						assert.equal( command instanceof $e.modules.document.CommandHistory, false );
						assert.equal( command instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateInternalCommand = ( internalCommand ) => {
						assert.equal( internalCommand instanceof CommandBase, true, );
						assert.equal( internalCommand instanceof Command, true, );
						assert.equal( internalCommand instanceof CommandInternal, true );
						assert.equal( internalCommand instanceof CommandData, false );
						assert.equal( internalCommand instanceof CommandHistory, false );
						assert.equal( internalCommand instanceof CommandHistoryDebounce, false );
						assert.equal( internalCommand instanceof $e.modules.Command, true );
						assert.equal( internalCommand instanceof $e.modules.CommandInternalBase, true );
						assert.equal( internalCommand instanceof $e.modules.CommandData, false );
						assert.equal( internalCommand instanceof $e.modules.document.CommandHistory, false );
						assert.equal( internalCommand instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateHistoryCommand = ( historyCommand ) => {
						assert.equal( historyCommand instanceof CommandBase, true );
						assert.equal( historyCommand instanceof Command, true );
						assert.equal( historyCommand instanceof CommandInternal, false );
						assert.equal( historyCommand instanceof CommandData, false );
						assert.equal( historyCommand instanceof CommandHistory, true );
						assert.equal( historyCommand instanceof CommandHistoryDebounce, false );
						assert.equal( historyCommand instanceof $e.modules.Command, true );
						assert.equal( historyCommand instanceof $e.modules.CommandInternalBase, false );
						assert.equal( historyCommand instanceof $e.modules.CommandData, false );
						assert.equal( historyCommand instanceof $e.modules.document.CommandHistory, true );
						assert.equal( historyCommand instanceof $e.modules.document.CommandHistoryDebounce, false );
					},
					validateHistoryDebounceCommand = ( historyDebounceCommand ) => {
						assert.equal( historyDebounceCommand instanceof CommandBase, true );
						assert.equal( historyDebounceCommand instanceof Command, true );
						assert.equal( historyDebounceCommand instanceof CommandInternal, false );
						assert.equal( historyDebounceCommand instanceof CommandData, false );
						assert.equal( historyDebounceCommand instanceof CommandHistory, true );
						assert.equal( historyDebounceCommand instanceof CommandHistoryDebounce, true );
						assert.equal( historyDebounceCommand instanceof $e.modules.Command, true );
						assert.equal( historyDebounceCommand instanceof $e.modules.CommandInternalBase, false );
						assert.equal( historyDebounceCommand instanceof $e.modules.CommandData, false );
						assert.equal( historyDebounceCommand instanceof $e.modules.document.CommandHistory, true );
						assert.equal( historyDebounceCommand instanceof $e.modules.document.CommandHistoryDebounce, true );
					};

				validateCommandBase( new CommandBase( {} ) );

				validateCommand( new Command( {} ) );
				validateCommand( new $e.modules.Command( {} ) );

				validateInternalCommand( new CommandInternal( {} ) );
				validateInternalCommand( new $e.modules.CommandInternalBase( {} ) );

				validateHistoryCommand( new CommandHistory( {} ) );
				validateHistoryCommand( new $e.modules.document.CommandHistory( {} ) );

				validateHistoryDebounceCommand( new CommandHistoryDebounce( {} ) );
				validateHistoryDebounceCommand( new $e.modules.document.CommandHistoryDebounce( {} ) );
			} );
		} );
	} );
} );

