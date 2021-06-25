import CommandHistory from 'elementor-document/base/command-history';
import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistoryDebounce from 'elementor-document/base/command-history-debounce';
import CommandEditorBase from 'elementor-editor/base/command-editor-base';
import CommandEditorInternal from 'elementor-editor/base/command-editor-internal';

jQuery( () => {
	QUnit.module( 'File: editor/document/base/command-history.js', () => {
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

				instance.historyId = Math.random();

				let tempCommand = '',
					tempArgs = '';

				$e.commandsInternal.on( 'run:before', ( component, command, args ) => {
					tempCommand = command;
					tempArgs = args;
				} );

				instance.onCatchApply( new $e.modules.HookBreak() );

				assert.equal( tempCommand, 'document/history/delete-log' );
				assert.equal( tempArgs.id, instance.historyId );
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateHistoryCommand = ( historyCommand ) => {
					// Base.
					assert.equal( historyCommand instanceof CommandInfra, true );
					assert.equal( historyCommand instanceof CommandBase, true );
					assert.equal( historyCommand instanceof CommandInternalBase, false, );
					assert.equal( historyCommand instanceof CommandData, false, );
					// Editor.
					assert.equal( historyCommand instanceof CommandEditorBase, true, );
					assert.equal( historyCommand instanceof CommandEditorInternal, false );
					// Editor-Document.
					assert.equal( historyCommand instanceof CommandHistory, true );
					assert.equal( historyCommand instanceof CommandHistoryDebounce, false );

					// Base.
					assert.equal( historyCommand instanceof $e.modules.CommandBase, true );
					assert.equal( historyCommand instanceof $e.modules.CommandInternalBase, false );
					assert.equal( historyCommand instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( historyCommand instanceof $e.modules.editor.CommandEditorBase, true );
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

