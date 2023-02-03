import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';
import CommandContainerBaseMock, { CommandContainerBaseExportedMock } from './mock/command-container-base.spec';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/command-bases/command-container-base.js', () => {
		QUnit.module( 'CommandContainerBase', () => {
			QUnit.test( 'constructor(): without containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandContainerBaseMock( {} );

						instance.requireContainer();
					},
					new Error( 'container or containers are required.' ),
				);
			} );

			QUnit.test( 'constructor(): with container & containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandContainerBaseMock( {
							container: {},
							containers: [],
						} );

						instance.requireContainer();
					},
					new Error( 'container and containers cannot go together please select one of them.' ),
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommand = ( command ) => {
					// Base.
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					// Editor.
					assert.equal( command instanceof CommandContainerBase, true );
					// Base.
					assert.equal( command instanceof $e.modules.CommandBase, true );
					// Editor.
					assert.equal( command instanceof $e.modules.editor.CommandContainerBase, true );
				};

				validateCommand( new CommandContainerBaseMock( {} ) );
				validateCommand( new CommandContainerBaseExportedMock( {} ) );
			} );
		} );
	} );
} );

