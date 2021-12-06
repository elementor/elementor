import CommandHistoryBase from 'elementor-editor/document/command-bases/command-history-base';
import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistoryDebounceBase from 'elementor-document/command-bases/command-history-debounce-base';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandContainerInternal from 'elementor-editor/command-bases/command-container-internal';

jQuery( () => {
	QUnit.module( 'File: editor/document/base/command-history.js', () => {
		QUnit.module( 'CommandHistoryBase', () => {
			QUnit.test( 'getHistory(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandHistoryBase( { __manualConstructorHandling: true } );

						instance.getHistory( {} );
					},
					new Error( 'CommandHistoryBase.getHistory() should be implemented, please provide \'getHistory\' functionality.' )
				);
			} );

			QUnit.test( 'onCatchApply()`', ( assert ) => {
				const fakeHistory = class extends CommandHistoryBase {
						// eslint-disable-next-line no-unused-vars
						getHistory( args ) {
							return true;
						}
					},
					instance = new fakeHistory( { __manualConstructorHandling: true } );

				instance.historyId = Math.random();

				let tempCommand = '',
					tempArgs = '';

				const callback = ( component, command, args ) => {
					tempCommand = command;
					tempArgs = args;
				};

				$e.commandsInternal.on( 'run:before', callback );

				instance.onCatchApply( new $e.modules.HookBreak() );

				assert.equal( tempCommand, 'document/history/delete-log' );
				assert.equal( tempArgs.id, instance.historyId );

				$e.commandsInternal.off( 'run:before', callback );
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateHistoryCommand = ( historyCommand ) => {
					// Base.
					assert.equal( historyCommand instanceof CommandInfra, true );
					assert.equal( historyCommand instanceof CommandBase, true );
					assert.equal( historyCommand instanceof CommandInternalBase, false, );
					assert.equal( historyCommand instanceof CommandData, false, );
					// Editor.
					assert.equal( historyCommand instanceof CommandContainerBase, true, );
					assert.equal( historyCommand instanceof CommandContainerInternal, false );
					// Editor-Document.
					assert.equal( historyCommand instanceof CommandHistoryBase, true );
					assert.equal( historyCommand instanceof CommandHistoryDebounceBase, false );

					// Base.
					assert.equal( historyCommand instanceof $e.modules.CommandBase, true );
					assert.equal( historyCommand instanceof $e.modules.CommandInternalBase, false );
					assert.equal( historyCommand instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( historyCommand instanceof $e.modules.editor.CommandContainerBase, true );
					assert.equal( historyCommand instanceof $e.modules.editor.CommandContainerInternal, false );
					// Editor-Document.
					assert.equal( historyCommand instanceof $e.modules.editor.document.CommandHistoryBase, true );
					assert.equal( historyCommand instanceof $e.modules.editor.document.CommandHistoryDebounceBase, false );
				};

				validateHistoryCommand( new CommandHistoryBase( { __manualConstructorHandling: true } ) );
				validateHistoryCommand( new $e.modules.editor.document.CommandHistoryBase( { __manualConstructorHandling: true } ) );
			} );
		} );
	} );
} );

