import CommandBase from 'elementor-api/modules/command-base';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';
import CommandHistory from 'elementor-document/base/command-history';
import CommandHistoryDebounce from 'elementor-document/base/command-history-debounce';
import CommandEditor from 'elementor-editor/base/command-editor';
import CommandEditorInternal from 'elementor-editor/base/command-editor-internal';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/base/command-editor.js', () => {
		QUnit.module( 'Command', () => {
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
						const instance = new CommandBase( {} );

						instance.apply( {} );
					},
					new Error( 'CommandBase.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'instanceOf', ( assert ) => {
				const validateCommandEditor = ( commandEditor ) => {
					assert.equal( commandEditor instanceof CommandBase, true );
					assert.equal( commandEditor instanceof Command, true );
					assert.equal( commandEditor instanceof CommandInternal, false, );
					assert.equal( commandEditor instanceof CommandData, false, );
					assert.equal( commandEditor instanceof CommandHistory, false );
					assert.equal( commandEditor instanceof CommandHistoryDebounce, false );
					assert.equal( commandEditor instanceof CommandEditorInternal, false );

					assert.equal( commandEditor instanceof $e.modules.Command, true );
					assert.equal( commandEditor instanceof $e.modules.CommandInternal, false );
					assert.equal( commandEditor instanceof $e.modules.CommandData, false );
					assert.equal( commandEditor instanceof $e.modules.document.CommandHistory, false );
					assert.equal( commandEditor instanceof $e.modules.document.CommandHistoryDebounce, false );
				};

				validateCommandEditor( new CommandEditor( {} ) );
			} );
		} );
	} );
} );

