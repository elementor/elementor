import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandContainerInternal from 'elementor-editor/command-bases/command-container-internal';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/base/command-container-base.js', () => {
		QUnit.module( 'CommandEditorBase', () => {
			QUnit.test( 'constructor(): without containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandContainerBase( { __manualConstructorHandling: true } );

						instance.requireContainer();
					},
					new Error( 'container or containers are required.' )
				);
			} );

			QUnit.test( 'constructor(): with container & containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandContainerBase( {
							__manualConstructorHandling: true,
							container: {},
							containers: [],
						} );

						instance.requireContainer();
					},
					new Error( 'container and containers cannot go together please select one of them.' )
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommandEditor = ( commandEditor ) => {
					// Base.
					assert.equal( commandEditor instanceof CommandInfra, true );
					assert.equal( commandEditor instanceof CommandBase, true );
					assert.equal( commandEditor instanceof CommandInternalBase, false, );
					assert.equal( commandEditor instanceof CommandData, false, );
					// Editor.
					assert.equal( commandEditor instanceof CommandContainerBase, true, );
					assert.equal( commandEditor instanceof CommandContainerInternal, false );

					// Base.
					assert.equal( commandEditor instanceof $e.modules.CommandBase, true );
					assert.equal( commandEditor instanceof $e.modules.CommandInternalBase, false );
					assert.equal( commandEditor instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( commandEditor instanceof $e.modules.editor.CommandContainerBase, true );
					assert.equal( commandEditor instanceof $e.modules.editor.CommandContainerInternal, false );
				};

				validateCommandEditor( new CommandContainerBase( { __manualConstructorHandling: true } ) );
				validateCommandEditor( new $e.modules.editor.CommandContainerBase( { __manualConstructorHandling: true } ) );
			} );
		} );
	} );
} );

