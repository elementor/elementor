import CommandInfra from 'elementor-api/modules/command-infra';
import Command from 'elementor-api/modules/command';
import CommandInternal from 'elementor-api/modules/command-internal';
import CommandData from 'elementor-api/modules/command-data';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-internal.js', () => {
		QUnit.module( 'CommandInternal', ( hooks ) => {
			hooks.beforeEach( () => $e.components.isRegistering = true );

			hooks.afterEach( () => $e.components.isRegistering = false );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const validateInternalCommand = ( internalCommand ) => {
						assert.equal( internalCommand instanceof CommandInfra, true, );
						assert.equal( internalCommand instanceof Command, true, );
						assert.equal( internalCommand instanceof CommandInternal, true );
						assert.equal( internalCommand instanceof CommandData, false );
						assert.equal( internalCommand instanceof $e.modules.Command, true );
						assert.equal( internalCommand instanceof $e.modules.CommandInternal, true );
						assert.equal( internalCommand instanceof $e.modules.CommandData, false );
					};

				validateInternalCommand( new CommandInternal( {} ) );
				validateInternalCommand( new $e.modules.CommandInternal( {} ) );
			} );
		} );
	} );
} );

