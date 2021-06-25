import CommandInfra from 'elementor-api/modules/command-infra';
import CommandBase from 'elementor-api/modules/command-base';
import CommandInternalBase from 'elementor-api/modules/command-internal-base';
import CommandData from 'elementor-api/modules/command-data';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-internal-base.js', () => {
		QUnit.module( 'CommandInternalBase', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );
			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateInternalCommand = ( internalCommand ) => {
						assert.equal( internalCommand instanceof CommandInfra, true, );
						assert.equal( internalCommand instanceof CommandBase, true, );
						assert.equal( internalCommand instanceof CommandInternalBase, true );
						assert.equal( internalCommand instanceof CommandData, false );
						assert.equal( internalCommand instanceof $e.modules.CommandBase, true );
						assert.equal( internalCommand instanceof $e.modules.CommandInternalBase, true );
						assert.equal( internalCommand instanceof $e.modules.CommandData, false );
					};

				validateInternalCommand( new CommandInternalBase( {} ) );
				validateInternalCommand( new $e.modules.CommandInternalBase( {} ) );
			} );
		} );
	} );
} );

