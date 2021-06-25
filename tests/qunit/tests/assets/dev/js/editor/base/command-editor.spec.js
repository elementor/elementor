import CommandInfra from 'elementor-api/modules/command-infra';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';
import CommandEditor from 'elementor-editor/base/command-editor';
import CommandEditorInternal from 'elementor-editor/base/command-editor-internal';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/base/command-editor.js', () => {
		QUnit.module( 'CommandEditor', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );

			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'constructor(): without containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandEditor( { } );

						instance.requireContainer();
					},
					new Error( 'container or containers are required.' )
				);
			} );

			QUnit.test( 'constructor(): with container & containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandEditor( {
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
						const instance = new CommandInfra( {} );

						instance.apply( {} );
					},
					new Error( 'CommandInfra.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommandEditor = ( commandEditor ) => {
					// Base.
					assert.equal( commandEditor instanceof CommandInfra, true );
					assert.equal( commandEditor instanceof Command, true );
					assert.equal( commandEditor instanceof CommandInternal, false, );
					assert.equal( commandEditor instanceof CommandData, false, );
					// Editor.
					assert.equal( commandEditor instanceof CommandEditor, true, );
					assert.equal( commandEditor instanceof CommandEditorInternal, false );

					// Base.
					assert.equal( commandEditor instanceof $e.modules.Command, true );
					assert.equal( commandEditor instanceof $e.modules.CommandInternal, false );
					assert.equal( commandEditor instanceof $e.modules.CommandData, false );
					// Editor.
					assert.equal( commandEditor instanceof $e.modules.editor.CommandEditor, true );
					assert.equal( commandEditor instanceof $e.modules.editor.CommandEditorInternal, false );
				};

				validateCommandEditor( new CommandEditor( {} ) );
				validateCommandEditor( new $e.modules.editor.CommandEditor( {} ) );
			} );
		} );
	} );
} );

