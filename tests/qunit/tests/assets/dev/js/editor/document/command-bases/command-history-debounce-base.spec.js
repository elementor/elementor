import CommandHistoryBase from 'elementor-document/command-bases/command-history-base';
import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandHistoryDebounceBase from 'elementor-document/command-bases/command-history-debounce-base';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandHistoryDebounceBaseMock, { CommandHistoryDebounceBaseExportedMock } from './mock/command-history-debounce-base.spec';

jQuery( () => {
	QUnit.module( 'File: editor/document/commands-bases/command-history-debounce-base.js', () => {
		QUnit.module( 'CommandHistoryDebounceBase', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateHistoryDebounceCommand = ( historyDebounceCommand ) => {
					// Base.
					assert.equal( historyDebounceCommand instanceof CommandInfra, true );
					assert.equal( historyDebounceCommand instanceof CommandBase, true );
					// Editor.
					assert.equal( historyDebounceCommand instanceof CommandContainerBase, true );
					// Editor-Document.
					assert.equal( historyDebounceCommand instanceof CommandHistoryBase, true );
					assert.equal( historyDebounceCommand instanceof CommandHistoryDebounceBase, true );
					// Base.
					assert.equal( historyDebounceCommand instanceof $e.modules.CommandBase, true );
					// Editor.
					assert.equal( historyDebounceCommand instanceof $e.modules.editor.CommandContainerBase, true );
					// Editor-Document.
					assert.equal( historyDebounceCommand instanceof $e.modules.editor.document.CommandHistoryBase, true );
					assert.equal( historyDebounceCommand instanceof $e.modules.editor.document.CommandHistoryDebounceBase, true );
				};

				validateHistoryDebounceCommand( new CommandHistoryDebounceBaseMock( { bypassHistory: true } ) );
				validateHistoryDebounceCommand( new CommandHistoryDebounceBaseExportedMock( { bypassHistory: true } ) );
			} );
		} );
	} );
} );
