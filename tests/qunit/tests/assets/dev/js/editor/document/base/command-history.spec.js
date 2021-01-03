import CommandHistory from 'elementor-document/base/command-history';
import CommandBase from 'elementor-api/modules/command-base';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistoryDebounce from 'elementor-document/base/command-history-debounce';
import CommandEditor from 'elementor-editor/base/command-editor';
import CommandEditorInternal from 'elementor-editor/base/command-editor-internal';

jQuery( () => {
	QUnit.module( 'File: editor/document/commands/base/command-history.js', () => {
		QUnit.module( 'CommandHistory', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );

			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'getHistory(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandHistory( {} );

						instance.getHistory( {} );
					},
					new Error( 'CommandHistory.getHistory() should be implemented, please provide \'getHistory\' functionality.' )
				);
			} );

			QUnit.test( 'onCatchApply()`', ( assert ) => {
				const fakeHistory = class extends CommandHistory {
						// eslint-disable-next-line no-unused-vars
						getHistory( args ) {
							return true;
						}
					},
					instance = new fakeHistory( {} );

				$e.components.isRegistering = false;

				instance.historyId = Math.random();

				let tempCommand = '',
					tempArgs = '';

				$e.commandsInternal.on( 'run:before', ( component, command, args ) => {
					tempCommand = command;
					tempArgs = args;
				} );

				// Use `instance.historyId` for error.
				try {
					instance.onCatchApply( new $e.modules.HookBreak( instance.id ) );
				} catch ( e ) {
					assert.equal( e, instance.historyId );
				}

				assert.equal( tempCommand, 'document/history/delete-log' );
				assert.equal( tempArgs.id, instance.historyId );
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateHistoryCommand = ( historyCommand ) => {
					// Base.
					assert.equal( historyCommand instanceof CommandBase, true );
					assert.equal( historyCommand instanceof Command, true );
					assert.equal( historyCommand instanceof CommandInternal, false, );
					assert.equal( historyCommand instanceof CommandData, false, );
					// Editor.
					assert.equal( historyCommand instanceof CommandEditor, true, );
					assert.equal( historyCommand instanceof CommandEditorInternal, false );
					// Editor-Document.
					assert.equal( historyCommand instanceof CommandHistory, true );
					assert.equal( historyCommand instanceof CommandHistoryDebounce, false );

					// Base.
					assert.equal( historyCommand instanceof $e.modules.Command, true );
					assert.equal( historyCommand instanceof $e.modules.CommandInternal, false );
					assert.equal( historyCommand instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( historyCommand instanceof $e.modules.editor.CommandEditor, true );
					assert.equal( historyCommand instanceof $e.modules.editor.CommandEditorInternal, false );
					// Editor-Document.
					assert.equal( historyCommand instanceof $e.modules.editor.document.CommandHistory, true );
					assert.equal( historyCommand instanceof $e.modules.editor.document.CommandHistoryDebounce, false );
				};

				validateHistoryCommand( new CommandHistory( {} ) );
				validateHistoryCommand( new $e.modules.editor.document.CommandHistory( {} ) );
			} );
		} );
	} );
} );

