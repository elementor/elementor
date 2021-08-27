import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandContainerInternal from 'elementor-editor/command-bases/command-container-internal';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/base/command-container-internal.js', () => {
		QUnit.module( 'CommandEditorInternal', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommandEditorInternal = ( commandEditorInternal ) => {
					// Base.
					assert.equal( commandEditorInternal instanceof CommandInfra, true );
					assert.equal( commandEditorInternal instanceof CommandBase, true );
					assert.equal( commandEditorInternal instanceof CommandInternalBase, false, );
					assert.equal( commandEditorInternal instanceof CommandData, false, );
					// Editor.
					assert.equal( commandEditorInternal instanceof CommandContainerBase, true, );
					assert.equal( commandEditorInternal instanceof CommandContainerInternal, true );

					// Base.
					assert.equal( commandEditorInternal instanceof $e.modules.CommandBase, true );
					assert.equal( commandEditorInternal instanceof $e.modules.CommandInternalBase, false );
					assert.equal( commandEditorInternal instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( commandEditorInternal instanceof $e.modules.editor.CommandContainerBase, true );
					assert.equal( commandEditorInternal instanceof $e.modules.editor.CommandContainerInternal, true );
				};

				validateCommandEditorInternal( new CommandContainerInternal( { __manualConstructorHandling: true } ) );
				validateCommandEditorInternal( new $e.modules.editor.CommandContainerInternal( { __manualConstructorHandling: true } ) );
			} );
		} );
	} );
} );

