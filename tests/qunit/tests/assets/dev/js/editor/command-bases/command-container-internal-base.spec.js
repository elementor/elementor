import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandContainerInternalBase from 'elementor-editor/command-bases/command-container-internal-base';
import CommandContainerInternalMock, { CommandContainerInternalBaseExportedMock } from './mock/command-container-internal-base.spec';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/command-bases/command-container-internal-base.js', () => {
		QUnit.module( 'CommandContainerInternalBase', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommand = ( command ) => {
					// Base.
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					// Editor.
					assert.equal( command instanceof CommandContainerBase, true );
					assert.equal( command instanceof CommandContainerInternalBase, true );
					// Base.
					assert.equal( command instanceof $e.modules.CommandBase, true );
					// Editor.
					assert.equal( command instanceof $e.modules.editor.CommandContainerBase, true );
					assert.equal( command instanceof $e.modules.editor.CommandContainerInternalBase, true );
				};

				validateCommand( new CommandContainerInternalMock( {} ) );
				validateCommand( new CommandContainerInternalBaseExportedMock( {} ) );
			} );
		} );
	} );
} );

