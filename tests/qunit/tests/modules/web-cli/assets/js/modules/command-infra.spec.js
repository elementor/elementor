import CommandInfra from 'elementor-api/modules/command-infra';
import CommandInfraMock from './mock/command-infra.spec';

jQuery( () => {
	QUnit.module( 'File: modules/web-cli/assets/js/modules/command-infra.js', () => {
		QUnit.module( 'CommandInfra', () => {
			QUnit.test( 'constructor(): Doing it wrong', ( assert ) => {
				assert.throws(
					() => new CommandInfra( {} ),
					new RangeError( 'Doing it wrong: Each command type should have `registerConfig`.' ),
				);
			} );

			QUnit.test( 'apply(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new CommandInfraMock( {} );

						instance.apply( {} );
					},
					new Error( 'CommandInfraMock.apply() should be implemented, please provide \'apply\' functionality.' ),
				);
			} );

			QUnit.test( 'instanceOf(): validation', ( assert ) => {
				const commandInfra = new CommandInfraMock( {} );

				assert.equal( commandInfra instanceof CommandInfra, true );
			} );
		} );
	} );
} );

