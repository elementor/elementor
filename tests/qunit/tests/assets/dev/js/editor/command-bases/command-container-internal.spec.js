import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandContainerInternal from 'elementor-editor/command-bases/command-container-internal';
import CommandContainerInternalMock, { CommandContainerInternalExportedMock } from './mock/command-container-internal.spec';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/command-bases/command-container-internal.js', () => {
		QUnit.module( 'CommandContainerInternal', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommand = ( command ) => {
					// Base.
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					assert.equal( command instanceof CommandInternalBase, false, );
					assert.equal( command instanceof CommandData, false, );
					// Editor.
					assert.equal( command instanceof CommandContainerBase, true, );
					assert.equal( command instanceof CommandContainerInternal, true );
					// Base.
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, false );
					assert.equal( command instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( command instanceof $e.modules.editor.CommandContainerBase, true );
					assert.equal( command instanceof $e.modules.editor.CommandContainerInternal, true );
				};

				validateCommand( new CommandContainerInternalMock( {} ) );
				validateCommand( new CommandContainerInternalExportedMock( {} ) );
			} );
		} );
	} );
} );

