import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandInternalBaseMock, { CommandInternalBaseExportedMock } from './mock/command-internal-base.spec';

jQuery( () => {
	QUnit.module( 'File: modules/web-cli/assets/js/modules/command-internal-base.js', () => {
		QUnit.module( 'CommandInternalBase', () => {
			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateCommand = ( command ) => {
					assert.equal( command instanceof CommandInfra, true );
					assert.equal( command instanceof CommandBase, true );
					assert.equal( command instanceof CommandInternalBase, true );
					assert.equal( command instanceof $e.modules.CommandBase, true );
					assert.equal( command instanceof $e.modules.CommandInternalBase, true );
				};

				validateCommand( new CommandInternalBaseMock( {} ) );
				validateCommand( new CommandInternalBaseExportedMock( {} ) );
			} );
		} );
	} );
} );

