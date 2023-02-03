import CommandBase from 'elementor-api/modules/command-base';
import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBaseMock, { CommandBaseExportedMock } from './mock/command-base.spec';

jQuery( () => {
	QUnit.module( 'File: modules/web-cli/assets/js/modules/command-base.js', () => {
		QUnit.module( 'CommandBase', () => {
			QUnit.test( 'run(): on catch apply', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new CommandBaseMock( {} );

						instance.apply = () => {
							throw new Error( random );
						};

						instance.onCatchApply = ( e ) => {
							throw e;
						};

						instance.run( {} );
					},
					new Error( random ),
				);
			} );

			QUnit.test( 'onCatchApply()', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new CommandBaseMock();

						instance.apply = () => {
							throw new Error( random );
						};

						instance.run( {} );
					},
					new Error( random ),
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommand = ( command ) => {
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandBase, true );
				};

				validateCommand( new CommandBaseMock( {} ) );
				validateCommand( new CommandBaseExportedMock( {} ) );
			} );
		} );
	} );
} );

