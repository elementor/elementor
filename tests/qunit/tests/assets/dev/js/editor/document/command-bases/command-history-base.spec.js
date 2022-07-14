import CommandHistoryBase from 'elementor-editor/document/command-bases/command-history-base';
import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandHistoryBaseMock, { CommandHistoryBaseExportedMock } from './mock/command-history-base.spec';

jQuery( () => {
	QUnit.module( 'File: editor/document/command-bases/command-history-base.js', () => {
		QUnit.module( 'CommandHistoryBase', () => {
			QUnit.test( 'getHistory(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandHistoryBaseMock( {} );

						instance.getHistory( {} );
					},
					new Error( 'CommandHistoryBaseMock.getHistory() should be implemented, please provide \'getHistory\' functionality.' ),
				);
			} );

			QUnit.test( 'onCatchApply()`', ( assert ) => {
				// Arrange.
				const fakeHistory = class extends CommandHistoryBaseMock {
						// eslint-disable-next-line no-unused-vars
						getHistory( args ) {
							return true;
						}
					},
					instance = new fakeHistory( {} );

				instance.historyId = Math.random();

				let tempCommand = '',
					tempArgs = '';

				const callback = ( component, command, args ) => {
					tempCommand = command;
					tempArgs = args;
				};

				$e.commandsInternal.on( 'run:before', callback );

				// Act.
				instance.onCatchApply( new $e.modules.HookBreak() );

				// Assert.
				assert.equal( tempCommand, 'document/history/delete-log' );
				assert.equal( tempArgs.id, instance.historyId );

				// Clean up.
				$e.commandsInternal.off( 'run:before', callback );
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateHistoryCommand = ( command ) => {
					// Base.
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					// Editor.
					assert.equal( command instanceof CommandContainerBase, true );
					// Editor-Document.
					assert.equal( command instanceof CommandHistoryBase, true );
					// Base.
					assert.equal( command instanceof $e.modules.CommandBase, true );
					// Editor.
					assert.equal( command instanceof $e.modules.editor.CommandContainerBase, true );
					// Editor-Document.
					assert.equal( command instanceof $e.modules.editor.document.CommandHistoryBase, true );
				};

				validateHistoryCommand( new CommandHistoryBaseMock( { bypassHistory: true } ) );
				validateHistoryCommand( new CommandHistoryBaseExportedMock( { bypassHistory: true } ) );
			} );
		} );
	} );
} );

